// src/hooks/theme/useAccentColor.js
import { useEffect } from "react";
import useLocalStorageState from "../useLocalStorageState";

// Define all accent colors in JavaScript (no CSS dependency)
const ACCENT_COLORS = [
  "var(--main-accent)",
  "var(--color-teal-500)",
  "var(--color-emerald-500)",
  "var(--color-lime-500)",
  "var(--color-red-500)",
  "var(--color-pink-500)",
  "var(--color-orange-500)",
  "#722F37", // Wine (for night time)
];

export function useAccentColor() {
  const [accent, setAccent] = useLocalStorageState(
    "accent",
    () => ACCENT_COLORS[0],
    {
      raw: true,
      validate: (v) => ACCENT_COLORS.includes(v),
    }
  );

  // Keep CSS var in sync
  useEffect(() => {
    if (!accent) return;
    document.documentElement.style.setProperty("--color-accent", accent);
  }, [accent]);

  return [accent, setAccent, ACCENT_COLORS];
}

export { ACCENT_COLORS };
