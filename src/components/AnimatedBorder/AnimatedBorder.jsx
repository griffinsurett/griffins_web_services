// src/components/AnimatedBorder.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReversibleProgress } from "./useReversibleProgress";
import { useEngagedByTriggers } from "./useEngagedByTriggers";

/**
 * AnimatedBorder
 * Variants:
 *  - "none" | "solid" | "progress" | "progress-infinite" | "progress-b-f"
 *
 * Triggers (any true engages):
 *  - "hover" | "visible" | "always" | "controlled" | string[]
 *
 * Extras:
 *  - controller: number | () => number        // external percent (0..100)
 *  - reverseOn="leave" | "intent" | "never"   // hover reverse policy for b-f
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
  controller, // number OR () => number

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
  reverseOn, // "leave" | "intent" | "never"

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
  const hookMode =
    variant === "progress-infinite"
      ? "infinite"
      : variant === "progress-b-f"
      ? "backAndForth"
      : "forwardOnly";

  const {
    percent,
    reversing,
    setEngaged: setEngineEngaged,
    reverseOnce,
    reset,
  } = useReversibleProgress({ duration, mode: hookMode });

  // External controller
  const controllerIsFn = typeof controller === "function";
  const controllerIsNum = typeof controller === "number";
  const controllerProvided = controllerIsFn || controllerIsNum;

  const clamp = (n) => (Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0);
  const [providedPercent, setProvidedPercent] = useState(
    controllerIsNum ? clamp(controller) : 0
  );

  useEffect(() => {
    if (controllerIsNum) setProvidedPercent(clamp(controller));
  }, [controllerIsNum, controller]);

  useEffect(() => {
    if (!controllerIsFn) return;
    let raf;
    const tick = () => {
      try {
        setProvidedPercent(clamp(controller()));
      } catch {}
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [controllerIsFn, controller]);

  // Hover reverse policy
  const derivedReversePolicy = useMemo(() => {
    if (reverseOn) return reverseOn;
    if (variant === "progress-b-f" && wantsHover) return "leave";
    return "never";
  }, [reverseOn, variant, wantsHover]);

  const effectivePercent = controllerProvided ? providedPercent : percent;

  // ── fade bookkeeping for "progress"
  const [fadingOut, setFadingOut] = useState(false);
  const [freezeAt, setFreezeAt] = useState(null);
  const latestPercentRef = useRef(0);
  useEffect(() => {
    latestPercentRef.current = effectivePercent;
  }, [effectivePercent]);

  // Drive engine on engagement changes
  const prevEngagedRef = useRef(engagedFinal);
  useEffect(() => {
    if (controllerProvided) return;

    const prev = prevEngagedRef.current;
    const justOn = engagedFinal && !prev;
    const justOff = !engagedFinal && prev;
    prevEngagedRef.current = engagedFinal;

    if (variant === "progress-b-f" || variant === "progress-infinite") {
      setEngineEngaged(!!engagedFinal);
      if (variant === "progress-b-f" && justOff) reverseOnce();
      if (variant === "progress-b-f" && justOn) {
        setFadingOut(false);
        setFreezeAt(null);
      }
    } else if (variant === "progress") {
      if (engagedFinal) {
        setEngineEngaged(true);
        if (justOn) {
          setFadingOut(false);
          setFreezeAt(null);
        }
      } else {
        if (justOff) {
          setFreezeAt(latestPercentRef.current);
          setFadingOut(true);
        }
        setEngineEngaged(false);
      }
    }
  }, [
    controllerProvided,
    variant,
    engagedFinal,
    setEngineEngaged,
    reverseOnce,
  ]);

  useEffect(() => {
    if (variant !== "progress" || !fadingOut) return;
    const t = setTimeout(() => {
      setFadingOut(false);
      setFreezeAt(null);
      reset();
    }, fadeOutMs);
    return () => clearTimeout(t);
  }, [variant, fadingOut, fadeOutMs, reset]);

  // Hover handlers (pipe through)
  const handleEnter = (e) => {
    onMouseEnter?.(e);
    onEnter(e);
  };
  const handleLeave = (e) => {
    onMouseLeave?.(e);
    onLeave(e);
    if (
      !controllerProvided &&
      variant === "progress-b-f" &&
      derivedReversePolicy === "leave"
    ) {
      reverseOnce();
    }
  };

  // ── mount/visibility: keep visible during reverse/fade
  const showBorder =
    variant === "progress"
      ? engagedFinal || fadingOut
      : variant !== "none" &&
        (isAlways ||
          forceAlways ||
          (wantsHover && hovered) ||
          (isControlledTrigger && !!active) ||
          reversing ||
          (wantsVisible && (inView || reversing)));

  // ── styles
  const bw = typeof borderWidth === "number" ? `${borderWidth}px` : borderWidth;

  const baseMask = {
    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMask:
      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    maskComposite: "exclude",
    WebkitMaskComposite: "xor",
  };

  const overlayStyleSolid = {
    background: color,
    ...baseMask,
    padding: engagedFinal ? bw : "0px",
    opacity: engagedFinal ? 1 : 0,
  };

  const displayPercent = freezeAt != null ? freezeAt : effectivePercent;
  const overlayStyleProgress = {
    background: `conic-gradient(
      from 0deg,
      ${color} 0deg,
      ${color} ${displayPercent * 3.6}deg,
      transparent ${displayPercent * 3.6}deg,
      transparent 360deg
    )`,
    ...baseMask,
    padding: bw,
    opacity: variant === "progress" ? (engagedFinal ? 1 : 0) : 1,
    transition:
      variant === "progress"
        ? `opacity ${fadeOutMs}ms cubic-bezier(.2,0,0,1)`
        : undefined,
    willChange: variant === "progress" ? "opacity" : undefined,
  };

  const mountOverlay = variant === "solid" ? variant !== "none" : showBorder;

  return (
    <div
      ref={hostRef}
      className={`relative ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {mountOverlay && variant !== "none" && (
        <div
          className={`absolute inset-0 ${borderRadius} pointer-events-none z-20 ${
            variant === "solid"
              ? "transition-all duration-800 ease-in-out"
              : variant === "progress"
              ? "transition-all"
              : ""
          }`}
          style={variant === "solid" ? overlayStyleSolid : overlayStyleProgress}
        />
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
