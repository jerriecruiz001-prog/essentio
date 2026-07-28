"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import tiktok from "../lib/tiktok";

let globalInstalled = false;

export default function TikTokPixel(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSeenRef = useRef<string | null>(null);

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
        tiktok.page({
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
