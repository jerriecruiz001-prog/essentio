import { NextResponse } from "next/server";

const TIKTOK_EVENTS_API_URL =
  "https://business-api.tiktok.com/open_api/v1.3/pixel/track/";

type RequestBody = {
  event?: string;
  params?: Record<string, unknown>;
};

function firstForwardedIp(value: string | null): string | undefined {
  return value?.split(",")[0]?.trim() || undefined;
}

function compactObject<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
}

function normalizeProperties(
  params: Record<string, unknown>
): Record<string, unknown> {
  const {
    page_url: _pageUrl,
    page_path: _pagePath,
    page_search: _pageSearch,
    page_title: _pageTitle,
    event_id: _eventId,
    ...rest
  } = params;
  return compactObject(rest);
}

export async function POST(request: Request) {
  const accessToken =
    process.env.TIKTOK_EVENTS_ACCESS_TOKEN ?? process.env.TIKTOK_ACCESS_TOKEN;
  const pixelCode =
    process.env.TIKTOK_PIXEL_ID ?? process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const testEventCode = process.env.TIKTOK_TEST_EVENT_CODE;

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

  const pageUrl =
    typeof params.page_url === "string" && params.page_url
      ? params.page_url
      : request.headers.get("referer") ?? undefined;

  const payload = compactObject({
    pixel_code: pixelCode,
    event,
    event_id:
      typeof params.event_id === "string" && params.event_id
        ? params.event_id
        : crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    context: compactObject({
      page: pageUrl ? { url: pageUrl } : undefined,
      ip: firstForwardedIp(request.headers.get("x-forwarded-for")),
      user_agent: request.headers.get("user-agent") ?? undefined,
    }),
    properties: normalizeProperties(params),
    test_event_code: testEventCode || undefined,
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

  return NextResponse.json(
    {
      ok: response.ok,
      status: response.status,
      data,
    },
    { status: response.ok ? 200 : 502 }
  );
}
