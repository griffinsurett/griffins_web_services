// src/components/AnimatedBorder.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEngagedByTriggers } from "./useEngagedByTriggers";

const clampPercent = (value) => {
  const raw =
    typeof value === "number"
      ? value
      : typeof value === "string"
      ? parseFloat(value)
      : NaN;
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(100, raw));
};

/**
 * AnimatedBorder
 * Variants:
 *  - "none" | "solid" | "progress" | "progress-infinite" | "progress-b-f"
 *
 * Triggers (any true engages):
 *  - "hover" | "visible" | "always" | "controlled" | string[]
 *
 * Extras:
 *  - controller: number (percent 0..100) when variant="progress"
 *
 * Visibility window:
 *  - visibleRootMargin: number|string|object passed to io.
 *    number N => shrink top/bottom by N px (e.g., 120 => "-120px 0px -120px 0px")
 */
const AnimatedBorder = ({
  children,

  // Behavior
  variant = "none",
  triggers = "hover",
  active = false, // for "controlled"

  // Controlled progress
  controller, // number 0..100 when provided

  // Timings
  duration = 2000,
  fadeOutMs = 220,

  // Styling
  color = "var(--color-accent)",
  borderRadius = "rounded-3xl",
  borderWidth = 2,
  className = "",
  innerClassName = "",

  // Hover behavior
  hoverDelay = 0,
  unhoverIntent,

  // Visibility engage window (IO root margin)
  visibleRootMargin = 75, // number|string|{top,right,bottom,left}

  // passthrough
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  // ── engagement
  const hostRef = useRef(null);

  const {
    engaged,
    isAlways,
    onEnter,
    onLeave,
  } = useEngagedByTriggers({
    ref: hostRef,
    triggers,
    active,
    hoverDelay,
    unhoverIntent,
    visibleRootMargin,
    visibilityOptions: { threshold: 0.25 },
  });

  // Safety: also compute "forceAlways" from prop in case caller passes strings not normalized
  const forceAlways = useMemo(() => {
    const list = Array.isArray(triggers) ? triggers : [triggers];
    return list.map((t) => String(t || "").toLowerCase()).includes("always");
  }, [triggers]);

  const engagedFinal = engaged || isAlways || forceAlways;

  // ── progress engine
  const controllerValue = useMemo(() => {
    if (controller == null) return null;
    return clampPercent(controller);
  }, [controller]);

  const controllerProvided = Number.isFinite(controllerValue);

  const latestPercentRef = useRef(controllerProvided ? controllerValue : 0);
  const [fadingOut, setFadingOut] = useState(false);
  const [freezeAt, setFreezeAt] = useState(null);
  const prevEngagedRef = useRef(engagedFinal);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (variant !== "progress") {
      prevEngagedRef.current = engagedFinal;
      return;
    }

    const prev = prevEngagedRef.current;
    prevEngagedRef.current = engagedFinal;

    if (engagedFinal && !prev) {
      setFadingOut(false);
      setFreezeAt(null);
      return;
    }

    if (!engagedFinal && prev) {
      setFreezeAt(latestPercentRef.current);
      setFadingOut(true);
      const timeout = setTimeout(() => {
        setFadingOut(false);
        setFreezeAt(null);
        latestPercentRef.current = 0;
      }, fadeOutMs);
      return () => clearTimeout(timeout);
    }
  }, [variant, engagedFinal, fadeOutMs]);

  useEffect(() => {
    if (variant !== "progress") return;
    if (controllerProvided) {
      if (engagedFinal) {
        latestPercentRef.current = controllerValue ?? 0;
      }
      return;
    }
    if (engagedFinal) {
      latestPercentRef.current = 100;
    }
  }, [variant, engagedFinal, controllerProvided, controllerValue]);

  const resolvedPercent = useMemo(() => {
    if (variant === "progress") {
      if (controllerProvided) {
        return controllerValue ?? 0;
      }
      return engagedFinal && mounted ? 100 : 0;
    }
    if (variant === "progress-b-f") {
      return engagedFinal ? 100 : 0;
    }
    return 0;
  }, [variant, controllerProvided, controllerValue, engagedFinal, mounted]);

  const displayPercent =
    variant === "progress" && !engagedFinal && freezeAt != null
      ? freezeAt
      : resolvedPercent;

  const bw = typeof borderWidth === "number" ? `${borderWidth}px` : borderWidth;

  const overlayStyle = {
    "--ab-color": color,
    "--ab-border-width": bw,
    "--ab-duration": `${duration}ms`,
    "--ab-fade-duration": `${fadeOutMs}ms`,
  };

  if (variant === "progress" || variant === "progress-b-f") {
    overlayStyle["--ab-progress"] = `${(displayPercent || 0) * 3.6}deg`;
  }

  if (variant === "progress") {
    overlayStyle.opacity = engagedFinal || fadingOut ? 1 : 0;
  } else if (variant === "solid") {
    overlayStyle.opacity = engagedFinal ? 1 : 0;
    overlayStyle.padding = engagedFinal ? bw : "0px";
  } else if (variant === "progress-infinite") {
    overlayStyle.opacity = engagedFinal ? 1 : 0;
    overlayStyle.animationPlayState = engagedFinal ? "running" : "paused";
  }

  const overlayClassNames = [
    "absolute",
    "inset-0",
    borderRadius,
    "pointer-events-none",
    "z-20",
    "animated-border-overlay",
  ];

  if (variant === "solid") {
    overlayClassNames.push(
      "is-solid",
      "transition-all",
      "duration-800",
      "ease-in-out"
    );
  } else if (variant === "progress") {
    overlayClassNames.push("progress");
  } else if (variant === "progress-b-f") {
    overlayClassNames.push("progress-b-f");
  } else if (variant === "progress-infinite") {
    overlayClassNames.push("progress-infinite");
  }

  const mountOverlay = variant !== "none";

  const handleEnter = (e) => {
    onMouseEnter?.(e);
    onEnter(e);
  };

  const handleLeave = (e) => {
    onMouseLeave?.(e);
    onLeave(e);
  };

  return (
    <div
      ref={hostRef}
      className={`relative ${className}`.trim()}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {mountOverlay && variant !== "none" && (
        <div className={overlayClassNames.join(" ")} style={overlayStyle} />
      )}

      <div
        className={`relative z-10 overflow-hidden ${borderRadius} ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorder;
