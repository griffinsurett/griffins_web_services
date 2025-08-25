// src/hooks/useEngagementAutoplay.js
import { useEffect, useRef, useCallback } from "react";
import useAutoplay from "./useAutoplay";
import { usePauseableState } from "./usePauseableState";
import {
  useScrollInteraction,
  useClickInteraction,
} from "../animations/useInteractions";

/**
 * Engagement-aware autoplay controller.
 *
 * - `autoplayTime`: number | () => number (ms). If a function, it’s called each (re)schedule.
 * - Engagement marks user as “engaged”; you decide whether to pause immediately via `pauseOnEngage`.
 * - Resume after inactivity is handled by `usePauseableState` with `resumeDelay` and triggers.
 * - Listens to "autoscroll-user" events from inner viewports (useAutoScroll) to pause/resume.
 */
export default function useEngagementAutoplay({
  totalItems,
  currentIndex,
  setIndex,
  autoplayTime = 3000, // number | () => number
  resumeDelay = 5000,
  resumeTriggers = ["scroll", "click-outside", "hover-away"],
  containerSelector = "[data-autoplay-container]",
  itemSelector = "[data-autoplay-item]",
  inView = true,
  pauseOnEngage = false,
  engageOnlyOnActiveItem = false,
  activeItemAttr = "data-active",
}) {
  const graceRef = useRef(false);

  const {
    isPaused,
    userEngaged,
    isResumeScheduled,
    engageUser,
    handleResumeActivity,
    pause,
    resume,
  } = usePauseableState({
    initialPausedState: false,
    resumeTriggers,
    resumeDelay,
  });

  // Core timer: schedule/advance only when not paused and in view
  const { advance, schedule } = useAutoplay({
    totalItems,
    currentIndex,
    setIndex,
    autoplayTime,
    enabled: !isPaused && inView,
  });

  // ✅ Public hook method: enter “grace window” (e.g., right at video `ended`)
  const beginGraceWindow = useCallback(() => {
    graceRef.current = true;
    if (userEngaged && !isPaused) pause();
  }, [userEngaged, isPaused, pause]);

  // Leave grace on index change (advance or manual selection)
  useEffect(() => {
    graceRef.current = false;
  }, [currentIndex]);

  // If the user engages while in grace, pause immediately.
  useEffect(() => {
    if (graceRef.current && userEngaged && !isPaused) pause();
  }, [userEngaged, isPaused, pause]);

  // Global scroll → schedule resume (more sensitive for trackpads)
  useScrollInteraction({
    scrollThreshold: 10,
    debounceDelay: 120,
    onScrollActivity: () => handleResumeActivity("scroll"),
  });

  // Click interactions (inside/outside)
  useClickInteraction({
    containerSelector,
    itemSelector,
    onOutsideClick: () => handleResumeActivity("click-outside"),
    onInsideClick: () => {},
    onItemClick: (e, item) => {
      if (engageOnlyOnActiveItem) {
        const isActive = item?.getAttribute?.(activeItemAttr) === "true";
        if (!isActive) return;
      }
      engageUser();
      if (pauseOnEngage) pause();
    },
  });

  // Hover: engage on eligible enter; schedule resume when leaving all eligible
  useEffect(() => {
    const items = Array.from(document.querySelectorAll(itemSelector));
    if (!items.length) return;

    const isEligible = (el) =>
      !!el &&
      (!engageOnlyOnActiveItem || el.getAttribute?.(activeItemAttr) === "true");

    const onEnter = (ev) => {
      const host = ev.currentTarget;
      if (!isEligible(host)) return;
      engageUser();
      if (pauseOnEngage) pause();
    };

    const onLeave = (ev) => {
      const nextHost = ev.relatedTarget?.closest?.(itemSelector);
      if (isEligible(nextHost)) return;
      handleResumeActivity("hover-away");
    };

    items.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    // Fallback: if engaged but pointer isn’t over any eligible host, treat as hover-away
    const onPointerMove = (e) => {
      if (!userEngaged) return;
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const host = under?.closest?.(itemSelector);
      if (!isEligible(host)) handleResumeActivity("hover-away");
    };
    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      items.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      document.removeEventListener("pointermove", onPointerMove);
    };
  }, [
    itemSelector,
    activeItemAttr,
    engageOnlyOnActiveItem,
    pauseOnEngage,
    engageUser,
    handleResumeActivity,
    pause,
    currentIndex,
    userEngaged,
  ]);

  // 🔗 Listen for inner-viewport user activity from useAutoScroll
  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const onAutoScrollUser = (e) => {
      const { phase } = e.detail || {};
      const item = e.target?.closest?.(itemSelector);

      if (engageOnlyOnActiveItem) {
        const isActive = item?.getAttribute?.(activeItemAttr) === "true";
        if (!isActive) return;
      }

      if (phase === "start") {
        // user started interacting with inner scrollable viewport
        engageUser();
        if (pauseOnEngage && !isPaused) pause();
      } else if (phase === "end") {
        // user became idle inside the active viewport → schedule resume
        handleResumeActivity("scroll");
      }
    };

    container.addEventListener("autoscroll-user", onAutoScrollUser);
    return () =>
      container.removeEventListener("autoscroll-user", onAutoScrollUser);
  }, [
    containerSelector,
    itemSelector,
    activeItemAttr,
    engageOnlyOnActiveItem,
    pauseOnEngage,
    engageUser,
    pause,
    isPaused,
    handleResumeActivity,
  ]);

  return {
    isAutoplayPaused: isPaused,
    isResumeScheduled,
    userEngaged,
    pause,
    resume,
    engageUser,
    advance,
    schedule,
    beginGraceWindow,
  };
}
