// src/components/Logo/LottieLogo.jsx - Performance optimized
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useVisibility } from "../../hooks/animations/useVisibility";
import { useScrollInteraction } from "../../hooks/animations/useInteractions";

/**
 * Performance-optimized LottieLogo
 * - Lazy loads lottie-web only when needed
 * - Defers animation initialization until interaction
 * - Uses canvas renderer for better performance
 */
export default function LottieLogo({
  alt = "",
  className = "logo-class", 
  mediaClasses = "block w-[40px] lg:w-[45px] h-auto",
  loading = "lazy",
  trigger = "auto",
  respectReducedMotion = true,
}) {
  const containerRef = useRef(null);
  const lottieContainerRef = useRef(null);
  const animationRef = useRef(null);
  const pauseTimeout = useRef(null);
  const lastScrollTime = useRef(0);
  
  const [activated, setActivated] = useState(false);
  const [lottieLoaded, setLottieLoaded] = useState(false);
  const [pageScrollable, setPageScrollable] = useState(false);

  // Detect if page can scroll
  useEffect(() => {
    const el = document.documentElement;
    setPageScrollable((el?.scrollHeight || 0) > (window.innerHeight || 0) + 1);
  }, []);

  // Resolve effective trigger
  const effectiveTrigger = useMemo(() => {
    if (trigger === "scroll" || trigger === "visible" || trigger === "load") return trigger;
    
    if (typeof window !== 'undefined' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      return rect.top < viewportHeight ? 'load' : 'scroll';
    }
    
    return pageScrollable ? "scroll" : "load";
  }, [trigger, pageScrollable]);

  // Reduced motion guard
  const prefersReduced =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Visibility detection hooks
  const seenOnce = useVisibility(containerRef, {
    threshold: 0.1,
    rootMargin: "0px",
    once: true,
  });

  const visible = useVisibility(containerRef, {
    threshold: 0,
    rootMargin: "0px", 
    once: false,
  });

  // Final activation decision
  const shouldActivate = prefersReduced
    ? false
    : effectiveTrigger === "load"
    ? true
    : effectiveTrigger === "scroll"
    ? seenOnce
    : visible;

  // Lazy load lottie-web library
  const loadLottie = useCallback(async () => {
    if (lottieLoaded) return;
    
    try {
      // Dynamic import to avoid blocking main bundle
      const lottie = (await import('lottie-web')).default;
      // Dynamic import of animation data
      const animationData = (await import("../../Lotties/Animation_logo_small_size.json")).default;
      
      if (!lottieContainerRef.current) return;

      animationRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "canvas", // Canvas is faster than SVG for animations
        loop: true,
        autoplay: false,
        animationData,
        // Performance optimizations
        rendererSettings: {
          clearCanvas: true,
          progressiveLoad: true,
          hideOnTransparent: true,
        }
      });

      animationRef.current.setSpeed(0.5);
      animationRef.current.goToAndStop(0, true);
      
      // Auto-start for load trigger
      if (effectiveTrigger === "load") {
        animationRef.current.setDirection(1);
        animationRef.current.play();
      }

      setLottieLoaded(true);
    } catch (error) {
      console.error('Failed to load Lottie:', error);
    }
  }, [lottieLoaded, effectiveTrigger]);

  // Initialize Lottie when activated
  useEffect(() => {
    if (!shouldActivate) return;
    
    // Use requestIdleCallback to defer loading during idle time
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadLottie(), { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(loadLottie, 100);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [shouldActivate, loadLottie]);

  // Optimized scroll movement handler
  const handleMovement = useCallback((deltaY) => {
    if (!lottieLoaded || !animationRef.current) return;
    
    const anim = animationRef.current;
    const now = Date.now();
    lastScrollTime.current = now;

    clearTimeout(pauseTimeout.current);

    // First scroll down → activate (for scroll mode)
    if (!activated && deltaY > 0 && effectiveTrigger === "scroll") {
      setActivated(true);
    }

    // Skip if not activated in scroll mode
    if (effectiveTrigger === "scroll" && !activated) return;

    if (deltaY > 0) {
      anim.setDirection(1);
      if (anim.isPaused) anim.play();
    } else if (deltaY < 0) {
      anim.setDirection(-1);
      if (anim.isPaused) anim.play();
    }

    // Pause after scroll stops
    pauseTimeout.current = setTimeout(() => {
      if (now === lastScrollTime.current && anim) {
        anim.pause();
      }
    }, 200);
  }, [lottieLoaded, activated, effectiveTrigger]);

  // Scroll interaction setup - only when Lottie is loaded
  useScrollInteraction({
    elementRef: null,
    scrollThreshold: 1,
    debounceDelay: 16, // Reduced for smoother interaction
    trustedOnly: true,
    wheelSensitivity: 1,

    onScrollActivity: lottieLoaded && ((effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load")
      ? ({ dir, delta }) => {
          const deltaY = dir === "down" ? delta : -delta;
          handleMovement(deltaY);
        }
      : undefined,

    onWheelActivity: lottieLoaded && ((effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load")
      ? ({ deltaY }) => {
          handleMovement(deltaY);
        }
      : undefined,
  });

  // Visibility mode handler
  useEffect(() => {
    if (effectiveTrigger !== "visible" || !lottieLoaded || !animationRef.current) return;

    if (visible) {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [effectiveTrigger, visible, lottieLoaded]);

  // Initial activation for scroll mode
  useEffect(() => {
    if (activated && lottieLoaded && animationRef.current && effectiveTrigger === "scroll") {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [activated, lottieLoaded, effectiveTrigger]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(pauseTimeout.current);
    };
  }, []);

  return (
    <div ref={containerRef}>
      <div 
        ref={lottieContainerRef}
        className={`${className} ${mediaClasses}`}
        aria-label={alt}
        style={{
          // Ensure container has dimensions even before Lottie loads
          width: '45px',
          height: '45px',
          minWidth: '40px',
          minHeight: '40px',
        }}
      />
    </div>
  );
}