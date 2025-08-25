// src/hooks/useInteractions.js
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Resolve the host we should listen on.
 * - If elementRef is provided and current exists → use it.
 * - Otherwise fall back to window.
 */
function resolveHost(elementRef) {
  return elementRef?.current || window;
}

function getPositionForHost(host) {
  // Window → use scrollY; element → use scrollTop
  return host === window ? window.scrollY : host.scrollTop || 0;
}

/** ──────────────────────────────────────────────────────────────────────────
 * NEW: Pointer Interaction Hook
 * 
 * Handles all pointer events (mouse, touch, pen) with type detection.
 * Useful for interactions that need to distinguish between input types.
 */
export const usePointerInteraction = ({
  elementRef,                    // optional; default window
  pointerTypes = ['mouse', 'touch', 'pen'], // which pointer types to handle
  clickThreshold = 10,           // px movement to still count as click
  longPressDelay = 500,          // ms for long press
  preventDefaultOnPointer = false,
  
  onPointerDown = () => {},
  onPointerUp = () => {},
  onPointerMove = () => {},
  onPointerCancel = () => {},
  onPointerClick = () => {},     // fires when movement < clickThreshold
  onPointerLongPress = () => {},
} = {}) => {
  const pointerStateRef = useRef(new Map()); // track multiple pointers
  const longPressTimersRef = useRef(new Map());

  const clearLongPressTimer = useCallback((pointerId) => {
    const timer = longPressTimersRef.current.get(pointerId);
    if (timer) {
      clearTimeout(timer);
      longPressTimersRef.current.delete(pointerId);
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    longPressTimersRef.current.forEach(timer => clearTimeout(timer));
    longPressTimersRef.current.clear();
  }, []);

  useEffect(() => {
    const host = resolveHost(elementRef);

    const handlePointerDown = (e) => {
      if (!pointerTypes.includes(e.pointerType)) return;
      
      const pointerId = e.pointerId;
      const state = {
        startX: e.clientX,
        startY: e.clientY,
        startTime: Date.now(),
        moved: false,
        pointerType: e.pointerType,
      };
      
      pointerStateRef.current.set(pointerId, state);
      
      if (preventDefaultOnPointer) {
        e.preventDefault();
      }
      
      onPointerDown(e, {
        pointerId,
        x: e.clientX,
        y: e.clientY,
        pointerType: e.pointerType,
        timestamp: state.startTime,
      });

      // Start long press timer
      const timer = setTimeout(() => {
        const currentState = pointerStateRef.current.get(pointerId);
        if (currentState && !currentState.moved) {
          onPointerLongPress(e, {
            pointerId,
            x: currentState.startX,
            y: currentState.startY,
            pointerType: e.pointerType,
            duration: Date.now() - currentState.startTime,
          });
        }
      }, longPressDelay);
      
      longPressTimersRef.current.set(pointerId, timer);
    };

    const handlePointerMove = (e) => {
      if (!pointerTypes.includes(e.pointerType)) return;
      
      const pointerId = e.pointerId;
      const state = pointerStateRef.current.get(pointerId);
      if (!state) return;

      const deltaX = e.clientX - state.startX;
      const deltaY = e.clientY - state.startY;
      const distance = Math.hypot(deltaX, deltaY);

      if (!state.moved && distance > clickThreshold) {
        state.moved = true;
        clearLongPressTimer(pointerId); // Cancel long press if moved
      }

      if (preventDefaultOnPointer) {
        e.preventDefault();
      }

      onPointerMove(e, {
        pointerId,
        x: e.clientX,
        y: e.clientY,
        deltaX,
        deltaY,
        distance,
        moved: state.moved,
        pointerType: e.pointerType,
      });
    };

    const handlePointerUp = (e) => {
      if (!pointerTypes.includes(e.pointerType)) return;
      
      const pointerId = e.pointerId;
      const state = pointerStateRef.current.get(pointerId);
      if (!state) return;

      const endTime = Date.now();
      const duration = endTime - state.startTime;
      
      clearLongPressTimer(pointerId);
      
      if (preventDefaultOnPointer) {
        e.preventDefault();
      }

      onPointerUp(e, {
        pointerId,
        x: e.clientX,
        y: e.clientY,
        duration,
        moved: state.moved,
        pointerType: e.pointerType,
      });

      // Handle click (if didn't move much)
      if (!state.moved) {
        onPointerClick(e, {
          pointerId,
          x: e.clientX,
          y: e.clientY,
          duration,
          pointerType: e.pointerType,
        });
      }

      pointerStateRef.current.delete(pointerId);
    };

    const handlePointerCancel = (e) => {
      if (!pointerTypes.includes(e.pointerType)) return;
      
      const pointerId = e.pointerId;
      clearLongPressTimer(pointerId);
      
      onPointerCancel(e, {
        pointerId,
        pointerType: e.pointerType,
        cancelled: true,
      });
      
      pointerStateRef.current.delete(pointerId);
    };

    // Add event listeners
    host.addEventListener('pointerdown', handlePointerDown, { passive: !preventDefaultOnPointer });
    host.addEventListener('pointermove', handlePointerMove, { passive: !preventDefaultOnPointer });
    host.addEventListener('pointerup', handlePointerUp, { passive: !preventDefaultOnPointer });
    host.addEventListener('pointercancel', handlePointerCancel, { passive: true });

    return () => {
      host.removeEventListener('pointerdown', handlePointerDown);
      host.removeEventListener('pointermove', handlePointerMove);
      host.removeEventListener('pointerup', handlePointerUp);
      host.removeEventListener('pointercancel', handlePointerCancel);
      clearAllTimers();
    };
  }, [
    elementRef,
    pointerTypes,
    clickThreshold,
    longPressDelay,
    preventDefaultOnPointer,
    onPointerDown,
    onPointerUp,
    onPointerMove,
    onPointerCancel,
    onPointerClick,
    onPointerLongPress,
    clearLongPressTimer,
    clearAllTimers,
  ]);

  // Cleanup on unmount
  useEffect(() => () => {
    clearAllTimers();
    pointerStateRef.current.clear();
  }, [clearAllTimers]);

  return {
    getActivePointers: () => Array.from(pointerStateRef.current.keys()),
    getPointerState: (pointerId) => pointerStateRef.current.get(pointerId),
    clearAllTimers,
  };
};

/** ──────────────────────────────────────────────────────────────────────────
 * Touch Interaction Hook (UPDATED)
 */
export const useTouchInteraction = ({
  elementRef,                    // optional; default window
  tapThreshold = 10,             // px movement to still count as tap
  longPressDelay = 500,          // ms for long press
  swipeThreshold = 50,           // px minimum for swipe
  preventDefaultOnTouch = false, // prevent default touch behavior
  
  onTouchStart = () => {},
  onTouchEnd = () => {},
  onTouchMove = () => {},
  onTap = () => {},
  onLongPress = () => {},
  onSwipe = () => {},             // receives {direction, distance, duration}
} = {}) => {
  const touchStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTime: 0,
    moved: false,
    longPressTriggered: false,
  });
  
  const longPressTimerRef = useRef(null);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const resetTouchState = useCallback(() => {
    const state = touchStateRef.current;
    state.active = false;
    state.moved = false;
    state.longPressTriggered = false;
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  // Calculate swipe direction and distance
  const getSwipeData = useCallback((endX, endY) => {
    const state = touchStateRef.current;
    const deltaX = endX - state.startX;
    const deltaY = endY - state.startY;
    const distance = Math.hypot(deltaX, deltaY);
    const duration = Date.now() - state.startTime;
    
    let direction = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    return { direction, distance, duration, deltaX, deltaY };
  }, []);

  useEffect(() => {
    const host = resolveHost(elementRef);

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      if (!touch) return;

      const state = touchStateRef.current;
      state.active = true;
      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.startTime = Date.now();
      state.moved = false;
      state.longPressTriggered = false;

      if (preventDefaultOnTouch) {
        e.preventDefault();
      }

      onTouchStart(e, {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: state.startTime,
      });

      // Start long press timer
      longPressTimerRef.current = setTimeout(() => {
        if (state.active && !state.moved) {
          state.longPressTriggered = true;
          onLongPress(e, {
            x: state.startX,
            y: state.startY,
            duration: Date.now() - state.startTime,
          });
        }
      }, longPressDelay);
    };

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      if (!touch) return;

      const state = touchStateRef.current;
      if (!state.active) return;

      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const distance = Math.hypot(deltaX, deltaY);

      if (!state.moved && distance > tapThreshold) {
        state.moved = true;
        clearLongPressTimer(); // Cancel long press if moved
      }

      if (preventDefaultOnTouch) {
        e.preventDefault();
      }

      onTouchMove(e, {
        x: touch.clientX,
        y: touch.clientY,
        deltaX,
        deltaY,
        distance,
        moved: state.moved,
      });
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const state = touchStateRef.current;
      if (!state.active) return;

      const endTime = Date.now();
      const duration = endTime - state.startTime;
      
      if (preventDefaultOnTouch) {
        e.preventDefault();
      }

      onTouchEnd(e, {
        x: touch.clientX,
        y: touch.clientY,
        duration,
        moved: state.moved,
        longPressTriggered: state.longPressTriggered,
      });

      // Handle tap
      if (!state.moved && !state.longPressTriggered) {
        onTap(e, {
          x: touch.clientX,
          y: touch.clientY,
          duration,
        });
      }

      // Handle swipe
      if (state.moved) {
        const swipeData = getSwipeData(touch.clientX, touch.clientY);
        if (swipeData.distance >= swipeThreshold) {
          onSwipe(e, swipeData);
        }
      }

      resetTouchState();
    };

    const handleTouchCancel = (e) => {
      onTouchEnd(e, {
        cancelled: true,
        duration: Date.now() - touchStateRef.current.startTime,
      });
      resetTouchState();
    };

    // Add event listeners
    host.addEventListener('touchstart', handleTouchStart, { passive: !preventDefaultOnTouch });
    host.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultOnTouch });
    host.addEventListener('touchend', handleTouchEnd, { passive: !preventDefaultOnTouch });
    host.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      host.removeEventListener('touchstart', handleTouchStart);
      host.removeEventListener('touchmove', handleTouchMove);
      host.removeEventListener('touchend', handleTouchEnd);
      host.removeEventListener('touchcancel', handleTouchCancel);
      clearLongPressTimer();
    };
  }, [
    elementRef,
    tapThreshold,
    longPressDelay,
    swipeThreshold,
    preventDefaultOnTouch,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onTap,
    onLongPress,
    onSwipe,
    getSwipeData,
    resetTouchState,
    clearLongPressTimer,
  ]);

  // Cleanup on unmount
  useEffect(() => () => {
    clearLongPressTimer();
    resetTouchState();
  }, [clearLongPressTimer, resetTouchState]);

  return {
    isTouchActive: () => touchStateRef.current.active,
    getTouchState: () => ({ ...touchStateRef.current }),
    resetTouchState,
  };
};

/** ──────────────────────────────────────────────────────────────────────────
 * Scroll (UPDATED with better configurability)
 */
export const useScrollInteraction = ({
  elementRef,                // optional; default window
  scrollThreshold = 10,      // px
  debounceDelay = 150,       // ms
  trustedOnly = true,        // only applies to WHEEL (scroll has no isTrusted guarantee)
  internalFlagRef,           // optional: ignore programmatic scrolls when true
  wheelSensitivity = 1,      // multiplier for wheel events
  
  onScrollActivity = () => {},
  onScrollUp = () => {},
  onScrollDown = () => {},
  onScrollStart = () => {},
  onScrollEnd = () => {},
  onDirectionChange = () => {},
  onWheelActivity = () => {}, // separate callback for wheel events
} = {}) => {
  const endTimeoutRef   = useRef(null);
  const lastPosRef      = useRef(0);
  const lastDirRef      = useRef("none"); // "up" | "down" | "none"
  const scrollingRef    = useRef(false);
  const hostRef         = useRef(null);

  // initialize lastPos when host mounts
  useEffect(() => {
    const host = resolveHost(elementRef);
    hostRef.current = host;
    lastPosRef.current = getPositionForHost(host);
    return () => { hostRef.current = null; };
  }, [elementRef]);

  const clearEndTimer = useCallback(() => {
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
  }, []);

  const scheduleEnd = useCallback(() => {
    clearEndTimer();
    endTimeoutRef.current = setTimeout(() => {
      if (scrollingRef.current) {
        scrollingRef.current = false;
        onScrollEnd({
          pos: getPositionForHost(hostRef.current || window),
          dir: lastDirRef.current,
        });
      }
    }, debounceDelay);
  }, [debounceDelay, clearEndTimer, onScrollEnd]);

  const emitActivity = useCallback(
    (deltaRaw, source = 'scroll') => {
      const host = hostRef.current || window;
      const pos = getPositionForHost(host);
      const delta = Math.abs(deltaRaw);
      if (delta < scrollThreshold) return;

      // Determine direction from raw delta
      const dir = deltaRaw > 0 ? "down" : "up";

      // Begin burst
      if (!scrollingRef.current) {
        scrollingRef.current = true;
        onScrollStart({ pos, dir, source });
      }

      // Direction change?
      if (dir !== lastDirRef.current && lastDirRef.current !== "none") {
        onDirectionChange({ from: lastDirRef.current, to: dir, pos, source });
      }
      lastDirRef.current = dir;

      // Callbacks
      onScrollActivity({ dir, delta, pos, source });
      if (dir === "down") onScrollDown({ delta, pos, source });
      else onScrollUp({ delta, pos, source });

      // Debounce end-of-scroll
      scheduleEnd();
    },
    [
      scrollThreshold,
      onScrollStart,
      onScrollActivity,
      onScrollDown,
      onScrollUp,
      onDirectionChange,
      scheduleEnd,
    ]
  );

  // Wheel: immediate direction via deltaY
  useEffect(() => {
    const host = hostRef.current || resolveHost(elementRef);
    hostRef.current = host;

    const onWheel = (e) => {
      if (trustedOnly && !e.isTrusted) return;
      if (internalFlagRef?.current) return; // ignore programmatic sequences you mark
      
      const dy = (e.deltaY || 0) * wheelSensitivity;
      if (dy === 0) return;
      
      // Specific wheel callback
      onWheelActivity({ 
        deltaY: dy, 
        deltaX: e.deltaX || 0, 
        deltaZ: e.deltaZ || 0,
        deltaMode: e.deltaMode,
        event: e 
      });
      
      emitActivity(dy, 'wheel');
    };

    host.addEventListener("wheel", onWheel, { passive: true });
    return () => host.removeEventListener("wheel", onWheel);
  }, [elementRef, trustedOnly, internalFlagRef, wheelSensitivity, onWheelActivity, emitActivity]);

  // Scroll: compute actual position delta (works for window OR element)
  useEffect(() => {
    const host = hostRef.current || resolveHost(elementRef);
    hostRef.current = host;

    const onScroll = () => {
      if (internalFlagRef?.current) return; // ignore your programmatic sets
      const pos = getPositionForHost(host);
      const deltaRaw = pos - lastPosRef.current;
      lastPosRef.current = pos;
      if (deltaRaw !== 0) emitActivity(deltaRaw, 'scroll');
    };

    host.addEventListener("scroll", onScroll, { passive: true });
    return () => host.removeEventListener("scroll", onScroll);
  }, [elementRef, internalFlagRef, emitActivity]);

  // Cleanup
  useEffect(() => () => clearEndTimer(), [clearEndTimer]);

  return {
    getCurrentPos: () => getPositionForHost(hostRef.current || window),
    getLastPos: () => lastPosRef.current,
    getLastDir: () => lastDirRef.current,
    isScrolling: () => !!scrollingRef.current,
  };
};

/** ──────────────────────────────────────────────────────────────────────────
 * Click (unchanged but with better organization)
 */
export const useClickInteraction = ({
  containerSelector = "[data-container]",
  itemSelector = "[data-item]",
  onOutsideClick = () => {},
  onInsideClick = () => {},
  onItemClick = () => {},
  trustedOnly = true, // ignore programmatic clicks
} = {}) => {
  useEffect(() => {
    const handleGlobalClick = (event) => {
      if (trustedOnly && !event.isTrusted) return;

      const container = event.target.closest(containerSelector);
      const item = event.target.closest(itemSelector);

      if (!container) {
        onOutsideClick(event);
      } else {
        onInsideClick(event, container);
        if (item) onItemClick(event, item, container);
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [containerSelector, itemSelector, onOutsideClick, onInsideClick, onItemClick, trustedOnly]);

  return {
    triggerClick: (selector) => {
      const el = document.querySelector(selector);
      if (el) el.click();
    },
  };
};

/** ──────────────────────────────────────────────────────────────────────────
 * Hover (unchanged)
 */
export const useHoverInteraction = ({
  onHoverStart = () => {},
  onHoverEnd = () => {},
  hoverDelay = 0,
  unhoverIntent,
} = {}) => {
  const hoverTimeoutRef = useRef(null);

  // ── Intent state
  const intentEnabled = !!unhoverIntent?.enabled;
  const intentTimerRef = useRef(null);
  const moveCleanupRef = useRef(null);
  const intentStateRef = useRef({
    active: false,
    elem: null,
    index: null,
    leftAt: 0,
    rect: null,
    minDist: 0,
    reentryGraceMs: 0,
    lastPos: { x: NaN, y: NaN },
    lastDistance: Infinity,
  });

  const clearHoverTimer = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const stopIntentTracking = () => {
    if (moveCleanupRef.current) {
      moveCleanupRef.current();
      moveCleanupRef.current = null;
    }
    if (intentTimerRef.current) {
      clearTimeout(intentTimerRef.current);
      intentTimerRef.current = null;
    }
  };

  const cancelIntent = (reason = "cancel") => {
    if (!intentEnabled) return;
    const s = intentStateRef.current;
    if (!s.active) return;

    stopIntentTracking();
    s.active = false;

    unhoverIntent?.onUnhoverCancel?.(s.elem, s.index, { reason });
  };

  const commitIntent = () => {
    const s = intentStateRef.current;
    if (!s.active) return;

    const payload = {
      timeAway: Date.now() - s.leftAt,
      distance: s.lastDistance,
    };

    stopIntentTracking();
    s.active = false;

    unhoverIntent?.onUnhoverCommit?.(s.elem, s.index, payload);
  };

  const padRect = (r, pad) => ({
    left: r.left - pad,
    top: r.top - pad,
    right: r.right + pad,
    bottom: r.bottom + pad,
  });

  const distanceFromRect = (x, y, r) => {
    const dx = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
    const dy = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
    return Math.hypot(dx, dy);
  };

  const startIntent = (element, index) => {
    if (!intentEnabled) return;

    cancelIntent("restart");

    const leaveDelay = Number(unhoverIntent?.leaveDelay ?? 120);
    const reentryGraceMs = Number(unhoverIntent?.reentryGraceMs ?? 250);
    const minOutDistance = Number(unhoverIntent?.minOutDistance ?? 8);
    const boundaryPadding = Number(unhoverIntent?.boundaryPadding ?? 6);

    const rawRect = element?.getBoundingClientRect?.();
    const rect = rawRect ? padRect(rawRect, boundaryPadding) : null;

    const s = intentStateRef.current;
    s.active = true;
    s.elem = element || null;
    s.index = index ?? null;
    s.leftAt = Date.now();
    s.rect = rect;
    s.minDist = minOutDistance;
    s.reentryGraceMs = reentryGraceMs;
    s.lastDistance = Infinity;

    const onMove = (e) => {
      if (!s.active) return;
      const x = e.clientX, y = e.clientY;
      s.lastPos = { x, y };

      if (s.rect) {
        const dist = distanceFromRect(x, y, s.rect);
        s.lastDistance = dist;

        if (dist === 0 && Date.now() - s.leftAt <= s.reentryGraceMs) {
          cancelIntent("reenter-geom");
        }
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    moveCleanupRef.current = () => window.removeEventListener("pointermove", onMove);

    const check = () => {
      if (!s.active) return;

      const elapsed = Date.now() - s.leftAt;
      const dist = s.lastDistance;

      if (elapsed >= leaveDelay && dist >= s.minDist) {
        commitIntent();
      } else {
        intentTimerRef.current = setTimeout(check, Math.max(30, leaveDelay / 3));
      }
    };

    intentTimerRef.current = setTimeout(check, leaveDelay);
  };

  const handleMouseEnter = useCallback(
    (element, index) => {
      clearHoverTimer();
      cancelIntent("enter");

      if (hoverDelay > 0) {
        hoverTimeoutRef.current = setTimeout(
          () => onHoverStart(element, index),
          hoverDelay
        );
      } else {
        onHoverStart(element, index);
      }
    },
    [hoverDelay, onHoverStart]
  );

  const handleMouseLeave = useCallback(
    (element, index) => {
      clearHoverTimer();

      if (hoverDelay > 0) {
        hoverTimeoutRef.current = setTimeout(
          () => onHoverEnd(element, index),
          hoverDelay
        );
      } else {
        onHoverEnd(element, index);
      }

      startIntent(element, index);
    },
    [hoverDelay, onHoverEnd]
  );

  useEffect(
    () => () => {
      clearHoverTimer();
      stopIntentTracking();
      intentStateRef.current.active = false;
    },
    []
  );

  return {
    handleMouseEnter,
    handleMouseLeave,
    cancelUnhoverIntent: () => cancelIntent("manual"),
  };
};

/** ──────────────────────────────────────────────────────────────────────────
 * Side-only drag/tap navigation (could be enhanced to use pointer hook)
 */
export const useSideDragNavigation = ({
  enabled = true,
  leftElRef,
  rightElRef,
  onLeft = () => {},
  onRight = () => {},
  dragThreshold = 40,
  tapThreshold = 12,
} = {}) => {
  const stateRef = useRef({
    active: false,
    zone: null,   // "left" | "right"
    id: null,
    startX: 0,
    startY: 0,
    moved: false,
    slid: false,
  });

  const attach = useCallback((el, zone) => {
    if (!el) return () => {};

    const down = (e) => {
      if (!enabled) return;
      const s = stateRef.current;
      s.active = true;
      s.zone   = zone;
      s.id     = e.pointerId;
      s.startX = e.clientX;
      s.startY = e.clientY;
      s.moved  = false;
      s.slid   = false;
      el.setPointerCapture?.(e.pointerId);
    };

    const move = (e) => {
      const s = stateRef.current;
      if (!s.active || s.id !== e.pointerId || s.zone !== zone) return;

      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      if (!s.moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) s.moved = true;

      if (Math.abs(dy) > Math.abs(dx)) return;

      e.preventDefault?.();

      if (s.slid) return;

      if (Math.abs(dx) >= dragThreshold) {
        if (zone === "left") onLeft();
        else onRight();
        s.slid = true;
      }
    };

    const end = (e) => {
      const s = stateRef.current;
      if (!s.active || s.id !== e.pointerId || s.zone !== zone) return;

      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;

      if (!s.slid && Math.hypot(dx, dy) <= tapThreshold) {
        if (zone === "left") onLeft();
        else onRight();
      }

      try { el.releasePointerCapture?.(s.id); } catch {}
      s.active = false;
      s.zone   = null;
      s.id     = null;
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);

    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
    };
  }, [enabled, onLeft, onRight, dragThreshold, tapThreshold]);

  useEffect(() => {
    if (!enabled) return;
    const cleanLeft  = attach(leftElRef?.current,  "left");
    const cleanRight = attach(rightElRef?.current, "right");
    return () => {
      cleanLeft && cleanLeft();
      cleanRight && cleanRight();
    };
  }, [enabled, leftElRef, rightElRef, attach]);
};