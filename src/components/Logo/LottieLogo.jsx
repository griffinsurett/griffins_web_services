// src/components/Logo/LottieLogo.jsx
// Lazy Lottie + JSON; keeps Astro <Image/> visible until the player is ready.
// Fixed sizing to prevent CLS and ensure consistency across all screen sizes.

import { useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "../../hooks/animations/useVisibility";
import { useScrollInteraction } from "../../hooks/animations/useInteractions";

// Helper: run after the browser is idle (fallback to setTimeout)
const onIdle = (cb) => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(cb, { timeout: 1000 });
  } else {
    setTimeout(cb, 0);
  }
};

export default function LottieLogo({
  alt = "",
  className = "logo-class",
  mediaClasses = "block w-[40px] h-[40px] lg:w-[45px] lg:h-[45px] object-contain", // Fixed: 40px small, 45px large
  loading = "lazy",
  trigger = "auto",              // "auto" | "scroll" | "visible" | "load"
  respectReducedMotion = true,
  
  fadeMs = 180,
  children,          // Astro <Image /> passed from parent (poster)
}) {
  const containerRef = useRef(null);
  const lottieContainerRef = useRef(null);
  const animationRef = useRef(null);
  const pauseTimeout = useRef(null);
  const lastScrollTime = useRef(0);

  const [showPoster, setShowPoster] = useState(true);
  const [activated, setActivated] = useState(false);
  const [pageScrollable, setPageScrollable] = useState(false);

  // Detect if page can scroll (affects "auto" trigger)
  useEffect(() => {
    const el = document.documentElement;
    setPageScrollable((el?.scrollHeight || 0) > (window.innerHeight || 0) + 1);
  }, []);

  // Resolve trigger
  const effectiveTrigger = useMemo(() => {
    if (trigger === "scroll" || trigger === "visible" || trigger === "load") return trigger;

    // "auto": above the fold → "load"; below → "scroll"
    if (typeof window !== "undefined" && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      return rect.top < window.innerHeight ? "load" : "scroll";
    }
    return pageScrollable ? "scroll" : "load";
  }, [trigger, pageScrollable]);

  // Reduced motion guard
  const prefersReduced =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // Visibility helpers
  const seenOnce = useVisibility(containerRef, { threshold: 0.1, rootMargin: "0px", once: true });
  const visible = useVisibility(containerRef, { threshold: 0, rootMargin: "0px", once: false });

  // Decide if we should even spin up the player
  const shouldActivate = prefersReduced
    ? false
    : effectiveTrigger === "load"
    ? true
    : effectiveTrigger === "scroll"
    ? seenOnce
    : visible;

  // Initialize Lottie lazily (player + JSON), then fade out the poster
  useEffect(() => {
    if (!shouldActivate || !lottieContainerRef.current || animationRef.current || prefersReduced) return;

    let canceled = false;

    onIdle(async () => {
      if (canceled) return;

      try {
        // 1) Smaller player build to reduce parse time
        const { default: lottie } = await import("lottie-web/build/player/lottie_light");

        // 2) Fetch JSON at runtime so it doesn't bloat the bundle
        const res = await fetch(new URL("../../Lotties/Animation_logo_small_size.json", import.meta.url));
        const animationData = await res.json();
        if (canceled) return;

        const anim = lottie.loadAnimation({
          container: lottieContainerRef.current,
          renderer: "svg",   // consider "canvas" if SVG DOM is heavy
          loop: true,
          autoplay: false,
          animationData,
        });

        animationRef.current = anim;
        anim.setSpeed(0.5);
        anim.goToAndStop(0, true);

        const ready = () => {
          // Ensure first frame matches the poster before fading
          anim.goToAndStop(0, true);
          // Wait a frame so the SVG is in the DOM, then fade the poster
          requestAnimationFrame(() => setShowPoster(false));
          if (effectiveTrigger === "load") {
            anim.setDirection(1);
            anim.play();
          }
        };

        // Some builds may not fire both; guard with microtask too
        anim.addEventListener("DOMLoaded", ready);
        anim.addEventListener("data_ready", ready);
        Promise.resolve().then(() => ready());
      } catch (err) {
        // On failure, we simply keep the poster
        console.error("Lottie lazy init failed:", err);
      }
    });

    return () => {
      canceled = true;
      animationRef.current?.destroy?.();
      animationRef.current = null;
    };
  }, [shouldActivate, effectiveTrigger, prefersReduced]);

  // Scroll & wheel drive
  const handleMovement = useMemo(
    () => (deltaY) => {
      const anim = animationRef.current;
      const now = Date.now();
      lastScrollTime.current = now;
      if (!anim) return;

      clearTimeout(pauseTimeout.current);

      if (!activated && deltaY > 0 && effectiveTrigger === "scroll") {
        setActivated(true);
      }
      if (effectiveTrigger === "scroll" && !activated) return;

      if (deltaY > 0) {
        anim.setDirection(1);
        if (anim.isPaused) anim.play();
      } else if (deltaY < 0) {
        anim.setDirection(-1);
        if (anim.isPaused) anim.play();
      }

      pauseTimeout.current = setTimeout(() => {
        if (now === lastScrollTime.current && anim) anim.pause();
      }, 200);
    },
    [activated, effectiveTrigger]
  );

  // Only attach listeners once Lottie is ready (poster hidden) to keep things lean
  const lottieReady = !!animationRef.current && !showPoster;

  useScrollInteraction({
    elementRef: null,
    scrollThreshold: 1,
    debounceDelay: 8,
    trustedOnly: true,
    wheelSensitivity: 1,
    onScrollActivity:
      lottieReady && ((effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load")
        ? ({ dir, delta }) => handleMovement(dir === "down" ? delta : -delta)
        : undefined,
    onWheelActivity:
      lottieReady && ((effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load")
        ? ({ deltaY }) => handleMovement(deltaY)
        : undefined,
  });

  // Visible mode: play when in view (after poster is gone)
  useEffect(() => {
    if (effectiveTrigger !== "visible" || !animationRef.current) return;
    if (!showPoster && visible) {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [effectiveTrigger, visible, showPoster]);

  // Scroll mode: start play after first activation (after poster is gone)
  useEffect(() => {
    if (activated && animationRef.current && effectiveTrigger === "scroll" && !showPoster) {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [activated, effectiveTrigger, showPoster]);

  // Cleanup timers
  useEffect(() => () => clearTimeout(pauseTimeout.current), []);

  const shouldShowPoster = prefersReduced || showPoster;

  return (
    <div
      ref={containerRef}
      aria-label={alt}
      className={`${className} relative ${mediaClasses}`}
    >
      {/* Poster layer (Astro <Image />) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transition: `opacity ${fadeMs}ms ease`,
          opacity: shouldShowPoster ? 1 : 0,
        }}
        aria-hidden={!shouldShowPoster}
      >
        <div className="w-full h-full">{children}</div>
      </div>

      {/* Lottie layer */}
      <div
        ref={lottieContainerRef}
        className="absolute inset-0"
        style={{ visibility: prefersReduced ? "hidden" : "visible" }}
        aria-hidden={shouldShowPoster}
      />
    </div>
  );
}