// src/components/Logo/VideoLogo.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useScrollTriggeredVideo } from "./useScrollTriggeredVideo";
import { useVisibility } from "../../hooks/animations/useVisibility";

import POSTER_SRC from "@/assets/GWS-animated.png";
import VIDEO_SRC from "../../assets/GWS-animated.webm";

/**
 * VideoLogo
 * - trigger:
 *    - "auto" (default): use scroll-trigger if the page is scrollable; otherwise start when visible
 *    - "scroll": always require a scroll-trigger
 *    - "visible": start as soon as the logo becomes visible (no scroll needed)
 * - respectReducedMotion: if true, shows poster for users preferring reduced motion
 */
export default function VideoLogo({
  alt = "",
  className = "logo-class",
  mediaClasses = "block w-[35px] p-0 m-0 md:w-[40px] lg:w-[45px] h-auto",
  loading = "lazy",
  trigger = "auto", // "auto" | "scroll" | "visible"
  respectReducedMotion = true,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // detect if the page can scroll (run on client after mount)
  const [pageScrollable, setPageScrollable] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    setPageScrollable((el?.scrollHeight || 0) > (window.innerHeight || 0) + 1);
  }, []);

  // resolve effective trigger
  const effectiveTrigger = useMemo(() => {
    if (trigger === "scroll" || trigger === "visible") return trigger;
    return pageScrollable ? "scroll" : "visible";
  }, [trigger, pageScrollable]);

  // reduced motion guard
  const prefersReduced =
    respectReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1) Scroll-triggered activation (existing hook)
  const { activated: scrollActivated } =
    effectiveTrigger === "scroll" && !prefersReduced
      ? useScrollTriggeredVideo(containerRef, videoRef)
      : { activated: false };

  // 2) Visibility-triggered activation (IntersectionObserver)
  const visible = useVisibility(containerRef, {
    threshold: 0, // flip as soon as it touches the viewport
    rootMargin: "0px 0px 0px 0px",
    once: false,
  });

  // Final activation decision
  const activated = prefersReduced
    ? false
    : effectiveTrigger === "scroll"
    ? scrollActivated
    : visible;

  // When we switch to <video>, make sure playback actually starts
  useEffect(() => {
    if (activated && videoRef.current) {
      // attribute autoplay will usually suffice, but call play() as a fallback
      const p = videoRef.current.play?.();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // ignore autoplay rejections (browser heuristics); we’re muted+inline anyway
        });
      }
    }
  }, [activated]);

  return (
    <div ref={containerRef}>
      {!activated ? (
        <img
          src={POSTER_SRC}
          alt={alt}
          loading={loading}
          className={`${className} ${mediaClasses}`}
        />
      ) : (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          loop
          playsInline
          autoPlay // important: allow autoplay in visibility mode
          preload="metadata"
          aria-label={alt}
          className={`${className} ${mediaClasses}`}
        />
      )}
    </div>
  );
}
