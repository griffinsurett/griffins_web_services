// src/hooks/useAutoplay.js
import { useEffect, useRef, useCallback } from "react";

/**
 * Advances an index on a timer.
 * - autoplayTime: number | () => number (ms)
 * - schedule(): recompute delay and (re)start the timer
 */
export default function useAutoplay({
  totalItems,
  currentIndex,
  setIndex,
  autoplayTime = 3000,   // number | () => number
  loop = true,
  enabled = true,
}) {
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    if (totalItems <= 1) return;
    const next = currentIndex + 1;
    setIndex(next >= totalItems ? (loop ? 0 : totalItems - 1) : next);
  }, [currentIndex, setIndex, totalItems, loop]);

  const resolveDelay = useCallback(() => {
    try {
      return typeof autoplayTime === "function" ? autoplayTime() : autoplayTime;
    } catch {
      return 3000;
    }
  }, [autoplayTime]);

  const schedule = useCallback(() => {
    clearTimer();
    if (!enabled || totalItems <= 1) return;
    const delay = Math.max(0, Number(resolveDelay()) || 0);
    timerRef.current = setTimeout(advance, delay);
  }, [enabled, totalItems, advance, resolveDelay, clearTimer]);

  useEffect(() => {
    schedule();
    return clearTimer;
  }, [schedule, clearTimer]);

  return { schedule, clearTimer, advance };
}
