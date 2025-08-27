// src/components/OptimizedLottie.jsx
// Reusable, performance-optimized Lottie component with Astro Image fallback

import { useEffect, useMemo, useRef, useState } from "react";
import { useVisibility } from "../hooks/animations/useVisibility";
import { useScrollInteraction } from "../hooks/animations/useInteractions";

// Helper: run after the browser is idle (fallback to setTimeout)
const onIdle = (cb) => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(cb, { timeout: 1000 });
  } else {
    setTimeout(cb, 0);
  }
};

export default function OptimizedLottie({
  // Animation source (provide one of these)
  animationData = null,        // Pre-loaded JSON data
  animationUrl = null,         // URL to JSON file (will fetch at runtime)
  
  // Display options
  alt = "",
  className = "",
  containerClasses = "relative",
  
  // Behavior options
  trigger = "load",            // "auto" | "scroll" | "visible" | "load"
  respectReducedMotion = true,
  
  // Animation options
  loop = true,
  autoplay = false,
  speed = 1,
  renderer = "svg",            // "svg" | "canvas" | "html"
  
  // Performance options
  fadeMs = 180,
  scrollThreshold = 1,
  debounceDelay = 8,
  wheelSensitivity = 1,
  
  // Fallback content (Astro Image)
  children,
}) {
  const containerRef = useRef(null);
  const lottieContainerRef = useRef(null);
  const animationRef = useRef(null);
  const pauseTimeout = useRef(null);
  const lastScrollTime = useRef(0);

  const [showFallback, setShowFallback] = useState(true);
  const [activated, setActivated] = useState(false);
  const [pageScrollable, setPageScrollable] = useState(false);

  // Detect if page can scroll (affects "auto" trigger)
  useEffect(() => {
    const el = document.documentElement;
    setPageScrollable((el?.scrollHeight || 0) > (window.innerHeight || 0) + 1);
  }, []);

  // Resolve effective trigger
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

  // Initialize Lottie lazily
  useEffect(() => {
    if (!shouldActivate || !lottieContainerRef.current || animationRef.current || prefersReduced) return;
    if (!animationData && !animationUrl) {
      console.warn("OptimizedLottie: No animationData or animationUrl provided");
      return;
    }

    let canceled = false;

    onIdle(async () => {
      if (canceled) return;

      try {
        // 1) Load Lottie player (use light build for performance)
        const { default: lottie } = await import("lottie-web/build/player/lottie_light");

        // 2) Get animation data (either pre-loaded or fetch from URL)
        let data = animationData;
        if (!data && animationUrl) {
          const res = await fetch(animationUrl);
          data = await res.json();
        }
        
        if (canceled || !data) return;

        // 3) Create animation
        const anim = lottie.loadAnimation({
          container: lottieContainerRef.current,
          renderer,
          loop,
          autoplay,
          animationData: data,
        });

        animationRef.current = anim;
        anim.setSpeed(speed);
        
        if (!autoplay) {
          anim.goToAndStop(0, true);
        }

        const ready = () => {
          // Ensure first frame is set before fading
          if (!autoplay) {
            anim.goToAndStop(0, true);
          }
          // Wait a frame so the animation is in the DOM, then fade the fallback
          requestAnimationFrame(() => setShowFallback(false));
          
          // Auto-start for certain triggers
          if (effectiveTrigger === "load" && autoplay) {
            anim.setDirection(1);
            anim.play();
          }
        };

        // Handle different loading events
        anim.addEventListener("DOMLoaded", ready);
        anim.addEventListener("data_ready", ready);
        Promise.resolve().then(() => ready()); // Fallback
      } catch (err) {
        console.error("OptimizedLottie: Failed to load animation:", err);
        // Keep fallback visible on error
      }
    });

    return () => {
      canceled = true;
      animationRef.current?.destroy?.();
      animationRef.current = null;
    };
  }, [shouldActivate, effectiveTrigger, prefersReduced, animationData, animationUrl, renderer, loop, autoplay, speed]);

  // Scroll interaction handling
  const handleMovement = useMemo(
    () => (deltaY) => {
      const anim = animationRef.current;
      const now = Date.now();
      lastScrollTime.current = now;
      if (!anim) return;

      clearTimeout(pauseTimeout.current);

      // First scroll down activates scroll-triggered animations
      if (!activated && deltaY > 0 && effectiveTrigger === "scroll") {
        setActivated(true);
      }
      if (effectiveTrigger === "scroll" && !activated) return;

      // Control playback direction based on scroll
      if (deltaY > 0) {
        anim.setDirection(1);
        if (anim.isPaused) anim.play();
      } else if (deltaY < 0) {
        anim.setDirection(-1);
        if (anim.isPaused) anim.play();
      }

      // Pause after inactivity
      pauseTimeout.current = setTimeout(() => {
        if (now === lastScrollTime.current && anim) anim.pause();
      }, 200);
    },
    [activated, effectiveTrigger]
  );

  // Only attach scroll listeners once Lottie is ready
  const lottieReady = !!animationRef.current && !showFallback;

  useScrollInteraction({
    elementRef: null,
    scrollThreshold,
    debounceDelay,
    trustedOnly: true,
    wheelSensitivity,
    onScrollActivity:
      lottieReady && ((effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load")
        ? ({ dir, delta }) => handleMovement(dir === "down" ? delta : -delta)
        : undefined,
    onWheelActivity:
      lottieReady && ((effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load")
        ? ({ deltaY }) => handleMovement(deltaY)
        : undefined,
  });

  // Visible mode: play when in view
  useEffect(() => {
    if (effectiveTrigger !== "visible" || !animationRef.current) return;
    if (!showFallback && visible) {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [effectiveTrigger, visible, showFallback]);

  // Scroll mode: start play after first activation
  useEffect(() => {
    if (activated && animationRef.current && effectiveTrigger === "scroll" && !showFallback) {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [activated, effectiveTrigger, showFallback]);

  // Cleanup
  useEffect(() => () => clearTimeout(pauseTimeout.current), []);

  const shouldShowFallback = prefersReduced || showFallback;

  return (
    <div
      ref={containerRef}
      aria-label={alt}
      className={`${className} ${containerClasses}`}
    >
      {/* Fallback layer (Astro Image) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transition: `opacity ${fadeMs}ms ease`,
          opacity: shouldShowFallback ? 1 : 0,
        }}
        aria-hidden={!shouldShowFallback}
      >
        <div className="w-full h-full">{children}</div>
      </div>

      {/* Lottie layer */}
      <div
        ref={lottieContainerRef}
        className="absolute inset-0"
        style={{ visibility: prefersReduced ? "hidden" : "visible" }}
        aria-hidden={shouldShowFallback}
      />
    </div>
  );
}