// src/hooks/theme/UseMode.js
import { useEffect, useMemo } from "react";
import useLocalStorageState from "../useLocalStorageState";

/**
 * Theme hook — mirrors how accent color is handled:
 * - Sets `data-theme` + `color-scheme` on <html>
 * - Updates CSS var `--color-bg` for the <meta name="theme-color"> updater
 * - Persists the user’s choice in localStorage
 */
export function UseMode() {
  // Initial: localStorage > OS preference (light?) > dark fallback
  const [theme, setTheme] = useLocalStorageState(
    "theme",
    () => {
      try {
        return window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
      } catch {
        return "dark";
      }
    },
    { raw: true, validate: (v) => v === "light" || v === "dark" }
  );

  const isLight = theme === "light";
  const setIsLight = (val) => setTheme(val ? "light" : "dark");

  // Apply to <html> whenever it changes
  useEffect(() => {
    const root = document.documentElement;
    const t = isLight ? "light" : "dark";

    root.setAttribute("data-theme", t);
    root.style.colorScheme = t;

    // Keep CSS var in sync so the head script updates <meta name="theme-color">
    root.style.setProperty("--color-bg", t === "light" ? "#fafafa" : "#000000");
  }, [isLight]);

  // Follow OS changes only if user hasn't explicitly saved a preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e) => {
      try {
        const stored = localStorage.getItem("theme");
        if (stored !== "light" && stored !== "dark") {
          setTheme(e.matches ? "light" : "dark");
        }
      } catch {}
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [setTheme]);

  return [isLight, setIsLight];
}
