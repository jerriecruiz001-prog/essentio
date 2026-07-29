export type TiktokCurrency = "NGN" | "USD" | "EUR" | "GBP" | string;

export interface TiktokContentItem {
  content_id: string;
  content_name?: string;
  content_category?: string;
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
    params?: Record<string, unknown>
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
const dedupeCache = new Map<TrackedEventKey, number>();

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof document !== "undefined"
  );
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
    const stable = JSON.stringify(params, Object.keys(params).sort());
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

  sdkInstalled = true;
}

export function registerEventsBackend(
  backend: TiktokEventsBackend
): () => void {
  backendPlugins = backendPlugins.concat(backend);
  return () => {
    backendPlugins = backendPlugins.filter((b) => b !== backend);
  };
}

function dispatchToBackends(
  fn: (b: TiktokEventsBackend) => void | Promise<void>
): void {
  if (backendPlugins.length === 0) return;
  for (const b of backendPlugins) {
    try {
      Promise.resolve(fn(b)).catch((err) => {
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
}

export function init(): void {
  if (!isBrowser()) return;
  installPixelScript();
}

export function page(params?: Record<string, unknown>): void {
  if (!isBrowser()) return;
  init();
  const ttq = window.ttq;
  if (ttq && typeof ttq.page === "function") {
    try {
      ttq.page(params || {});
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[tiktok] page() failed:", err);
      }
    }
  }
  dispatchToBackends((b) => {
    if (typeof b.page === "function") return b.page(params || {});
    return b.track("PageView", params || {});
  });
}

function track(
  event: TiktokStandardEventName | string,
  params: Record<string, unknown> = {}
): void {
  if (!isBrowser()) return;
  if (isDuplicateEvent(eventKey(event, params))) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[tiktok] deduped:", event);
    }
    return;
  }
  init();
  const ttq = window.ttq;
  if (ttq && typeof ttq.track === "function") {
    try {
      ttq.track(event, params);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[tiktok] track(${event}) failed:`, err);
      }
    }
  }
  dispatchToBackends((b) => b.track(event, params));
}

export function viewContent(p: ViewContentParams): void {
  const contents =
    p.contents ??
    ([
      {
        content_id: p.content_id,
        content_name: p.content_name ?? p.product_name,
        content_category: p.content_category ?? p.category,
        quantity: 1,
        price: p.price,
      },
    ] as TiktokContentItem[]);
  track("ViewContent", {
    content_id: p.content_id,
    content_type: p.content_type ?? "product",
    content_name: p.content_name ?? p.product_name,
    content_category: p.content_category ?? p.category,
    product_name: p.product_name,
    category: p.category,
    price: p.price,
    currency: p.currency,
    value: p.value ?? p.price,
    contents,
  });
}

export function addToCart(p: AddToCartParams): void {
  const qty = Math.max(1, p.quantity || 1);
  const contents =
    p.contents ??
    ([
      {
        content_id: p.content_id,
        content_name: p.product_name,
        content_category: p.content_category,
        quantity: qty,
        price: p.price,
      },
    ] as TiktokContentItem[]);
  track("AddToCart", {
    content_id: p.content_id,
    content_type: p.content_type ?? "product",
    content_category: p.content_category,
    product_name: p.product_name,
    quantity: qty,
    price: p.price,
    currency: p.currency,
    value: p.value ?? p.price * qty,
    contents,
  });
}

export function initiateCheckout(p: InitiateCheckoutParams): void {
  track("InitiateCheckout", {
    content_type: p.content_type ?? "product_group",
    total_price: p.total_price,
    value: p.value ?? p.total_price,
    currency: p.currency,
    number_of_items: p.number_of_items,
    contents: p.contents ?? [],
  });
}

export function purchase(p: PurchaseParams): void {
  const PURCHASE_TTL_MS = 60_000;
  const key = `__tiktok_purchase_sent:${p.order_id}`;
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const existing = window.sessionStorage.getItem(key);
      if (existing) return;
      window.sessionStorage.setItem(key, String(Date.now() + PURCHASE_TTL_MS));
    }
    const dedupeK = `purchase:${p.order_id}`;
    if (dedupeCache.get(dedupeK)) return;
    dedupeCache.set(dedupeK, Date.now());
  } catch {
    /* sessionStorage unavailable (private mode etc.) */
  }
  const qty =
    p.quantity ??
    p.contents.reduce(
      (acc: number, c: TiktokContentItem) => acc + (c.quantity ?? 0),
      0
    );
  track("Purchase", {
    content_type: p.content_type ?? "product_group",
    order_id: p.order_id,
    value: p.value,
    currency: p.currency,
    contents: p.contents,
    quantity: qty,
    num_items: qty,
  });
}

export function contact(params?: Record<string, unknown>): void {
  track("Contact", params ?? {});
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
  dispatchToBackends((b) => {
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
};

export default tiktok;
