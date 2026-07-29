export type TiktokCurrency = "NGN" | "USD" | "EUR" | "GBP" | string;

export interface TiktokContentItem {
  content_id: string;
  content_name?: string;
  content_category?: string;
  content_type?: "product" | "product_group";
  quantity?: number;
  price?: number;
}

export interface ViewContentParams {
  content_id: string;
  product_name: string;
  category?: string;
  price: number;
  currency: TiktokCurrency;
  content_category?: string;
  content_name?: string;
  contents?: TiktokContentItem[];
  content_type?: "product" | "product_group";
  value?: number;
}

export interface AddToCartParams {
  content_id: string;
  product_name: string;
  quantity: number;
  price: number;
  currency: TiktokCurrency;
  content_category?: string;
  contents?: TiktokContentItem[];
  content_type?: "product" | "product_group";
  value?: number;
}

export interface InitiateCheckoutParams {
  total_price: number;
  currency: TiktokCurrency;
  number_of_items: number;
  contents?: TiktokContentItem[];
  content_type?: "product" | "product_group";
  value?: number;
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
}

export interface PurchaseParams {
  order_id: string;
  value: number;
  currency: TiktokCurrency;
  contents: TiktokContentItem[];
  quantity?: number;
  content_type?: "product" | "product_group";
}

export interface IdentifyParams {
  external_id?: string;
  phone_number?: string;
  email?: string;
  [key: string]: string | undefined;
}

export type TiktokStandardEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "CompletePayment"
  | "PlaceAnOrder"
  | "AddToWishlist"
  | "AddPaymentInfo"
  | "Search"
  | "CompleteRegistration"
  | "Contact"
  | "CustomizeProduct"
  | "Donate"
  | "FindLocation"
  | "Schedule"
  | "StartTrial"
  | "SubmitApplication"
  | "Subscribe"
  | "ClickButton"
  | "PageView";

export interface TiktokEventsBackend {
  track<T extends TiktokStandardEventName | string>(
    event: T,
    params?: Record<string, unknown>
  ): void | Promise<void>;
  page?(params?: Record<string, unknown>): void | Promise<void>;
  identify?(params: IdentifyParams): void | Promise<void>;
}

declare global {
  interface Window {
    ttq?: TiktokBrowserPixelApi;
    TiktokAnalyticsObject?: "ttq" | string;
  }
}

export interface TiktokBrowserPixelApi {
  page: (params?: Record<string, unknown>) => void;
  track: (
    event: TiktokStandardEventName | string,
    params?: Record<string, unknown>,
    options?: { event_id?: string }
  ) => void;
  identify: (params: IdentifyParams) => void;
  load: (pixelId: string, options?: Record<string, unknown>) => void;
  instance?: (name?: string) => TiktokBrowserPixelApi;
  debug?: (flag?: boolean) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
  once: (event: string, callback: (...args: unknown[]) => void) => void;
  ready: (callback: (...args: unknown[]) => void) => void;
  alias: (alias: string, original?: string) => void;
  group: (groupId: string, traits?: Record<string, unknown>) => void;
  enableCookie: () => void;
  disableCookie: () => void;
  holdConsent: () => void;
  revokeConsent: () => void;
  grantConsent: () => void;
  methods?: readonly string[];
  setAndDefer?: (
    target: Record<string, unknown>,
    method: TtMethodName
  ) => void;
  _i?: Record<string, unknown>;
  _t?: Record<string, number>;
  _o?: Record<string, unknown>;
  [method: string]: unknown;
}

const PIXEL_ID_ENV = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
const PIXEL_SDK_URL =
  "https://analytics.tiktok.com/i18n/pixel/events.js";
const DEDUPE_TTL_MS = 1500;
const TTCLID_COOKIE = "ttclid";
const TTP_COOKIE = "_ttp";
const TEST_EVENT_QUERY_PARAMS = ["tt_test_event_code", "test_event_code"];

type TrackedEventKey = string;

const TT_METHODS = [
  "page",
  "track",
  "identify",
  "instances",
  "debug",
  "on",
  "off",
  "once",
  "ready",
  "alias",
  "group",
  "enableCookie",
  "disableCookie",
  "holdConsent",
  "revokeConsent",
  "grantConsent",
] as const;

type TtMethodTuple = typeof TT_METHODS;
type TtMethodName = TtMethodTuple[number];

let sdkInstalled = false;
let backendPlugins: TiktokEventsBackend[] = [];
let pendingBackendDispatches: Array<
  (backend: TiktokEventsBackend) => void | Promise<void>
> = [];
const dedupeCache = new Map<TrackedEventKey, number>();

function createEventId(): string {
  if (
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    typeof globalThis.crypto?.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `tt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function ensureEventId(
  params: Record<string, unknown>
): Record<string, unknown> {
  const existing = params.event_id;
  if (typeof existing === "string" && existing.trim()) {
    return params;
  }
  return {
    ...params,
    event_id: createEventId(),
  };
}

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof document !== "undefined"
  );
}

function getCookie(name: string): string | undefined {
  if (!isBrowser()) return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, days = 90): void {
  if (!isBrowser()) return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function captureTtclidFromUrl(): string | undefined {
  if (!isBrowser()) return undefined;
  try {
    const url = new URL(window.location.href);
    const ttclid = url.searchParams.get("ttclid")?.trim();
    if (ttclid) {
      setCookie(TTCLID_COOKIE, ttclid);
      try {
        window.sessionStorage.setItem(TTCLID_COOKIE, ttclid);
      } catch {
        /* ignore */
      }
      return ttclid;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

function getTtclid(): string | undefined {
  const fromUrl = captureTtclidFromUrl();
  if (fromUrl) return fromUrl;
  const fromCookie = getCookie(TTCLID_COOKIE);
  if (fromCookie) return fromCookie;
  try {
    return window.sessionStorage.getItem(TTCLID_COOKIE) || undefined;
  } catch {
    return undefined;
  }
}

function getTtp(): string | undefined {
  return getCookie(TTP_COOKIE);
}

function getTestEventCodeFromUrl(): string | undefined {
  if (!isBrowser()) return undefined;
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_TIKTOK_ENABLE_TEST_EVENTS !== "true"
  ) {
    return undefined;
  }
  try {
    const url = new URL(window.location.href);
    return (
      url.searchParams.get("tt_test_event_code")?.trim() ||
      url.searchParams.get("test_event_code")?.trim() ||
      undefined
    );
  } catch {
    return undefined;
  }
}

function allowTestEvents(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_TIKTOK_ENABLE_TEST_EVENTS === "true"
  );
}

function sanitizeUrlForProduction(value: string): string {
  if (allowTestEvents()) return value;
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

function sanitizeSearchForProduction(value: string): string {
  if (allowTestEvents() || !value) return value;
  try {
    const params = new URLSearchParams(value.startsWith("?") ? value.slice(1) : value);
    for (const param of TEST_EVENT_QUERY_PARAMS) {
      params.delete(param);
    }
    const next = params.toString();
    return value.startsWith("?") ? (next ? `?${next}` : "") : next;
  } catch {
    return value;
  }
}

export function getEventContext(): Record<string, unknown> {
  if (!isBrowser()) return {};
  const pageUrl = sanitizeUrlForProduction(window.location.href);
  return {
    page_url: pageUrl,
    event_source_url: pageUrl,
    page_path: window.location.pathname,
    page_search: sanitizeSearchForProduction(window.location.search),
    page_title: document.title,
    page_referrer: document.referrer || undefined,
    ttclid: getTtclid(),
    ttp: getTtp(),
    test_event_code: getTestEventCodeFromUrl(),
  };
}

function getTiktokPixelId(): string | undefined {
  if (isBrowser()) {
    const runtime = (window as unknown as Record<string, unknown>)[
      "__NEXT_DATA__"
    ] as
      | { runtimeConfig?: { publicRuntimeConfig?: Record<string, string> } }
      | undefined;
    const fromRuntime =
      runtime?.runtimeConfig?.publicRuntimeConfig?.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
    if (fromRuntime) return fromRuntime;
  }
  return PIXEL_ID_ENV;
}

function eventKey(
  event: TiktokStandardEventName | string,
  params?: Record<string, unknown>
): TrackedEventKey {
  if (!params) return event;
  try {
    const { event_id: _eventId, ...rest } = params;
    const stable = JSON.stringify(rest, Object.keys(rest).sort());
    return `${event}:${stable}`;
  } catch {
    return event;
  }
}

function isDuplicateEvent(key: TrackedEventKey): boolean {
  const now = Date.now();
  const last = dedupeCache.get(key);
  if (last !== undefined && now - last < DEDUPE_TTL_MS) {
    return true;
  }
  dedupeCache.set(key, now);
  if (dedupeCache.size > 256) {
    const cutoff = now - DEDUPE_TTL_MS;
    for (const [k, v] of dedupeCache) {
      if (v < cutoff) dedupeCache.delete(k);
    }
  }
  return false;
}

function ensureBrowserTtq(): TiktokBrowserPixelApi | undefined {
  if (!isBrowser()) return undefined;

  const w = window;
  const t = "ttq";
  if (!w.TiktokAnalyticsObject) {
    w.TiktokAnalyticsObject = t;
  }

  if (!w.ttq) {
    const ttq = [] as unknown as TiktokBrowserPixelApi;

    const setAndDefer = (obj: Record<string, unknown>, method: TtMethodName): void => {
      obj[method] = function (...args: unknown[]) {
        (obj as unknown as Array<unknown[]>).push([method, ...args]);
      };
    };

    ttq.methods = TT_METHODS;
    ttq.setAndDefer = setAndDefer;

    for (let i = 0; i < TT_METHODS.length; i++) {
      setAndDefer(ttq as unknown as Record<string, unknown>, TT_METHODS[i]);
    }

    (ttq as unknown as Record<string, unknown>).instance = function instanceFn(
      instanceName: string
    ): TiktokBrowserPixelApi {
      ttq._i = ttq._i || {};
      const instance = (ttq._i[instanceName] || []) as unknown as Record<string, unknown>;
      for (let n = 0; n < TT_METHODS.length; n++) {
        setAndDefer(instance, TT_METHODS[n]);
      }
      ttq._i[instanceName] = instance;
      return instance as unknown as TiktokBrowserPixelApi;
    };

    ttq.load = function load(pixelId: string, options?: Record<string, unknown>): void {
      ttq._i = ttq._i || {};
      ttq._i[pixelId] = ttq._i[pixelId] || [];
      (ttq._i[pixelId] as Record<string, unknown>)._u = PIXEL_SDK_URL;

      ttq._t = ttq._t || {};
      ttq._t[pixelId] = Date.now();

      ttq._o = ttq._o || {};
      ttq._o[pixelId] = options || {};

      const existing = document.querySelector<HTMLScriptElement>(
        `script[data-tiktok-sdk="${pixelId}"]`
      );
      if (!existing) {
        const script = document.createElement("script");
        script.async = true;
        script.type = "text/javascript";
        script.dataset.tiktokSdk = pixelId;
        script.src = `${PIXEL_SDK_URL}?sdkid=${encodeURIComponent(pixelId)}&lib=${t}`;
        const first = document.getElementsByTagName("script")[0];
        if (first?.parentNode) {
          first.parentNode.insertBefore(script, first);
        } else {
          document.head.appendChild(script);
        }
      }
    };

    w.ttq = ttq;
  }

  return w.ttq;
}

function installPixelScript(): void {
  if (!isBrowser()) return;
  if (sdkInstalled) return;

  const pixelId = getTiktokPixelId();
  if (!pixelId) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[tiktok] NEXT_PUBLIC_TIKTOK_PIXEL_ID is not set; skipping pixel install."
      );
    }
    sdkInstalled = true;
    return;
  }

  const ttq = ensureBrowserTtq();
  if (!ttq) return;

  if (typeof ttq.load === "function") {
    ttq.load(pixelId);
  }

  captureTtclidFromUrl();
  sdkInstalled = true;
}

export function registerEventsBackend(
  backend: TiktokEventsBackend
): () => void {
  backendPlugins = backendPlugins.concat(backend);
  if (pendingBackendDispatches.length > 0) {
    for (const dispatch of pendingBackendDispatches) {
      try {
        Promise.resolve(dispatch(backend)).catch((err) => {
          if (process.env.NODE_ENV !== "production") {
            console.error("[tiktok] backend dispatch error:", err);
          }
        });
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[tiktok] backend dispatch error:", err);
        }
      }
    }
    pendingBackendDispatches = [];
  }
  return () => {
    backendPlugins = backendPlugins.filter((b) => b !== backend);
  };
}

function dispatchToBackends(
  fn: (b: TiktokEventsBackend) => void | Promise<void>
): Promise<void> {
  if (backendPlugins.length === 0) {
    pendingBackendDispatches = pendingBackendDispatches.concat(fn).slice(-25);
    return Promise.resolve();
  }

  return Promise.all(
    backendPlugins.map(async (b) => {
      try {
        await Promise.resolve(fn(b));
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[tiktok] backend dispatch error:", err);
        }
      }
    })
  ).then(() => undefined);
}

export function init(): void {
  if (!isBrowser()) return;
  installPixelScript();
}

function withContext(params: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ...params,
    ...getEventContext(),
  };
}

export function page(params?: Record<string, unknown>): Promise<void> {
  if (!isBrowser()) return Promise.resolve();
  init();
  const eventParams = ensureEventId(withContext(params || {}));
  const { event_id: _eventId, ...pageParams } = eventParams;

  const ttq = window.ttq;
  if (ttq && typeof ttq.page === "function") {
    try {
      ttq.page(pageParams);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[tiktok] page() failed:", err);
      }
    }
  }

  return dispatchToBackends((b) => {
    if (typeof b.page === "function") return b.page(eventParams);
    return b.track("PageView", eventParams);
  });
}

function track(
  event: TiktokStandardEventName | string,
  params: Record<string, unknown> = {}
): Promise<void> {
  if (!isBrowser()) return Promise.resolve();
  const contextualParams = withContext(params);
  if (isDuplicateEvent(eventKey(event, contextualParams))) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[tiktok] deduped:", event);
    }
    return Promise.resolve();
  }

  const eventParams = ensureEventId(contextualParams);
  const { event_id: eventId, ...properties } = eventParams;

  init();
  const ttq = window.ttq;
  if (ttq && typeof ttq.track === "function") {
    try {
      // TikTok requires event_id as the 3rd argument for Pixel ↔ Events API dedupe.
      ttq.track(event, properties, { event_id: String(eventId) });
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[tiktok] track(${event}) failed:`, err);
      }
    }
  }

  return dispatchToBackends((b) => b.track(event, eventParams));
}

function normalizeContents(
  contents: TiktokContentItem[],
  contentType: "product" | "product_group" = "product"
): TiktokContentItem[] {
  return contents.map((item) => ({
    ...item,
    content_type: item.content_type ?? contentType,
    quantity: Math.max(1, item.quantity ?? 1),
  }));
}

export function viewContent(p: ViewContentParams): Promise<void> {
  const contentType = p.content_type ?? "product";
  const contents = normalizeContents(
    p.contents ??
      [
        {
          content_id: p.content_id,
          content_name: p.content_name ?? p.product_name,
          content_category: p.content_category ?? p.category,
          quantity: 1,
          price: p.price,
        },
      ],
    contentType
  );

  return track("ViewContent", {
    contents,
    content_ids: contents.map((item) => item.content_id),
    content_type: contentType,
    content_id: p.content_id,
    content_name: p.content_name ?? p.product_name,
    content_category: p.content_category ?? p.category,
    currency: p.currency,
    value: p.value ?? p.price,
  });
}

export function addToCart(p: AddToCartParams): Promise<void> {
  const qty = Math.max(1, p.quantity || 1);
  const contentType = p.content_type ?? "product";
  const contents = normalizeContents(
    p.contents ??
      [
        {
          content_id: p.content_id,
          content_name: p.product_name,
          content_category: p.content_category,
          quantity: qty,
          price: p.price,
        },
      ],
    contentType
  );

  return track("AddToCart", {
    contents,
    content_ids: contents.map((item) => item.content_id),
    content_type: contentType,
    content_id: p.content_id,
    currency: p.currency,
    value: p.value ?? p.price * qty,
  });
}

export function initiateCheckout(p: InitiateCheckoutParams): Promise<void> {
  const contents = normalizeContents(p.contents ?? [], "product");
  const contentIds =
    p.content_ids?.filter(Boolean) ??
    contents.map((item) => item.content_id).filter(Boolean);
  const contentType =
    p.content_type ?? (contentIds.length > 1 ? "product_group" : "product");
  const value = p.value ?? p.total_price;
  const contentName =
    p.content_name ??
    (contents.length === 1
      ? contents[0]?.content_name
      : contents.map((item) => item.content_name).filter(Boolean).join(", "));
  const contentCategory =
    p.content_category ??
    (contents.length === 1
      ? contents[0]?.content_category
      : contents.map((item) => item.content_category).filter(Boolean).join(", "));

  return track("InitiateCheckout", {
    contents: normalizeContents(contents, contentType),
    content_ids: contentIds,
    content_type: contentType,
    content_id: contentIds.length === 1 ? contentIds[0] : undefined,
    content_name: contentName || undefined,
    content_category: contentCategory || undefined,
    currency: p.currency,
    value,
    quantity: p.number_of_items,
  });
}

export function purchase(p: PurchaseParams): Promise<void> {
  const PURCHASE_TTL_MS = 60_000;
  const key = `__tiktok_purchase_sent:${p.order_id}`;
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const existing = window.sessionStorage.getItem(key);
      if (existing) return Promise.resolve();
      window.sessionStorage.setItem(key, String(Date.now() + PURCHASE_TTL_MS));
    }
    const dedupeK = `purchase:${p.order_id}`;
    if (dedupeCache.get(dedupeK)) return Promise.resolve();
    dedupeCache.set(dedupeK, Date.now());
  } catch {
    /* sessionStorage unavailable (private mode etc.) */
  }

  const contentType = p.content_type ?? "product";
  const contents = normalizeContents(p.contents, contentType);
  const qty =
    p.quantity ??
    contents.reduce(
      (acc: number, c: TiktokContentItem) => acc + (c.quantity ?? 0),
      0
    );

  return track("CompletePayment", {
    contents,
    content_ids: contents.map((item) => item.content_id),
    content_type: contentType,
    currency: p.currency,
    value: p.value,
    quantity: qty,
    order_id: p.order_id,
  });
}

export function contact(params?: Record<string, unknown>): Promise<void> {
  return track("Contact", params ?? {});
}

export function identify(params: IdentifyParams): void {
  if (!isBrowser()) return;
  init();
  const ttq = window.ttq;
  if (ttq && typeof ttq.identify === "function") {
    try {
      ttq.identify(params);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[tiktok] identify() failed:", err);
      }
    }
  }
  void dispatchToBackends((b) => {
    if (typeof b.identify === "function") return b.identify(params);
    return b.track("Identify", params as unknown as Record<string, unknown>);
  });
}

export const tiktok = {
  init,
  page,
  viewContent,
  addToCart,
  initiateCheckout,
  purchase,
  contact,
  identify,
  registerEventsBackend,
  getPixelId: getTiktokPixelId,
  getEventContext,
};

export default tiktok;
