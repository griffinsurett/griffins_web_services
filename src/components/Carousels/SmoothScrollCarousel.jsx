// ============================================================================
// src/components/Carousels/SmoothScrollCarousel.jsx
// ============================================================================
import React, { useRef, useEffect, useState, useMemo, forwardRef } from "react";
import { useVisibility } from "../../hooks/animations/useVisibility";
import useEngagementAutoplay from "../../hooks/autoplay/useEngagementAutoplay";

/**
 * SmoothScrollCarousel
 * Supports two modes:
 *  1) items + renderItem (existing)
 *  2) ✅ children (Astro-rendered nodes passed as children)
 */
const SmoothScrollCarousel = forwardRef(
  (
    {
      items = [],
      renderItem = () => null,
      children,                      // ✅ new
      speed = 30,
      duplicateCount = 3,
      autoplay = true,
      pauseOnHover = true,
      pauseOnEngage = true,
      startDelay = 2500,
      gap = 24,
      itemWidth = 120,               // used for RAF math; should match child width
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

    // Unique scope ID
    const scopeId = useMemo(
      () => `smooth-carousel-${Math.random().toString(36).slice(2, 8)}`,
      []
    );

    // Expose ref api
    React.useImperativeHandle(ref, () => ({
      container: containerRef.current,
      track: trackRef.current,
      getCurrentOffset: () => currentOffset,
      setOffset: setCurrentOffset,
    }));

    // Visibility
    const inView = useVisibility(containerRef, { threshold });

    // ✅ Normalize "base items"
    // If children exist, use them (Astro-rendered). Otherwise use items.
    const childrenArray = useMemo(
      () => React.Children.toArray(children).filter(Boolean),
      [children]
    );

    const usingChildren = childrenArray.length > 0;
    const baseLength = usingChildren ? childrenArray.length : items.length;

    // Duplicate items for infinite track
    const duplicated = useMemo(() => {
      if (usingChildren) {
        const out = [];
        for (let i = 0; i < duplicateCount; i++) {
          out.push(...childrenArray.map((node, idx) => ({
            type: "child",
            node,
            _duplicateIndex: i,
            _originalIndex: idx,
          })));
        }
        return out;
      } else {
        const out = [];
        for (let i = 0; i < duplicateCount; i++) {
          out.push(
            ...items.map((item, idx) => ({
              type: "item",
              item,
              _duplicateIndex: i,
              _originalIndex: idx,
            }))
          );
        }
        return out;
      }
    }, [usingChildren, childrenArray, items, duplicateCount]);

    const totalWidth = baseLength * itemWidth;

    // Engagement-aware autoplay
    const {
      isAutoplayPaused,
      isResumeScheduled,
      userEngaged,
      engageUser,
    } = useEngagementAutoplay({
      totalItems: baseLength,
      currentIndex:
        Math.floor(Math.abs(currentOffset) / itemWidth) % (baseLength || 1),
      setIndex: () => {},
      autoplayTime: 50,
      resumeDelay,
      resumeTriggers,
      containerSelector: `[data-autoplay-scope="${scopeId}"]`,
      itemSelector: `[data-autoplay-scope="${scopeId}"] [data-smooth-item]`,
      inView: autoplay && inView,
      pauseOnEngage,
      engageOnlyOnActiveItem: false,
      activeItemAttr: "data-active",
    });

    // Delayed start
    const [canAnimate, setCanAnimate] = useState(false);
    const startTimerRef = useRef(null);
    useEffect(() => {
      const eligible = autoplay && inView && !isAutoplayPaused;
      if (!eligible) {
        setCanAnimate(false);
        if (startTimerRef.current) {
          clearTimeout(startTimerRef.current);
          startTimerRef.current = null;
        }
        return;
      }
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      startTimerRef.current = setTimeout(() => {
        setCanAnimate(true);
      }, Math.max(0, Number(startDelay) || 0));
      return () => {
        if (startTimerRef.current) {
          clearTimeout(startTimerRef.current);
          startTimerRef.current = null;
        }
      };
    }, [autoplay, inView, isAutoplayPaused, startDelay]);

    // RAF loop
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

    // Hover → engage
    const handleMouseEnterContainer = () => {
      if (pauseOnHover) engageUser();
    };

    // Responsive gradient width
    const getGradientWidth = () => {
      if (typeof window === "undefined") return gradientWidth.base;
      return window.innerWidth >= 768 ? gradientWidth.md : gradientWidth.base;
    };
    const gw = getGradientWidth();

    const handleItemInteraction = (payload, index, type) => {
      if (pauseOnEngage) engageUser();
      onItemInteraction?.(payload, index, type);
    };

    return (
      <div
        ref={containerRef}
        data-autoplay-scope={scopeId}
        className={`relative w-full overflow-hidden ${className}`}
        data-smooth-carousel
        onMouseEnter={handleMouseEnterContainer}
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
            {duplicated.map((node, index) => (
              <div
                key={`${node._originalIndex}-${node._duplicateIndex}-${index}`}
                data-smooth-item
                className="flex-shrink-0"
                onMouseEnter={() =>
                  handleItemInteraction(node, index, "hover")
                }
              >
                {node.type === "child"
                  ? node.node // ✅ directly render Astro-rendered child
                  : renderItem(node.item, index, {
                      isActive: false,
                      onInteraction: (type) =>
                        handleItemInteraction(node.item, index, type),
                    })}
              </div>
            ))}
          </div>
        </div>

        {/* Dev debug */}
        {process.env.NODE_ENV === "development" && (
          <div className="absolute top-2 right-2 text-xs bg-bg/50 text-text p-2 rounded pointer-events-none z-50">
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
