// ============================================================================
// src/hooks/useEngagementAutoScroll.js
// ============================================================================

// src/hooks/useEngagementAutoScroll.js
import { useCallback, useEffect, useRef, useState } from "react";
import { useVisibility } from "../animations/useVisibility";
import {
  useTouchInteraction,
  useScrollInteraction,
  usePointerInteraction,
} from "../animations/useInteractions";
import { useAutoScroll } from "./useAutoScroll";

/**
 * Engagement-aware auto-scroll that combines core auto-scrolling with user interaction detection.
 *
 * - Pauses scrolling when user interacts (touch/scroll/pointer)
 * - Resumes after a delay when interaction stops
 * - Emits custom events for external autoplay coordination
 * - Integrates with visibility detection
 *
 * @param {Object} options
 * @param {React.RefObject} options.ref - Element to scroll
 * @param {boolean} options.active - Whether auto-scroll should be active when visible
 * @param {number|Function} options.speed - Scroll speed (px/sec) or function
 * @param {number} options.cycleDuration - Override speed with cycle duration (seconds)
 * @param {boolean} options.loop - Loop when reaching bottom
 * @param {number} options.startDelay - Initial delay before starting (ms)
 * @param {number} options.resumeDelay - Delay before resuming after interaction (ms)
 * @param {boolean} options.resumeOnUserInput - Whether to resume after user stops interacting
 * @param {number} options.threshold - Visibility threshold for IntersectionObserver
 * @param {number|string|Object} options.visibleRootMargin - IO rootMargin config
 * @param {boolean} options.resetOnInactive - Reset position when inactive/invisible
 */
export function useEngagementAutoScroll({
  ref,
  active = false,
  speed = 40,
  cycleDuration = 0,
  loop = false,
  startDelay = 1500,
  resumeDelay = 900,
  resumeOnUserInput = true,
  threshold = 0.3,
  visibleRootMargin = "0px",
  resetOnInactive = true,
} = {}) {
  // ---- Engagement state
  const resumeTimerRef = useRef(null);
  const userInteractingRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [resumeScheduled, setResumeScheduled] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);

  // ---- Visibility detection
  const inView = useVisibility(ref, {
    threshold,
    rootMargin: visibleRootMargin,
  });

  // ---- Core auto-scroll (only active when not paused and in view)
  const scrollActive = active && inView && !paused;
  const autoScroll = useAutoScroll({
    ref,
    active: scrollActive,
    speed,
    cycleDuration,
    loop,
    startDelay,
    resetOnInactive,
  });

  // ---- Engagement control functions
  const clearResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = null;
    setResumeScheduled(false);
  }, []);

  const pauseNow = useCallback(() => {
    setPaused(true);
    clearResume();
  }, [clearResume]);

  const scheduleResume = useCallback(() => {
    if (!resumeOnUserInput) return;
    if (userInteractingRef.current) return; // still interacting

    clearResume();
    setResumeScheduled(true);
    resumeTimerRef.current = setTimeout(() => {
      if (!userInteractingRef.current) {
        setResumeScheduled(false);
        setPaused(false); // resume auto-scroll
      }
    }, Math.max(0, resumeDelay));
  }, [resumeOnUserInput, resumeDelay, clearResume]);

  // ---- Event emission for external autoplay coordination
  const emitUserEvent = useCallback(
    (phase) => {
      const el = ref?.current;
      if (!el) return;
      el.dispatchEvent(
        new CustomEvent("autoscroll-user", {
          bubbles: true,
          detail: { phase }, // "start" | "end"
        })
      );
    },
    [ref]
  );

  // ---- Interaction handlers
  const handleInteractionStart = useCallback(() => {
    userInteractingRef.current = true;
    setUserEngaged(true);
    pauseNow();
    emitUserEvent("start");
  }, [pauseNow, emitUserEvent]);

  const handleInteractionEnd = useCallback(() => {
    userInteractingRef.current = false;
    setUserEngaged(false);
    emitUserEvent("end");
    scheduleResume();
  }, [emitUserEvent, scheduleResume]);

  const handleInteractionActivity = useCallback(() => {
    userInteractingRef.current = true;
    setUserEngaged(true);
  }, []);

  // ---- Touch interaction detection
  useTouchInteraction({
    elementRef: ref,
    tapThreshold: 8,
    longPressDelay: 600,
    onTouchStart: handleInteractionStart,
    onTouchMove: (_, data) => {
      if (data.moved) {
        handleInteractionStart();
      }
    },
    onTouchEnd: handleInteractionEnd,
    onLongPress: handleInteractionStart,
    preventDefaultOnTouch: false,
  });

  // ---- Scroll interaction detection (more sensitive)
  useScrollInteraction({
    elementRef: ref,
    scrollThreshold: 1,
    debounceDelay: 80,
    trustedOnly: true,
    internalFlagRef: autoScroll.internalScrollRef,
    wheelSensitivity: 1,
    onScrollStart: handleInteractionStart,
    onScrollActivity: handleInteractionActivity,
    onWheelActivity: handleInteractionStart,
    onScrollEnd: handleInteractionEnd,
  });

  // ---- Raw scroll/wheel listeners for momentum and trackpad
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const SCROLL_IDLE = 160; // ms without events = idle
    const WHEEL_IDLE = 160;

    let scrollIdleTimer = null;
    let wheelIdleTimer = null;

    const onScroll = () => {
      if (autoScroll.internalScrollRef.current) return; // ignore programmatic
      handleInteractionStart();
      if (scrollIdleTimer) clearTimeout(scrollIdleTimer);
      scrollIdleTimer = setTimeout(handleInteractionEnd, SCROLL_IDLE);
    };

    const onWheel = () => {
      handleInteractionStart();
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(handleInteractionEnd, WHEEL_IDLE);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      if (scrollIdleTimer) clearTimeout(scrollIdleTimer);
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
    };
  }, [
    ref,
    autoScroll.internalScrollRef,
    handleInteractionStart,
    handleInteractionEnd,
  ]);

  // ---- Reset engagement state when inactive/invisible
  useEffect(() => {
    if (!resetOnInactive) return;

    if (!active || !inView) {
      userInteractingRef.current = false;
      setUserEngaged(false);
      setPaused(false);
      clearResume();
    }
  }, [active, inView, resetOnInactive, clearResume]);

  // ---- Cleanup
  useEffect(
    () => () => {
      clearResume();
      userInteractingRef.current = false;
      setUserEngaged(false);
    },
    [clearResume]
  );

  // ---- Public API
  return {
    // Visibility & engagement state
    inView,
    paused,
    resumeScheduled,
    engaged: userEngaged,

    // Control methods
    pauseNow,
    resumeNow: () => {
      clearResume();
      setPaused(false);
    },

    // Pass-through from core auto-scroll
    startNow: autoScroll.startNow,
    stopNow: autoScroll.stopNow,
    resetPosition: autoScroll.resetPosition,
    isAnimating: autoScroll.isAnimating,
    hasStartedThisCycle: autoScroll.hasStartedThisCycle,
    getCurrentPosition: autoScroll.getCurrentPosition,
    getMetrics: autoScroll.getMetrics,
  };
}
