// src/hooks/useEngagedByTriggers.js
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useVisibility } from "../../hooks/animations/useVisibility";
import { useHoverInteraction } from "../../hooks/animations/useInteractions";

/**
 * useEngagedByTriggers
 * Centralizes engagement based on triggers:
 *   - triggers: "hover" | "visible" | "always" | "controlled" | string[]
 *   - active: for "controlled"
 *   - Hover handled internally via useHoverInteraction when "hover" is present
 *   - visibleRootMargin: IO rootMargin used to flip inView early/late
 *
 * visibleRootMargin formats:
 *  - number: N  => shrink top & bottom by N px  => "-Npx 0px -Npx 0px"
 *  - string:     pass through as-is (IO syntax)
 *  - object:    { top, right, bottom, left } (numbers -> px)
 */
export function useEngagedByTriggers({
  ref,
  triggers = "hover",
  active = false,

  // Hover options (optional)
  hoverDelay = 0,
  unhoverIntent,

  // IO early/late engage window
  visibleRootMargin = 120, // number|string|{top,right,bottom,left}
  visibilityOptions = { threshold: 0.25 }, // other IO opts (threshold, root, etc.)
}) {
  // ── parse triggers
  const list = Array.isArray(triggers) ? triggers : [triggers ?? "hover"];
  const set = new Set(list.map((t) => String(t || "").toLowerCase()));

  const wantsHover = set.has("hover");
  const wantsVisible = set.has("visible");
  const isAlways = set.has("always");
  const isControlledTrigger = set.has("controlled");

  // ── hover (internal): we expose onEnter/onLeave so callers can hook them up
  const [hovered, setHovered] = useState(false);
  const { handleMouseEnter, handleMouseLeave } = useHoverInteraction({
    hoverDelay,
    unhoverIntent,
    onHoverStart: () => setHovered(true),
    onHoverEnd: () => setHovered(false),
  });

  const onEnter = useCallback(
    (e) => {
      if (wantsHover) handleMouseEnter(e.currentTarget);
    },
    [wantsHover, handleMouseEnter]
  );
  const onLeave = useCallback(
    (e) => {
      if (wantsHover) handleMouseLeave(e.currentTarget);
    },
    [wantsHover, handleMouseLeave]
  );

  // ── normalize rootMargin
  const normalizePx = (v) => (typeof v === "number" ? `${v}px` : v ?? 0);

  const normalizedRootMargin = useMemo(() => {
    // number → shrink top/bottom by N px
    if (typeof visibleRootMargin === "number") {
      const n = Math.max(0, visibleRootMargin | 0);
      return `-${n}px 0px -${n}px 0px`;
    }
    // object → {top,right,bottom,left}
    if (visibleRootMargin && typeof visibleRootMargin === "object") {
      const top = normalizePx(visibleRootMargin.top ?? 0);
      const right = normalizePx(visibleRootMargin.right ?? 0);
      const bottom = normalizePx(visibleRootMargin.bottom ?? 0);
      const left = normalizePx(visibleRootMargin.left ?? 0);
      return `${top} ${right} ${bottom} ${left}`;
    }
    // string → pass through as-is ("-120px 0px -120px 0px", etc.)
    return visibleRootMargin || "0px";
  }, [visibleRootMargin]);

  const ioOptions = useMemo(
    () => ({
      threshold: 0.25,
      ...(visibilityOptions || {}),
      rootMargin:
        normalizedRootMargin ??
        (visibilityOptions ? visibilityOptions.rootMargin : undefined),
    }),
    [visibilityOptions, normalizedRootMargin]
  );

  // ── visibility (IO): flips earlier/later based on rootMargin
  const inView = useVisibility(ref, ioOptions);

  // ── engaged
  const engaged = Boolean(
    isAlways ||
      (wantsHover && hovered) ||
      (isControlledTrigger && !!active) ||
      (wantsVisible && inView)
  );

  // ── edges
  const prevRef = useRef(engaged);
  const justEngaged = engaged && !prevRef.current;
  const justDisengaged = !engaged && prevRef.current;
  useEffect(() => {
    prevRef.current = engaged;
  }, [engaged]);

  return {
    engaged,
    inView,
    hovered,
    wantsHover,
    wantsVisible,
    isAlways,
    isControlledTrigger,
    justEngaged,
    justDisengaged,
    onEnter,
    onLeave,
  };
}
