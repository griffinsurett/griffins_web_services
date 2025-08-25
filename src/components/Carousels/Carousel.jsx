// src/components/Carousels/Carousel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useCarouselAutoplay from "./useCarouselAutoplay";
import { useSideDragNavigation } from "../../hooks/animations/useInteractions";

/**
 * Simple 2D carousel that pages through groups of slides.
 * Arrows live OUTSIDE the viewport, left/right of the slides.
 *
 * `slidesPerView` supports responsive breakpoints, e.g.
 *   { base: 1, md: 2, lg: 3 }
 */
export default function Carousel({
  items = [],
  renderItem = () => null,
  slidesPerView = { base: 1, md: 2, lg: 3 },
  gap = 24,
  defaultIndex = 0,
  autoplay = true,
  autoAdvanceDelay = 4000,
  showArrows = true,
  showDots = true,
  drag = true,
  className = "",
  debug = false,
}) {
  const containerRef = useRef(null);
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);

  const [vw, setVw] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const spv = useMemo(() => {
    const bp = [
      { key: "base", min: 0 },
      { key: "sm", min: 640 },
      { key: "md", min: 768 },
      { key: "lg", min: 1024 },
      { key: "xl", min: 1280 },
      { key: "2xl", min: 1536 },
    ];
    let current = slidesPerView.base ?? 1;
    for (const { key, min } of bp) {
      if (vw >= min && slidesPerView[key] != null) current = slidesPerView[key];
    }
    return Math.max(1, Number(current) || 1);
  }, [vw, slidesPerView]);

  const pages = useMemo(() => {
    const out = [];
    for (let i = 0; i < items.length; i += spv) out.push(items.slice(i, i + spv));
    return out.length ? out : [[]];
  }, [items, spv]);

  const pageCount = pages.length;
  const [pageIndex, setPageIndex] = useState(
    Math.min(defaultIndex, Math.max(0, pageCount - 1))
  );

  useEffect(() => {
    if (pageIndex >= pageCount) setPageIndex(pageCount - 1);
  }, [pageIndex, pageCount]);

  // Engagement-aware autoplay wired for this carousel
  const { scopeId, isAutoplayPaused, isResumeScheduled, userEngaged } =
    useCarouselAutoplay({
      containerRef,
      totalItems: pageCount,
      currentIndex: pageIndex,
      setIndex: setPageIndex,
      autoplay,
      autoplayTime: autoAdvanceDelay,
      threshold: 0.3,
      resumeDelay: 5000,
      resumeTriggers: ["scroll", "click-outside", "hover-away"],
      pauseOnEngage: true,
      engageOnlyOnActiveItem: true,
      activeItemAttr: "data-active",
    });

  const goPrev = () => setPageIndex((p) => (p === 0 ? pageCount - 1 : p - 1));
  const goNext = () => setPageIndex((p) => (p === pageCount - 1 ? 0 : p + 1));

  // HoverGuard while animating
  const TRANSITION_MS = 500;
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), TRANSITION_MS + 50);
    return () => clearTimeout(t);
  }, [pageIndex]);

  // DRAG across the whole viewport via two 50% overlays (no handlers on cards)
  useSideDragNavigation({
    enabled: drag && pageCount > 1,
    leftElRef: leftZoneRef,
    rightElRef: rightZoneRef,
    onLeft: goPrev,
    onRight: goNext,
    dragThreshold: Math.max(40, Math.round(vw * 0.05)),
    tapThreshold: 12,
  });

  const withArrows = showArrows && pageCount > 1;

  return (
    <div
      ref={containerRef}
      data-autoplay-scope={scopeId}
      className={`relative w-full ${className}`}
    >
      {/* Layout: [arrow] [viewport] [arrow] */}
      <div
        className={`relative grid items-center gap-x-4 md:gap-x-6 ${
          withArrows ? "grid-cols-[auto_1fr_auto]" : "grid-cols-1"
        }`}
      >
        {/* Left arrow (outside) */}
        {withArrows && (
          <div className="flex items-center justify-center">
            <button
              onClick={goPrev}
              aria-label="Previous"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full
                         muted-control-bg muted-control-border text-text backdrop-blur-sm
                         muted-control-hover transition"
            >
              <ChevronLeft className="mx-auto my-auto w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        )}

        {/* Viewport */}
        <div className="relative overflow-hidden">
          {/* Track */}
          <div
            className="relative z-20 flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${pageCount * 100}%`,
              transform: `translateX(-${(pageIndex * 100) / pageCount}%)`,
            }}
          >
            {pages.map((page, i) => (
              <div
                key={i}
                data-carousel-item
                data-active={i === pageIndex ? "true" : "false"}
                className="shrink-0"
                style={{ width: `${100 / pageCount}%` }}
              >
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${spv}, minmax(0, 1fr))`,
                    gap,
                  }}
                >
                  {page.map((item, j) => (
                    <div key={j} className="min-w-0">
                      {renderItem(item, i * spv + j)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* HoverGuard (blocks card hover during slide) */}
          {transitioning && (
            <div
              className="absolute inset-0 z-30 pointer-events-auto"
              aria-hidden="true"
            />
          )}

          {/* Full-viewport DRAG ZONES (left 50% + right 50%) */}
          {drag && pageCount > 1 && (
            <>
              <div
                ref={leftZoneRef}
                className="absolute top-0 left-0 h-full z-40 cursor-grab touch-pan-x select-none"
                style={{ width: "50%" }}
                aria-hidden="true"
              />
              <div
                ref={rightZoneRef}
                className="absolute top-0 right-0 h-full z-40 cursor-grab touch-pan-x select-none"
                style={{ width: "50%" }}
                aria-hidden="true"
              />
            </>
          )}
        </div>

        {/* Right arrow (outside) */}
        {withArrows && (
          <div className="flex items-center justify-center">
            <button
              onClick={goNext}
              aria-label="Next"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full
                         faded-bg text-text backdrop-blur-sm
                         transition"
            >
              <ChevronRight className="mx-auto my-auto w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Dots */}
      {showDots && pageCount > 1 && (
        <nav
          className="mt-6 flex justify-center gap-3"
          aria-label="Carousel Pagination"
        >
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPageIndex(i)}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                i === pageIndex ? "bg-primary scale-[1.30]" : "faded-bg"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </nav>
      )}

      {/* Debug */}
      {debug && (
        <div className="mt-4 text-xs opacity-70">
          <div>⏸️ Paused: {isAutoplayPaused ? "✅" : "❌"}</div>
          <div>👤 Engaged: {userEngaged ? "✅" : "❌"}</div>
          <div>⏲️ Resume in 5s: {isResumeScheduled ? "✅" : "❌"}</div>
          <div>📱 spv: {spv}</div>
          <div>📄 pages: {pageCount}</div>
        </div>
      )}
    </div>
  );
}
