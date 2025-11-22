// src/hooks/theme/UseMode.js
import { useEffect } from "react";
import useLocalStorageState from "../useLocalStorageState";

/**
 * Theme hook:
 * - Sets `data-theme` and `color-scheme` on <html>
 * - Updates <meta name="theme-color"> from computed --color-bg (no manual var writes)
 * - Persists user choice; defaults to dark until user opts into light
 */
export function UseMode() {
  // Initial: localStorage > dark fallback
  const [theme, setTheme] = useLocalStorageState(
    "theme",
    () => "dark",
    { raw: true, validate: (v) => v === "light" || v === "dark" }
  );

  const isLight = theme === "light";
  const setIsLight = (val) => setTheme(val ? "light" : "dark");

  // Apply theme attributes to <html> and update theme-color meta
  useEffect(() => {
    const root = document.documentElement;
    const t = isLight ? "light" : "dark";

    // 1) reflect theme for CSS
    root.setAttribute("data-theme", t);
    root.style.colorScheme = t;

    // 2) read computed --color-bg and set meta[name="theme-color"]
    // This uses whatever your CSS currently resolves for --color-bg in this theme.
    const computed = getComputedStyle(root).getPropertyValue("--color-bg").trim();

    // ensure we have (some) value; browsers accept rgb(), hsl(), or hex
    if (computed) {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", computed);
    }
  }, [isLight]);

  return [isLight, setIsLight];
}
