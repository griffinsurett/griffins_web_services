import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useReversibleProgress
 * - mode: "forwardOnly" | "backAndForth" | "infinite"
 * - duration: ms for a full 0..100 (or 100..0) sweep
 *
 * API:
 *  - percent: number 0..100
 *  - reversing: boolean (true while auto-reversing toward 0)
 *  - setEngaged(bool): play forward when true; for backAndForth reverse when false
 *  - reverseOnce(): force a single reverse pass (useful for hover-leave)
 *  - reset(): set to 0 and stop
 */
export function useReversibleProgress({
  duration = 2000,
  mode = "forwardOnly",
} = {}) {
  const [percent, setPercent] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [reversing, setReversing] = useState(false);
  const dirRef = useRef(1); // +1 forward, -1 reverse
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = 0;
  }, []);

  const step = useCallback((ts) => {
    const last = lastTsRef.current || ts;
    const dt = ts - last;
    lastTsRef.current = ts;

    setPercent((p) => {
      const delta = (dt / duration) * 100 * (dirRef.current >= 0 ? 1 : -1);
      let next = p + delta;

      if (dirRef.current > 0) {
        if (mode === "infinite") {
          next = next % 100;
          if (next < 0) next += 100;
        } else if (next >= 100) {
          next = 100;
          // forwardOnly/backAndForth: stop at full (let caller decide next)
          stop();
        }
      } else {
        if (next <= 0) {
          next = 0;
          // finished reverse sweep
          setReversing(false);
          stop();
        }
      }
      return Math.max(0, Math.min(100, next));
    });

    if (rafRef.current) {
      rafRef.current = requestAnimationFrame(step);
    }
  }, [duration, mode, stop]);

  // turn engine on/off based on mode + engaged/reversing
  const ensureRunning = useCallback(() => {
    const shouldRun =
      (mode === "infinite" && engaged) ||
      (mode === "forwardOnly" && engaged && percent < 100) ||
      (mode === "backAndForth" && (engaged || reversing));

    if (shouldRun && !rafRef.current) {
      rafRef.current = requestAnimationFrame(step);
    }
    if (!shouldRun) stop();
  }, [engaged, reversing, mode, percent, step, stop]);

  useEffect(() => {
    // adjust direction by mode + engaged
    if (mode === "infinite") {
      dirRef.current = 1;
    } else if (mode === "forwardOnly") {
      dirRef.current = engaged ? 1 : 1; // only forward; caller fades out separately
    } else if (mode === "backAndForth") {
      if (engaged) {
        dirRef.current = 1;
      } else if (percent > 0) {
        dirRef.current = -1;
        setReversing(true);
      } else {
        setReversing(false);
      }
    }
    ensureRunning();
  }, [mode, engaged, percent, ensureRunning]);

  useEffect(() => () => stop(), [stop]);

  const reverseOnce = useCallback(() => {
    if (mode !== "backAndForth") return;
    if (percent <= 0) return;
    dirRef.current = -1;
    setReversing(true);
    ensureRunning();
  }, [mode, percent, ensureRunning]);

  const reset = useCallback(() => {
    stop();
    setPercent(0);
    setReversing(false);
  }, [stop]);

  return { percent, reversing, setEngaged, reverseOnce, reset };
}
