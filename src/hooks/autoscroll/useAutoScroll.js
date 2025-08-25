// ============================================================================
// src/hooks/useAutoScroll.js 
// ============================================================================

// src/hooks/useAutoScroll.js
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Core auto-scroll functionality without user interaction handling.
 * Just handles the RAF-based scrolling animation, timing, and basic controls.
 *
 * @param {Object} options
 * @param {React.RefObject} options.ref - Element to scroll
 * @param {boolean} options.active - Whether scrolling should be active
 * @param {number|Function} options.speed - px/sec or (host)=>px/sec
 * @param {number} options.cycleDuration - seconds; overrides speed when > 0
 * @param {boolean} options.loop - Whether to loop when reaching bottom
 * @param {number} options.startDelay - Delay before starting scroll (ms)
 * @param {boolean} options.resetOnInactive - Reset scroll position when inactive
 */
export function useAutoScroll({
  ref,
  active = false,
  speed = 40,
  cycleDuration = 0,
  loop = false,
  startDelay = 1500,
  resetOnInactive = true,
} = {}) {
  // ---- Core animation state
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const startTimerRef = useRef(null);
  const floatTopRef = useRef(0);
  const startedThisCycleRef = useRef(false);

  // ---- Programmatic scroll guard (ONE FRAME ONLY)
  const internalScrollRef = useRef(false);
  const internalUnsetRafRef = useRef(null);

  // ---- Content monitoring
  const [contentVersion, setContentVersion] = useState(0);

  // ---- Speed calculation
  const resolvePxPerSecond = useCallback(
    (host) => {
      if (!host) return 0;
      if (cycleDuration && cycleDuration > 0) {
        const max = Math.max(0, host.scrollHeight - host.clientHeight);
        return max > 0 ? max / cycleDuration : 0;
      }
      return typeof speed === "function"
        ? Math.max(1, speed(host))
        : Number(speed) || 0;
    },
    [speed, cycleDuration]
  );

  // ---- Control functions
  const clearRAF = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = 0;
  }, []);

  const clearStartTimer = useCallback(() => {
    if (startTimerRef.current) clearTimeout(startTimerRef.current);
    startTimerRef.current = null;
  }, []);

  const markProgrammaticScroll = useCallback(() => {
    internalScrollRef.current = true;
    if (internalUnsetRafRef.current) {
      cancelAnimationFrame(internalUnsetRafRef.current);
      internalUnsetRafRef.current = null;
    }
    internalUnsetRafRef.current = requestAnimationFrame(() => {
      internalScrollRef.current = false;
      internalUnsetRafRef.current = null;
    });
  }, []);

  // ---- Core animation step
  const step = useCallback(
    (ts) => {
      if (!active) return;
      const host = ref?.current;
      if (!host) return;

      const last = lastTsRef.current || ts;
      const dt = (ts - last) / 1000;
      lastTsRef.current = ts;
      const dtClamped = Math.min(0.05, Math.max(0, dt));

      const max = Math.max(0, host.scrollHeight - host.clientHeight);
      if (max <= 0) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }

      if (floatTopRef.current === 0 && host.scrollTop > 0) {
        floatTopRef.current = host.scrollTop;
      }

      const pps = resolvePxPerSecond(host);
      const delta = pps * dtClamped;
      floatTopRef.current = Math.min(max, floatTopRef.current + delta);

      markProgrammaticScroll();
      try { 
        host.scrollTo({ top: floatTopRef.current, left: 0, behavior: "auto" }); 
      } catch { 
        host.scrollTop = Math.floor(floatTopRef.current); 
      }

      if (floatTopRef.current >= max - 0.5) {
        if (loop) {
          floatTopRef.current = 0;
          try { 
            host.scrollTo({ top: 0, left: 0, behavior: "auto" }); 
          } catch { 
            host.scrollTop = 0; 
          }
        } else {
          clearRAF();
          return;
        }
      }

      rafRef.current = requestAnimationFrame(step);
    },
    [ref, active, resolvePxPerSecond, loop, clearRAF, markProgrammaticScroll]
  );

  // ---- Public control methods
  const startNow = useCallback(() => {
    clearRAF();
    const host = ref?.current;
    if (host) {
      floatTopRef.current = host.scrollTop || 0;
      startedThisCycleRef.current = true;
      rafRef.current = requestAnimationFrame(step);
    }
  }, [step, ref, clearRAF]);

  const stopNow = useCallback(() => {
    clearRAF();
  }, [clearRAF]);

  const resetPosition = useCallback(() => {
    const host = ref?.current;
    if (!host) return;
    
    floatTopRef.current = 0;
    try { 
      host.scrollTo({ top: 0, left: 0, behavior: "auto" }); 
    } catch { 
      host.scrollTop = 0; 
    }
  }, [ref]);

  // ---- Start/stop lifecycle
  useEffect(() => {
    clearRAF();
    clearStartTimer();

    if (active) {
      if (!startedThisCycleRef.current) {
        startTimerRef.current = setTimeout(() => {
          if (active) startNow();
        }, Math.max(0, startDelay));
      } else {
        startNow();
      }
    }

    return () => {
      clearRAF();
      clearStartTimer();
    };
  }, [active, startDelay, startNow, clearRAF, clearStartTimer, contentVersion]);

  // ---- Reset when inactive
  useEffect(() => {
    if (!resetOnInactive) return;
    
    if (!active) {
      startedThisCycleRef.current = false;
      clearRAF();
      clearStartTimer();
      internalScrollRef.current = false;
      floatTopRef.current = 0;
      
      const host = ref?.current;
      if (host) {
        try { 
          host.scrollTo({ top: 0, left: 0, behavior: "auto" }); 
        } catch { 
          host.scrollTop = 0; 
        }
      }
    }
  }, [active, resetOnInactive, ref, clearRAF, clearStartTimer]);

  // ---- Content height monitoring (for late-loading images)
  useEffect(() => {
    const el = ref?.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    
    let lastMax = Math.max(0, el.scrollHeight - el.clientHeight);
    const ro = new ResizeObserver(() => {
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      if (max > lastMax + 1) {
        lastMax = max;
        setContentVersion((v) => v + 1);
      }
    });
    
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  // ---- Cleanup
  useEffect(
    () => () => {
      clearRAF();
      clearStartTimer();
      if (internalUnsetRafRef.current) {
        cancelAnimationFrame(internalUnsetRafRef.current);
        internalUnsetRafRef.current = null;
      }
      internalScrollRef.current = false;
    },
    [clearRAF, clearStartTimer]
  );

  // ---- Public API
  return {
    // Control methods
    startNow,
    stopNow,
    resetPosition,
    
    // State accessors
    isAnimating: () => !!rafRef.current,
    hasStartedThisCycle: () => startedThisCycleRef.current,
    getCurrentPosition: () => floatTopRef.current,
    
    // Internal refs for advanced usage
    internalScrollRef, // For external components to mark their own programmatic scrolls
    
    // Debug info
    getMetrics: () => {
      const host = ref?.current;
      const max = host ? Math.max(0, host.scrollHeight - host.clientHeight) : 0;
      const top = host ? host.scrollTop : 0;
      const progress = max > 0 ? top / max : 0;
      return {
        top, 
        max, 
        progress,
        animating: !!rafRef.current,
        started: startedThisCycleRef.current,
        internalGuard: internalScrollRef.current,
      };
    },
  };
}