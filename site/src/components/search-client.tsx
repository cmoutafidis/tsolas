"use client";

import { useEffect, useRef, useState } from "react";

// Pagefind is generated into /pagefind/ by the `pagefind` CLI after `next build`.
// It does not exist during `next dev`, so we load it at runtime and degrade
// gracefully if it is missing.
declare global {
  interface Window {
    PagefindUI?: new (opts: Record<string, unknown>) => {
      triggerSearch?: (q: string) => void;
    };
  }
}

function loadAsset(kind: "css" | "js", href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (kind === "css") {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      l.onload = () => resolve();
      l.onerror = () => reject(new Error(href));
      document.head.appendChild(l);
    } else {
      const s = document.createElement("script");
      s.src = href;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(href));
      document.body.appendChild(s);
    }
  });
}

export function SearchClient() {
  const mounted = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const q = new URLSearchParams(window.location.search).get("q") ?? "";

    (async () => {
      try {
        await loadAsset("css", "/pagefind/pagefind-ui.css");
        await loadAsset("js", "/pagefind/pagefind-ui.js");
        if (!window.PagefindUI) throw new Error("PagefindUI missing");
        const ui = new window.PagefindUI({
          element: "#pagefind-search",
          showSubResults: true,
          showImages: false,
          pageSize: 10,
          resetStyles: false,
          translations: {
            placeholder: "Αναζήτηση στα άρθρα…",
            zero_results: "Κανένα αποτέλεσμα για «[SEARCH_TERM]»",
            many_results: "[COUNT] αποτελέσματα για «[SEARCH_TERM]»",
            one_result: "[COUNT] αποτέλεσμα για «[SEARCH_TERM]»",
            searching: "Αναζήτηση…",
            load_more: "Περισσότερα αποτελέσματα",
            clear_search: "Καθαρισμός",
          },
        });
        setStatus("ready");
        if (q) {
          const input = document.querySelector<HTMLInputElement>(
            "#pagefind-search input[type='text']",
          );
          if (input) {
            input.value = q;
            input.dispatchEvent(new Event("input", { bubbles: true }));
          }
          ui.triggerSearch?.(q);
        }
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  return (
    <div className="pagefind-ui">
      <div id="pagefind-search" />
      {status === "error" && (
        <p className="mt-4 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Ο δείκτης αναζήτησης δεν είναι διαθέσιμος σε αυτό το περιβάλλον. Η αναζήτηση
          λειτουργεί στην τελική (build) έκδοση του ιστότοπου.
        </p>
      )}
    </div>
  );
}
