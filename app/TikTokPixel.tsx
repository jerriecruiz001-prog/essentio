"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import tiktok from "../lib/tiktok";

let globalInstalled = false;

function enrichParams(params?: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(params ?? {}),
    ...tiktok.getEventContext(),
  };
}

async function postTikTokEvent(
  event: string,
  params?: Record<string, unknown>
): Promise<void> {
  const payload = JSON.stringify({
    event,
    params: enrichParams(params),
  });

  try {
    const response = await fetch("/api/tiktok/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
    });

    if (!response.ok && process.env.NODE_ENV !== "production") {
      const body = await response.text();
      console.error("[TikTokPixel] backend event rejected:", response.status, body);
    }
  } catch (err) {
    // Fallback for navigation races (WhatsApp redirect).
    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/tiktok/events", blob);
        return;
      }
    } catch {
      /* ignore */
    }

    if (process.env.NODE_ENV !== "production") {
      console.error("[TikTokPixel] backend event failed:", err);
    }
  }
}

export default function TikTokPixel(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSeenRef = useRef<string | null>(null);

  useEffect(() => {
    const unregister = tiktok.registerEventsBackend({
      track(event, params) {
        return postTikTokEvent(String(event), params);
      },
      page(params) {
        return postTikTokEvent("PageView", params);
      },
    });

    return unregister;
  }, []);

  useEffect(() => {
    if (!globalInstalled) {
      try {
        tiktok.init();
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[TikTokPixel] init failed:", err);
        }
      }
      globalInstalled = true;
    }

    const key = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : (pathname ?? "/");

    if (lastSeenRef.current !== key) {
      lastSeenRef.current = key;
      try {
        void tiktok.page({
          page_path: pathname ?? "/",
          page_search: searchParams?.toString() ?? "",
          page_url:
            typeof window !== "undefined" ? window.location.href : key,
          page_title:
            typeof document !== "undefined" ? document.title : undefined,
        });
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("[TikTokPixel] page() failed:", err);
        }
      }
    }
  }, [pathname, searchParams]);

  return null;
}
