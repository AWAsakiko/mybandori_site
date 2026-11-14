"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSearch } from "@/components/search-provider";

const STORAGE_KEY = "sakiko_easter_egg_shown";

export function SakikoEasterEgg() {
  const pathname = usePathname();
  const { openSearch } = useSearch();

  useEffect(() => {
    if (pathname !== "/characters/sakiko") {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      return;
    }
    let alreadyShown = false;
    try {
      alreadyShown = window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (alreadyShown) return;

    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      openSearch();
    }, 60_000);

    return () => {
      window.clearTimeout(timer);
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    };
  }, [pathname, openSearch]);

  return null;
}
