// src/hooks/useVisibility.js
import { useEffect, useRef, useState } from "react";
import { useScrollInteraction } from "./useInteractions";

/**
 * useVisibility(ref, options)
 * ----------------------------------------
 * Returns a boolean indicating whether the element is currently in the viewport
 * (or `true` once it's ever been seen if `once: true`).
 *
 * It also supports optional scroll direction callbacks (onForward / onBackward)
 * and menu checkbox syncing (for header menus).
 */
export function useVisibility(
  ref,
  {
    // IntersectionObserver options
    threshold = 0.1,
    root = null,
    rootMargin = "0px",
    once = false, // if true, return true after the first entry and stop observing

    // Callbacks for entering/leaving the IO threshold
    onEnter,
    onExit,

    // Optional scroll-direction behaviors (ported from useScrollAnimation)
    onForward, // called on downward scroll
    onBackward, // called on upward scroll near top
    pauseDelay = 100, // debounce between direction callbacks
    restoreAtTopOffset = 100, // show-on-up only when near top
    menuCheckboxId = "nav-toggle",
  } = {}
) {
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);

  // Intersection Observer
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const isIn = entry.isIntersecting;
        setVisible(isIn);
        if (isIn) {
          if (!seen) setSeen(true);
          onEnter?.(entry);
          if (once) io.disconnect();
        } else {
          onExit?.(entry);
        }
      },
      { root, rootMargin, threshold }
    );

    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, root, rootMargin, threshold, once, onEnter, onExit]);

  // ✅ REFACTORED: Use centralized scroll interaction instead of hardcoded listeners
  // Direction-aware scroll handlers (only if callbacks provided)
  const wantsDirection =
    typeof onForward === "function" || typeof onBackward === "function";

  useScrollInteraction({
    elementRef: null, // Use window (default)
    scrollThreshold: 5, // Small threshold for direction detection
    debounceDelay: pauseDelay,
    trustedOnly: true,

    // Only register callbacks if direction tracking is wanted
    onScrollActivity: wantsDirection
      ? ({ dir }) => {
          if (dir === "down") {
            onForward?.();
          } else if (dir === "up") {
            // Only call onBackward when near the top
            if (window.pageYOffset <= restoreAtTopOffset) {
              onBackward?.();
            }
          }
        }
      : undefined,

    onWheelActivity: wantsDirection
      ? ({ deltaY }) => {
          if (deltaY > 0) {
            onForward?.();
          } else if (deltaY < 0) {
            // Only call onBackward when near the top
            if (window.pageYOffset <= restoreAtTopOffset) {
              onBackward?.();
            }
          }
        }
      : undefined,
  });

  // Optional: react to a menu checkbox toggling (force show/hide behavior)
  useEffect(() => {
    if (!menuCheckboxId || !wantsDirection) return;
    const box = document.getElementById(menuCheckboxId);
    if (!box) return;

    const syncMenu = () => {
      if (box.checked) {
        onBackward?.();
      } else {
        if (window.pageYOffset > restoreAtTopOffset) {
          onForward?.();
        } else {
          onBackward?.();
        }
      }
    };

    box.addEventListener("change", syncMenu);
    // initialize once on mount
    syncMenu();

    return () => box.removeEventListener("change", syncMenu);
  }, [
    menuCheckboxId,
    onForward,
    onBackward,
    restoreAtTopOffset,
    wantsDirection,
  ]);

  // For `once: true`, return "have we ever been visible?"
  return once ? seen : visible;
}
