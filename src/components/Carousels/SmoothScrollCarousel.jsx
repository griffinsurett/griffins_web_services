// ============================================================================
// src/components/Carousels/SmoothScrollCarousel.jsx
// ============================================================================

import React, { useRef, useEffect, useState, useMemo, forwardRef } from "react";
import { useVisibility } from "../../hooks/animations/useVisibility";
import useEngagementAutoplay from "../../hooks/autoplay/useEngagementAutoplay";

/**
 * SmoothScrollCarousel - Component WITH autoplay functionality
 * - Waits `startDelay` ms before starting scroll when eligible
 * - Pauses on engagement (hover/click etc.) via useEngagementAutoplay
 */
const SmoothScrollCarousel = forwardRef(
  (
    {
      items = [],
      renderItem = () => null,
      speed = 30,
      duplicateCount = 3,
      autoplay = true,
      pauseOnHover = true,
      pauseOnEngage = true,
      startDelay = 2500,          
      gap = 24,
      itemWidth = 120,
      gradientMask = true,
      gradientWidth = { base: 48, md: 80 },
      threshold = 0.3,
      onItemInteraction,
      resumeDelay = 3000,
      resumeTriggers = ["scroll", "click-outside", "hover-away"],
      className = "",
      trackClassName = "",
    },
    ref
  ) => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const [currentOffset, setCurrentOffset] = useState(0);

    // Generate unique scope ID
    const scopeId = useMemo(
      () => `smooth-carousel-${Math.random().toString(36).slice(2, 8)}`,
      []
    );

    // Expose ref to parent
    React.useImperativeHandle(ref, () => ({
      container: containerRef.current,
      track: trackRef.current,
      getCurrentOffset: () => currentOffset,
      setOffset: setCurrentOffset,
    }));

    // Visibility of the carousel itself
    const inView = useVisibility(containerRef, { threshold });

    // Duplicate items for infinite track
    const duplicatedItems = useMemo(() => {
      const out = [];
      for (let i = 0; i < duplicateCount; i++) {
        out.push(
          ...items.map((item, idx) => ({
            ...item,
            _duplicateIndex: i,
            _originalIndex: idx,
          }))
        );
      }
      return out;
    }, [items, duplicateCount]);

    const totalWidth = items.length * itemWidth;

    // Engagement-aware autoplay coordinator (for pausing/resuming)
    const {
      isAutoplayPaused,
      isResumeScheduled,
      userEngaged,
      engageUser,
      // pause, resume (exposed if needed)
    } = useEngagementAutoplay({
      totalItems: items.length,
      currentIndex:
        Math.floor(Math.abs(currentOffset) / itemWidth) % (items.length || 1),
      setIndex: () => {}, // continuous scroll handles its own position
      autoplayTime: 50,   // fast tick; we manage actual motion via RAF
      resumeDelay,
      resumeTriggers,
      containerSelector: `[data-autoplay-scope="${scopeId}"]`,
      itemSelector: `[data-autoplay-scope="${scopeId}"] [data-smooth-item]`,
      inView: autoplay && inView,
      pauseOnEngage,
      engageOnlyOnActiveItem: false,
      activeItemAttr: "data-active",
    });

    // ⏱️ NEW: delayed start gate (mirrors PortfolioItem startDelay behavior)
    const [canAnimate, setCanAnimate] = useState(false);
    const startTimerRef = useRef(null);

    useEffect(() => {
      const eligible = autoplay && inView && !isAutoplayPaused;

      // If not eligible, stop and clear timer immediately
      if (!eligible) {
        setCanAnimate(false);
        if (startTimerRef.current) {
          clearTimeout(startTimerRef.current);
          startTimerRef.current = null;
        }
        return;
      }

      // Eligible → schedule delayed start
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      startTimerRef.current = setTimeout(() => {
        setCanAnimate(true);
      }, Math.max(0, Number(startDelay) || 0));

      // Cleanup on dependency change/unmount
      return () => {
        if (startTimerRef.current) {
          clearTimeout(startTimerRef.current);
          startTimerRef.current = null;
        }
      };
    }, [autoplay, inView, isAutoplayPaused, startDelay]);

    // RAF animation loop (runs only when canAnimate === true)
    useEffect(() => {
      if (!canAnimate) return;

      let animationId;
      let lastTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        setCurrentOffset((prev) => {
          if (totalWidth <= 0) return prev;
          let next = prev - speed * dt;
          if (Math.abs(next) >= totalWidth) next += totalWidth;
          return next;
        });

        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
      return () => {
        if (animationId) cancelAnimationFrame(animationId);
      };
    }, [canAnimate, speed, totalWidth]);

    // Hover → engage (pauses via engagement system)
    const handleMouseEnterContainer = () => {
      if (pauseOnHover) engageUser();
    };

    // Responsive gradient width
const getGradientWidth = () => {
   if (typeof window === "undefined") return gradientWidth.base;
   return window.innerWidth >= 768 ? gradientWidth.md : gradientWidth.base;
 };
 const gw = getGradientWidth();

    // Item interaction
    const handleItemInteraction = (item, index, type) => {
      if (pauseOnEngage) engageUser();
      onItemInteraction?.(item, index, type);
    };

    return (
      <div
        ref={containerRef}
        data-autoplay-scope={scopeId}
        className={`relative w-full overflow-hidden ${className}`}
        data-smooth-carousel
        onMouseEnter={handleMouseEnterContainer}
        // onMouseLeave: engagement hook handles resume scheduling
      >
        {/* Gradient masks */}
        {gradientMask && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none"
              style={{ width: `${getGradientWidth()}px` }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none"
              style={{ width: `${getGradientWidth()}px` }}
            />
          </>
        )}

        {/* Track */}
        <div className="overflow-hidden" style={{ paddingInline: `${gw}px` }}>
          <div
            ref={trackRef}
            className={`flex items-center ${trackClassName}`}
            style={{
              transform: `translateX(${currentOffset}px)`,
              width: "max-content",
              gap: `${gap}px`,
            }}
          >
            {duplicatedItems.map((item, index) => (
              <div
                key={`${item._originalIndex}-${item._duplicateIndex}-${index}`}
                data-smooth-item
                className="flex-shrink-0"
                onMouseEnter={() => handleItemInteraction(item, index, "hover")}
              >
                {renderItem(item, index, {
                  isActive: false,
                  onInteraction: (type) =>
                    handleItemInteraction(item, index, type),
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Dev debug */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute top-2 right-2 text-xs bg-black/50 text-white p-2 rounded pointer-events-none z-50">
            <div>🎠 Autoplay: {autoplay ? "ON" : "OFF"}</div>
            <div>👁️ InView: {inView ? "YES" : "NO"}</div>
            <div>⏸️ Paused: {isAutoplayPaused ? "YES" : "NO"}</div>
            <div>👤 Engaged: {userEngaged ? "YES" : "NO"}</div>
            <div>⏲️ Resume: {isResumeScheduled ? "YES" : "NO"}</div>
            <div>⏳ Can Animate (post-delay): {canAnimate ? "YES" : "NO"}</div>
          </div>
        )}
      </div>
    );
  }
);

SmoothScrollCarousel.displayName = "SmoothScrollCarousel";
export default SmoothScrollCarousel;
