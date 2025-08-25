// src/components/Logo/LottieLogo.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import lottie from "lottie-web";
import { useVisibility } from "../../hooks/animations/useVisibility";
import { useScrollInteraction } from "../../hooks/animations/useInteractions";
import LOGO_ANIMATION from "../../Lotties/Animation_logo_small_size.json";

export default function LottieLogo({
  alt = "",
  className = "logo-class",
  mediaClasses = "block w-[40px] lg:w-[45px] h-auto",
  loading = "lazy",
  trigger = "auto",
  respectReducedMotion = true,

  width = 45,
  height = 45,
  fadeMs = 180,

  children, // 🧒 Astro <Image /> comes in here
}) {
  const containerRef = useRef(null);
  const lottieContainerRef = useRef(null);
  const animationRef = useRef(null);
  const pauseTimeout = useRef(null);
  const lastScrollTime = useRef(0);

  const [showPoster, setShowPoster] = useState(true);
  const [activated, setActivated] = useState(false);
  const [pageScrollable, setPageScrollable] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    setPageScrollable((el?.scrollHeight || 0) > (window.innerHeight || 0) + 1);
  }, []);

  const effectiveTrigger = useMemo(() => {
    if (trigger === "scroll" || trigger === "visible" || trigger === "load") return trigger;
    if (typeof window !== "undefined" && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      return rect.top < window.innerHeight ? "load" : "scroll";
    }
    return pageScrollable ? "scroll" : "load";
  }, [trigger, pageScrollable]);

  const prefersReduced =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const seenOnce = useVisibility(containerRef, { threshold: 0.1, rootMargin: "0px", once: true });
  const visible = useVisibility(containerRef, { threshold: 0, rootMargin: "0px", once: false });

  const shouldActivate = prefersReduced
    ? false
    : effectiveTrigger === "load"
    ? true
    : effectiveTrigger === "scroll"
    ? seenOnce
    : visible;

  // Init Lottie, then fade the poster out when ready
  useEffect(() => {
    if (!shouldActivate || !lottieContainerRef.current || animationRef.current || prefersReduced) return;

    try {
      const anim = lottie.loadAnimation({
        container: lottieContainerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: false,
        animationData: LOGO_ANIMATION,
      });

      animationRef.current = anim;
      anim.setSpeed(0.5);
      anim.goToAndStop(0, true);

      const onReady = () => {
        anim.goToAndStop(0, true);
        // Ensure SVG is in the DOM before we hide the poster
        requestAnimationFrame(() => setShowPoster(false));
        if (effectiveTrigger === "load") {
          anim.setDirection(1);
          anim.play();
        }
      };

      anim.addEventListener("DOMLoaded", onReady);
      anim.addEventListener("data_ready", onReady);

      return () => {
        anim.removeEventListener("DOMLoaded", onReady);
        anim.removeEventListener("data_ready", onReady);
        anim.destroy();
        animationRef.current = null;
      };
    } catch (e) {
      // Failure → keep poster
      console.error("Failed to init Lottie", e);
    }
  }, [shouldActivate, effectiveTrigger, prefersReduced]);

  // Scroll / wheel drive (same behavior as before)
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

  useScrollInteraction({
    elementRef: null,
    scrollThreshold: 1,
    debounceDelay: 8,
    trustedOnly: true,
    wheelSensitivity: 1,
    onScrollActivity:
      ((effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load")
        ? ({ dir, delta }) => handleMovement(dir === "down" ? delta : -delta)
        : undefined,
    onWheelActivity:
      ((effectiveTrigger === "scroll" && seenOnce) || effectiveTrigger === "load")
        ? ({ deltaY }) => handleMovement(deltaY)
        : undefined,
  });

  useEffect(() => {
    if (effectiveTrigger !== "visible" || !animationRef.current) return;
    if (!showPoster && visible) {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [effectiveTrigger, visible, showPoster]);

  useEffect(() => {
    if (activated && animationRef.current && effectiveTrigger === "scroll" && !showPoster) {
      animationRef.current.setDirection(1);
      animationRef.current.play();
    }
  }, [activated, effectiveTrigger, showPoster]);

  // Cleanup
  useEffect(() => () => clearTimeout(pauseTimeout.current), []);

  const shouldShowPoster = prefersReduced || showPoster;

  return (
    <div
      ref={containerRef}
      aria-label={alt}
      className={`${className} relative ${mediaClasses}`}
      style={{
        // if width/height are numbers we set explicit size; otherwise your classes handle sizing
        width: typeof width === "number" ? `${width}px` : undefined,
        height: typeof height === "number" ? `${height}px` : undefined,
      }}
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
        {/* Make any child (the Astro <Image />) fill the box cleanly */}
        <div className="w-full h-full">
          {children}
        </div>
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
