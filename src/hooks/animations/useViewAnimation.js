// src/hooks/useAnimatedElement.js
import { useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "./useVisibility";

/**
 * Visibility-only animation driver (class-agnostic).
 * - Does NOT add/remove any classes. You attach your animation classes yourself.
 * - Returns props (style + data-attrs) you can spread onto the animated element.
 * - CSS controls the actual effect using the variables/attrs provided here.
 *
 * CSS contract (examples):
 *   .animated-element.scale-in {
 *     opacity: var(--animation-progress-decimal, 0);
 *     transform: scale(calc(0.5 + (var(--animation-progress-decimal, 0) * 0.5)));
 *     transition:
 *       transform var(--animation-duration, 600ms) var(--animation-easing, ease),
 *       opacity   var(--animation-duration, 600ms) var(--animation-easing, ease);
 *   }
 *   .animated-element[data-visible="true"]
 *   .animated-element[data-visible="false"]
 */
export function useAnimatedElement({
  ref,
  // timing vars (JS only supplies values; CSS decides how to use them)
  duration = 600, // ms
  delay = 0, // ms
  easing = "cubic-bezier(0.4, 0, 0.2, 1)",
  // visibility config
  threshold = 0.2,
  rootMargin = "0px 0px -50px 0px", // trigger shortly before enter by default
  once = false,
  // callbacks
  onStart,
  onComplete, // NOTE: fires on enter edge; for exact end, listen to transitionend in your component
  onReverse,
} = {}) {
  const elementRef = ref || useRef(null);

  // normalize rootMargin:
  // - number => bottom offset (px)
  // - "-50px" => bottom offset string expanded
  // - "a b c d" => used as-is
  const normalizeRootMargin = (rm) => {
    if (typeof rm === "number") return `0px 0px ${rm}px 0px`;
    const trimmed = String(rm || "").trim();
    if (/^-?\d+px$/.test(trimmed)) return `0px 0px ${trimmed} 0px`;
    return trimmed || "0px";
  };

  const inView = useVisibility(elementRef, {
    threshold,
    rootMargin: normalizeRootMargin(rootMargin),
    once,
  });

  // Edge-detected direction for data attributes
  const [direction, setDirection] = useState("forward"); // "forward" | "reverse"
  const prevInViewRef = useRef(false);

  useEffect(() => {
    const prev = prevInViewRef.current;
    const justEntered = inView && !prev;
    const justExited = !inView && prev;

    if (justEntered) {
      setDirection("forward");
      onStart?.();
      onComplete?.();
    }
    if (justExited) {
      setDirection("reverse");
      onReverse?.();
    }

    prevInViewRef.current = inView;
  }, [inView, onStart, onComplete, onReverse]);

  // Provide CSS vars & data attrs to spread on the element.
  const progress = inView ? 100 : 0;
  const progressDecimal = inView ? 1 : 0;

  const style = useMemo(
    () => ({
      // timing
      "--animation-duration": `${duration}ms`,
      "--animation-delay": `${delay}ms`,
      "--animation-easing": easing,
      // progress model
      "--animation-progress": `${progress}%`,
      "--animation-progress-decimal": progressDecimal,
      "--animation-direction": direction,
    }),
    [duration, delay, easing, progress, progressDecimal, direction]
  );

  const props = useMemo(
    () => ({
      style,
      "data-visible": inView ? "true" : "false",
      "data-animation-direction": direction,
    }),
    [style, inView, direction]
  );

  return {
    ref: elementRef,
    inView,
    progress,
    progressDecimal,
    direction, // "forward" | "reverse"
    isAnimating: inView, // with transition-based CSS, "visible" maps to animating
    hasAnimated: inView,
    // spread this on your element
    props,
    // exposed for convenience if you want to merge/override manually
    style,
  };
}
