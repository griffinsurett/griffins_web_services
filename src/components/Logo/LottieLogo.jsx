// src/components/Logo/LottieLogo.jsx - Standalone with integrated hooks
import { useEffect, useMemo, useRef, useState } from "react";
import lottie from "lottie-web";
import { useVisibility } from "../../hooks/animations/useVisibility";
import { useScrollInteraction } from "../../hooks/animations/useInteractions";

// Import Lottie JSON directly
import LOGO_ANIMATION from "../../Lotties/Animation_logo_small_size.json";

/**
 * Standalone LottieLogo - No wrapper needed, handles its own visibility logic
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
  const [pageScrollable, setPageScrollable] = useState(false);

  // Detect if page can scroll
  useEffect(() => {
    const el = document.documentElement;
    setPageScrollable((el?.scrollHeight || 0) > (window.innerHeight || 0) + 1);
  }, []);

  // Resolve effective trigger (enhanced with load support)
  const effectiveTrigger = useMemo(() => {
    if (trigger === "scroll" || trigger === "visible" || trigger === "load") return trigger;
    
    // Auto mode: smart detection based on position
    if (typeof window !== 'undefined' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      // Above fold = immediate load, below fold = scroll triggered
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
    ? true // Immediate activation for above-fold content
    : effectiveTrigger === "scroll"
    ? seenOnce
    : visible;

  // Initialize Lottie animation
  useEffect(() => {
    if (!shouldActivate || !lottieContainerRef.current || animationRef.current) return;
    
    try {
      animationRef.current = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: false,
        animationData: LOGO_ANIMATION,
      });

      animationRef.current.setSpeed(0.5);
      animationRef.current.goToAndStop(0, true);
      
      // Auto-start for load trigger
      if (effectiveTrigger === "load") {
        animationRef.current.setDirection(1);
        animationRef.current.play();
      }
    } catch (error) {
      console.error('Failed to load Lottie:', error);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [shouldActivate, effectiveTrigger]);

  // Scroll movement handler
  const handleMovement = useMemo(
    () => (deltaY) => {
      const anim = animationRef.current;
      const now = Date.now();
      lastScrollTime.current = now;

      if (!anim) return;

      clearTimeout(pauseTimeout.current);

      // First scroll down → activate (for scroll mode)
      if (!activated && deltaY > 0 && effectiveTrigger === "scroll") {
        setActivated(true);
      }

      // Skip if not activated in scroll mode
      if (effectiveTrigger === "scroll" && !activated) return;

      if (deltaY > 0) {
        // Scrolling down - play forward
        anim.setDirection(1);
        if (anim.isPaused) anim.play();
      } else if (deltaY < 0) {
        // Scrolling up - play reverse  
        anim.setDirection(-1);
        if (anim.isPaused) anim.play();
      }

      // Pause after scroll stops
      pauseTimeout.current = setTimeout(() => {
        if (now === lastScrollTime.current && anim) {
          anim.pause();
        }
      }, 200);
    },
    [activated, effectiveTrigger]
  );

  // Scroll interaction setup
  useScrollInteraction({
    elementRef: null,
    scrollThreshold: 1,
    debounceDelay: 8,
    trustedOnly: true,
    wheelSensitivity: 1,

    onScrollActivity: (effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load"
      ? ({ dir, delta }) => {
          const deltaY = dir === "down" ? delta : -delta;
          handleMovement(deltaY);
        }
      : undefined,

    onWheelActivity: (effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load"
      ? ({ deltaY }) => {
          handleMovement(deltaY);
        }
      : undefined,
  });

  // Visibility mode handler
  useEffect(() => {
    if (effectiveTrigger !== "visible" || !animationRef.current) return;

    if (visible) {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [effectiveTrigger, visible]);

  // Initial activation for scroll mode
  useEffect(() => {
    if (activated && animationRef.current && effectiveTrigger === "scroll") {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [activated, effectiveTrigger]);

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
      />
    </div>
  );
}