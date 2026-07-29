import { NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";

const TIKTOK_EVENTS_API_URL =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";
const TEST_EVENT_QUERY_PARAMS = ["tt_test_event_code", "test_event_code"];

type RequestBody = {
  event?: string;
  params?: Record<string, unknown>;
};

type TikTokContentItem = {
  content_id?: string;
  content_name?: string;
  content_category?: string;
  content_type?: string;
  quantity?: number;
  price?: number;
  status?: string;
};

function firstForwardedIp(value: string | null): string | undefined {
  return value?.split(",")[0]?.trim() || undefined;
}

function compactObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry === undefined || entry === null || entry === "") return false;
      if (Array.isArray(entry) && entry.length === 0) return false;
      return true;
    })
  ) as T;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeHashedIdentity(value: unknown): string | undefined {
  const raw = asString(value);
  if (!raw) return undefined;
  // Already hashed (client-side SHA-256 hex).
  if (/^[a-f0-9]{64}$/i.test(raw)) return raw.toLowerCase();
  return sha256Hex(raw.trim().toLowerCase());
}

function normalizePhone(value: unknown): string | undefined {
  const raw = asString(value);
  if (!raw) return undefined;
  if (/^[a-f0-9]{64}$/i.test(raw)) return raw.toLowerCase();
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits) return undefined;
  return sha256Hex(digits);
}

function compactArray<T>(value: Array<T | undefined>): T[] | undefined {
  const entries = value.filter((entry): entry is T => Boolean(entry));
  return entries.length ? entries : undefined;
}

function normalizeContents(value: unknown): TikTokContentItem[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const contents = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const item = entry as Record<string, unknown>;
      const contentId = asString(item.content_id);
      if (!contentId) return null;

      return compactObject({
        content_id: contentId,
        content_name: asString(item.content_name),
        content_category: asString(item.content_category),
        content_type:
          asString(item.content_type) === "product_group"
            ? "product_group"
            : "product",
        quantity: asNumber(item.quantity) ?? 1,
        price: asNumber(item.price),
        status: asString(item.status),
      }) as TikTokContentItem;
    })
    .filter(Boolean) as TikTokContentItem[];

  return contents.length ? contents : undefined;
}

function buildProperties(params: Record<string, unknown>): Record<string, unknown> {
  const contents = normalizeContents(params.contents);
  const contentIdsFromParam = Array.isArray(params.content_ids)
    ? params.content_ids
        .map((id) => asString(id))
        .filter((id): id is string => Boolean(id))
    : [];
  const contentIds =
    contentIdsFromParam.length > 0
      ? contentIdsFromParam
      : contents?.map((item) => item.content_id).filter(Boolean) ?? [];
  const explicitContentType = asString(params.content_type);
  const contentType =
    explicitContentType === "product_group"
      ? "product_group"
      : explicitContentType === "product"
        ? "product"
        : contents && contents.length > 1
          ? "product_group"
          : contents || contentIds.length
            ? "product"
            : undefined;

  const value =
    asNumber(params.value) ??
    asNumber(params.total_price) ??
    asNumber(params.price);
  const quantity =
    asNumber(params.quantity) ??
    asNumber(params.number_of_items) ??
    contents?.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const contentName =
    asString(params.content_name) ??
    (contents && contents.length === 1 ? contents[0]?.content_name : undefined);
  const contentCategory =
    asString(params.content_category) ??
    (contents && contents.length === 1 ? contents[0]?.content_category : undefined);

  return compactObject({
    contents,
    content_type: contentType,
    content_id:
      asString(params.content_id) ??
      (contentIds.length === 1 ? contentIds[0] : undefined),
    content_ids: contentIds.length ? contentIds : undefined,
    content_name: contentName,
    content_category: contentCategory,
    quantity,
    currency: asString(params.currency)?.toUpperCase(),
    value,
    description: asString(params.description),
    query: asString(params.query),
  });
}

function eventTimeSeconds(value: unknown): number {
  const raw = asString(value);
  if (!raw) return Math.floor(Date.now() / 1000);

  const numeric = Number(raw);
  if (Number.isFinite(numeric)) {
    return numeric > 10_000_000_000 ? Math.floor(numeric / 1000) : Math.floor(numeric);
  }

  const parsed = Date.parse(raw);
  return Number.isFinite(parsed)
    ? Math.floor(parsed / 1000)
    : Math.floor(Date.now() / 1000);
}

function allowTestEvents(): boolean {
  return (
    process.env.TIKTOK_ENABLE_TEST_EVENTS === "true" ||
    process.env.NODE_ENV !== "production"
  );
}

function sanitizeUrlForProduction(value: string | undefined): string | undefined {
  if (!value || allowTestEvents()) return value;
  try {
    const url = new URL(value);
    for (const param of TEST_EVENT_QUERY_PARAMS) {
      url.searchParams.delete(param);
    }
    return url.toString();
  } catch {
    return value;
  }
}

function resolveTestEventCode(params: Record<string, unknown>): string | undefined {
  // Never attach the env test code in production — those events stay in Test Events
  // only and will not make the dataset "ready for campaign".
  const enableEnvTest =
    process.env.TIKTOK_ENABLE_TEST_EVENTS === "true" ||
    process.env.NODE_ENV !== "production";
  if (!enableEnvTest) return undefined;

  const fromClient = asString(params.test_event_code);
  if (fromClient) return fromClient;

  return asString(process.env.TIKTOK_TEST_EVENT_CODE);
}

export async function POST(request: Request) {
  const accessToken =
    process.env.TIKTOK_EVENTS_ACCESS_TOKEN ?? process.env.TIKTOK_ACCESS_TOKEN;
  const pixelCode =
    process.env.TIKTOK_PIXEL_ID ?? process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

  if (!accessToken || !pixelCode) {
    return NextResponse.json(
      {
        ok: false,
        skipped: true,
        reason:
          "Set TIKTOK_EVENTS_ACCESS_TOKEN (or TIKTOK_ACCESS_TOKEN) and TIKTOK_PIXEL_ID to enable server-side TikTok events.",
      },
      { status: 202 }
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const event = body.event?.trim();
  const params = body.params ?? {};

  if (!event) {
    return NextResponse.json(
      { ok: false, error: "Event name is required." },
      { status: 400 }
    );
  }

  const pageUrl = sanitizeUrlForProduction(
    asString(params.event_source_url) ??
      asString(params.page_url) ??
      request.headers.get("referer") ??
      undefined
  );
  const referrer = sanitizeUrlForProduction(
    asString(params.page_referrer) ?? asString(params.referrer)
  );
  const ttclid = asString(params.ttclid);
  const ttp = asString(params.ttp);
  const testEventCode = resolveTestEventCode(params);
  const eventId = asString(params.event_id) ?? randomUUID();
  const userIp = firstForwardedIp(request.headers.get("x-forwarded-for"));
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const payload = compactObject({
    event_source: "web",
    event_source_id: pixelCode,
    data: [
      compactObject({
        event,
        event_time: eventTimeSeconds(params.timestamp),
        event_id: eventId,
        user: compactObject({
          email: compactArray([normalizeHashedIdentity(params.email)]),
          phone: compactArray([normalizePhone(params.phone_number ?? params.phone)]),
          external_id: compactArray([normalizeHashedIdentity(params.external_id)]),
          ttclid,
          ttp,
          ip: userIp,
          user_agent: userAgent,
        }),
        page: pageUrl
          ? compactObject({
              url: pageUrl,
              referrer,
            })
          : undefined,
        properties: buildProperties(params),
      }),
    ],
    test_event_code: testEventCode,
  });

  const response = await fetch(TIKTOK_EVENTS_API_URL, {
    method: "POST",
    headers: {
      "Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = text;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Keep the raw text so debugging is still possible.
  }

  const tiktokCode =
    data && typeof data === "object" && "code" in data
      ? (data as { code?: number }).code
      : undefined;
  const ok = response.ok && (tiktokCode === undefined || tiktokCode === 0);

  if (!ok && process.env.NODE_ENV !== "production") {
    console.error("[tiktok/events] TikTok API error:", {
      status: response.status,
      data,
      event,
      event_id: eventId,
    });
  }

  return NextResponse.json(
    {
      ok,
      status: response.status,
      pixel_code: pixelCode,
      event_source: "web",
      event_source_id: pixelCode,
      event_source_url: pageUrl,
      event,
      event_id: eventId,
      test_mode: Boolean(testEventCode),
      data,
    },
    { status: ok ? 200 : 502 }
  );
}
