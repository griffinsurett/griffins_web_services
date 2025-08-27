// src/components/OptimizedLottie/OptimizedLottie.jsx
// Generic, performance-optimized Lottie component
// Accepts any Lottie JSON and Astro Image as fallback

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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

/**
 * OptimizedLottie - Generic Lottie component with Astro Image fallback
 * 
 * @param {string} animationData - URL to Lottie JSON file or JSON object
 * @param {ReactNode} children - Astro optimized Image component (fallback)
 * @param {string} className - CSS classes for container
 * @param {string} mediaClasses - CSS classes for sizing
 * @param {Object} lottieOptions - Lottie configuration options
 * @param {Object} triggerOptions - When/how to activate the animation
 * @param {Object} interactionOptions - Scroll/wheel interaction settings
 */
export default function OptimizedLottie({
  // Core props
  animationData,     // Lottie JSON file URL or object
  children,          // Astro <Image /> component (fallback/poster)
  
  // Styling
  className = "",
  mediaClasses = "",
  alt = "",
  
  // Lottie configuration
  lottieOptions = {},
  
  // Trigger configuration
  triggerOptions = {},
  
  // Interaction configuration  
  interactionOptions = {},
  
  // Performance options
  respectReducedMotion = true,
  fadeMs = 180,
}) {
  // Destructure options with defaults
  const {
    renderer = "svg",
    loop = true,
    autoplay = false,
    speed = 0.5,
    ...otherLottieOptions
  } = lottieOptions;

  const {
    trigger = "auto",           // "auto" | "scroll" | "visible" | "load"
    loading = "lazy",           // affects trigger resolution
  } = triggerOptions;

  const {
    scrollThreshold = 1,
    debounceDelay = 8,
    wheelSensitivity = 1,
    pauseDelay = 200,
    enableScrollDrive = true,
    enableWheelDrive = true,
  } = interactionOptions;

  // Refs and state
  const containerRef = useRef(null);
  const lottieContainerRef = useRef(null);
  const animationRef = useRef(null);
  const pauseTimeout = useRef(null);
  const lastScrollTime = useRef(0);

  const [showPoster, setShowPoster] = useState(true);
  const [activated, setActivated] = useState(false);
  const [pageScrollable, setPageScrollable] = useState(false);
  const [lottieError, setLottieError] = useState(false);

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
  const prefersReduced = useMemo(() => 
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    [respectReducedMotion]
  );

  // Visibility helpers
  const seenOnce = useVisibility(containerRef, { 
    threshold: 0.1, 
    rootMargin: "0px", 
    once: true 
  });
  
  const visible = useVisibility(containerRef, { 
    threshold: 0, 
    rootMargin: "0px", 
    once: false 
  });

  // Decide if we should activate Lottie
  const shouldActivate = useMemo(() => {
    if (prefersReduced || lottieError) return false;
    
    switch (effectiveTrigger) {
      case "load": return true;
      case "scroll": return seenOnce;
      case "visible": return visible;
      default: return false;
    }
  }, [prefersReduced, lottieError, effectiveTrigger, seenOnce, visible]);

  // Load animation data helper
  const loadAnimationData = useCallback(async () => {
    if (typeof animationData === "string") {
      // It's a URL - fetch the JSON
      const response = await fetch(animationData);
      if (!response.ok) {
        throw new Error(`Failed to fetch Lottie JSON: ${response.status}`);
      }
      return await response.json();
    } else {
      // It's already a JSON object
      return animationData;
    }
  }, [animationData]);

  // Initialize Lottie lazily
  useEffect(() => {
    if (!shouldActivate || !lottieContainerRef.current || animationRef.current || lottieError) {
      return;
    }

    let canceled = false;

    onIdle(async () => {
      if (canceled) return;

      try {
        // Dynamic import for code splitting
        const { default: lottie } = await import("lottie-web/build/player/lottie_light");
        
        // Load animation data
        const data = await loadAnimationData();
        if (canceled) return;

        // Create Lottie animation
        const anim = lottie.loadAnimation({
          container: lottieContainerRef.current,
          renderer,
          loop: false, // We'll control looping manually for better control
          autoplay: false, // We'll control playback manually
          animationData: data,
          ...otherLottieOptions
        });

        animationRef.current = anim;
        anim.setSpeed(speed);
        anim.goToAndStop(0, true);

        const ready = () => {
          // Ensure first frame is rendered before fading poster
          anim.goToAndStop(0, true);
          requestAnimationFrame(() => {
            setShowPoster(false);
            
            // Auto-start for load trigger
            if (effectiveTrigger === "load") {
              anim.setDirection(1);
              if (loop) {
                anim.loop = true;
              }
              anim.play();
            }
          });
        };

        // Handle ready events
        anim.addEventListener("DOMLoaded", ready);
        anim.addEventListener("data_ready", ready);
        Promise.resolve().then(() => ready()); // Fallback

      } catch (err) {
        console.error("OptimizedLottie: Failed to load animation:", err);
        setLottieError(true);
        // Keep showing the poster on error
      }
    });

    return () => {
      canceled = true;
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [shouldActivate, effectiveTrigger, loadAnimationData, renderer, speed, loop, otherLottieOptions, lottieError]);

  // Scroll & wheel interaction handler
  const handleMovement = useCallback((deltaY) => {
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

    // Control animation direction based on scroll
    if (deltaY > 0) {
      anim.setDirection(1);
      if (anim.isPaused) anim.play();
    } else if (deltaY < 0) {
      anim.setDirection(-1);
      if (anim.isPaused) anim.play();
    }

    // Auto-pause after inactivity
    pauseTimeout.current = setTimeout(() => {
      if (now === lastScrollTime.current && anim) {
        anim.pause();
      }
    }, pauseDelay);
  }, [activated, effectiveTrigger, pauseDelay]);

  // Only attach scroll interactions when Lottie is ready
  const lottieReady = !!animationRef.current && !showPoster;
  const shouldEnableInteractions = lottieReady && 
    ((effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load");

  useScrollInteraction({
    elementRef: null, // Use window
    scrollThreshold,
    debounceDelay,
    trustedOnly: true,
    wheelSensitivity,
    onScrollActivity: (shouldEnableInteractions && enableScrollDrive) ? 
      ({ dir, delta }) => handleMovement(dir === "down" ? delta : -delta) : undefined,
    onWheelActivity: (shouldEnableInteractions && enableWheelDrive) ? 
      ({ deltaY }) => handleMovement(deltaY) : undefined,
  });

  // Visible mode: auto-play when in viewport
  useEffect(() => {
    if (effectiveTrigger !== "visible" || !animationRef.current || showPoster) return;
    
    if (visible) {
      animationRef.current.setDirection(1);
      if (loop) {
        animationRef.current.loop = true;
      }
      animationRef.current.play();
    } else {
      animationRef.current.pause();
    }
  }, [effectiveTrigger, visible, showPoster, loop]);

  // Scroll mode: start playback after activation
  useEffect(() => {
    if (activated && animationRef.current && effectiveTrigger === "scroll" && !showPoster) {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [activated, effectiveTrigger, showPoster]);

  // Cleanup
  useEffect(() => () => clearTimeout(pauseTimeout.current), []);

  const shouldShowPoster = prefersReduced || showPoster || lottieError;

  return (
    <div
      ref={containerRef}
      aria-label={alt}
      className={`${className} relative ${mediaClasses}`}
    >
      {/* Poster/Fallback layer (Astro <Image />) */}
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
        style={{ 
          visibility: (prefersReduced || lottieError) ? "hidden" : "visible" 
        }}
        aria-hidden={shouldShowPoster}
      />
    </div>
  );
}