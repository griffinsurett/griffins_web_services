// src/hooks/autoplay/usePauseableState.js
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Central pause/engagement state + delayed resume scheduler.
 * Generic: usable by autoplay or autoscroll.
 */
export const usePauseableState = ({
  initialPausedState = false,
  resumeTriggers = ["scroll", "click-outside", "hover-away"],
  resumeDelay = 5000, // ms
} = {}) => {
  const [isPaused, setIsPaused] = useState(initialPausedState);
  const [userEngaged, setUserEngaged] = useState(false);
  const [shouldPauseAfterVideo, setShouldPauseAfterVideo] = useState(false);

  const resumeTimeoutRef = useRef(null);
  const [isResumeScheduled, setIsResumeScheduled] = useState(false);

  const cancelScheduledResume = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    setIsResumeScheduled(false);
  }, []);

  const scheduleResume = useCallback(() => {
    cancelScheduledResume();
    setIsResumeScheduled(true);
    resumeTimeoutRef.current = setTimeout(() => {
      setIsResumeScheduled(false);
      setUserEngaged(false);
      setShouldPauseAfterVideo(false);
      setIsPaused(false); // resume
    }, resumeDelay);
  }, [cancelScheduledResume, resumeDelay]);

  const pause = useCallback(() => setIsPaused(true), []);

  const resume = useCallback(() => {
    cancelScheduledResume();
    setIsPaused(false);
    setUserEngaged(false);
    setShouldPauseAfterVideo(false);
  }, [cancelScheduledResume]);

  const toggle = useCallback(() => setIsPaused((p) => !p), []);

  const engageUser = useCallback(() => {
    cancelScheduledResume(); // any pending resume is now invalid
    setUserEngaged(true);
    setShouldPauseAfterVideo(true); // pause when current video ends (if applicable)
  }, [cancelScheduledResume]);

  const disengageUser = useCallback(() => {
    setUserEngaged(false);
    setShouldPauseAfterVideo(false);
  }, []);

  const pauseAfterVideoIfEngaged = useCallback(() => {
    if (shouldPauseAfterVideo && userEngaged) {
      setIsPaused(true);
      return true;
    }
    return false;
  }, [shouldPauseAfterVideo, userEngaged]);

  const handleResumeActivity = useCallback(
    (triggerType) => {
      if (!resumeTriggers.includes(triggerType)) return;

      // Disengage immediately for all resume triggers
      setUserEngaged(false);
      setShouldPauseAfterVideo(false);

      // Schedule resume only if actually paused
      if (isPaused) {
        scheduleResume();
      }
    },
    [resumeTriggers, isPaused, scheduleResume]
  );

  useEffect(() => () => cancelScheduledResume(), [cancelScheduledResume]);

  return {
    isPaused,
    userEngaged,
    shouldPauseAfterVideo,
    isResumeScheduled,
    scheduleResume,
    cancelScheduledResume,
    pause,
    resume,
    toggle,
    engageUser,
    disengageUser,
    pauseAfterVideoIfEngaged,
    handleResumeActivity,
  };
};

/**
 * Pure index state + optional timer-based advance
 */
export const useAutoAdvance = ({
  totalItems = 0,
  initialIndex = 0,
  autoAdvanceDelay = 3000,
  loop = true,
} = {}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const timerRef = useRef(null);

  const clearAutoAdvanceTimeout = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleAutoAdvance = useCallback(
    (delay = autoAdvanceDelay) => {
      clearAutoAdvanceTimeout();
      timerRef.current = setTimeout(() => {
        setActiveIndex((prev) => {
          if (!totalItems) return prev;
          return loop ? (prev + 1) % totalItems : Math.min(prev + 1, totalItems - 1);
        });
      }, delay);
    },
    [autoAdvanceDelay, totalItems, loop, clearAutoAdvanceTimeout]
  );

  const goToIndex = useCallback(
    (index) => {
      if (index >= 0 && index < totalItems) {
        setActiveIndex(index);
        clearAutoAdvanceTimeout();
      }
    },
    [totalItems, clearAutoAdvanceTimeout]
  );

  const goToNext = useCallback(() => {
    setActiveIndex((prev) =>
      loop ? (prev + 1) % totalItems : Math.min(prev + 1, totalItems - 1)
    );
    clearAutoAdvanceTimeout();
  }, [totalItems, loop, clearAutoAdvanceTimeout]);

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) =>
      loop ? (prev === 0 ? totalItems - 1 : prev - 1) : Math.max(prev - 1, 0)
    );
    clearAutoAdvanceTimeout();
  }, [totalItems, loop, clearAutoAdvanceTimeout]);

  useEffect(() => () => clearAutoAdvanceTimeout(), [clearAutoAdvanceTimeout]);

  return {
    activeIndex,
    setActiveIndex,
    goToIndex,
    goToNext,
    goToPrevious,
    scheduleAutoAdvance,
    clearAutoAdvanceTimeout,
  };
};
