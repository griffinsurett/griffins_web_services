// src/components/Carousels/PortfolioCarousel.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LeftArrow, RightArrow } from "./CarouselArrows";
import useCarouselAutoplay from "./useCarouselAutoplay";
import { useSideDragNavigation } from "../../hooks/animations/useInteractions";
import { useAnimatedElement } from "../../hooks/animations/useViewAnimation";
import PortfolioItemComponent from "../LoopComponents/PortfolioItemComponent";

/**
 * Portfolio carousel with floating arrows positioned around the center slide
 */
export default function PortfolioCarousel({
  items = [],
  defaultIndex = 0,
  autoplay = true,
  autoAdvanceDelay = 5000,
  showArrows = true,
  showDots = true,
  drag = false,
  className = "",
}) {
  const containerRef = useRef(null);
  const [index, setIndex] = useState(defaultIndex);

  // Measure real container width; gate stage render until ready
  const [containerW, setContainerW] = useState(0);
  const ready = containerW > 0;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w && w !== containerW) setContainerW(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [containerW]);

  // Visibility animation
  const { props: carouselAnimProps } = useAnimatedElement({
    ref: containerRef,
    duration: 500,
    delay: 0,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    threshold: 0.1,
    rootMargin: "0px 0px -20% 0px",
  });

  // Autoplay
  const { scopeId } = useCarouselAutoplay({
    containerRef,
    totalItems: items.length,
    currentIndex: index,
    setIndex,
    autoplay,
    autoplayTime: autoAdvanceDelay,
    threshold: 0.3,
    resumeDelay: 5000,
    resumeTriggers: ["scroll", "click-outside", "hover-away"],
    pauseOnEngage: true,
    engageOnlyOnActiveItem: true,
    activeItemAttr: "data-active",
  });

  // Client-only scope id to prevent SSR/client mismatch
  const [clientScopeId, setClientScopeId] = useState(null);
  useEffect(() => {
    setClientScopeId(scopeId);
  }, [scopeId]);

  // Geometry calculations
  const getSizes = () => {
    const w = containerW;
    if (w < 640)  return { centerW: 280, centerH: 190, sideW: 180, sideH: 120 };
    if (w < 768)  return { centerW: 340, centerH: 230, sideW: 220, sideH: 150 };
    if (w < 1024) return { centerW: 460, centerH: 310, sideW: 290, sideH: 190 };
    if (w < 1280) return { centerW: 680, centerH: 450, sideW: 420, sideH: 290 };
    return { centerW: 860, centerH: 540, sideW: 520, sideH: 360 };
  };

  const getTranslateDistance = (sideW) => {
    const w = containerW;
    const bleed = w >= 1536 ? 72 : w >= 1280 ? 56 : w >= 1024 ? 40 : 20;
    const edgeGutter = -bleed;
    return w / 2 - sideW / 2 - edgeGutter;
  };

  const { centerW, centerH, sideW, sideH } = ready ? getSizes() : { centerW: 0, centerH: 0, sideW: 0, sideH: 0 };
  const tx = ready ? getTranslateDistance(sideW) : 0;

  // Navigation functions
  const goToPrevious = () => setIndex(index === 0 ? items.length - 1 : index - 1);
  const goToNext = () => setIndex(index === items.length - 1 ? 0 : index + 1);

  // Arrow positioning calculations
  const arrowDiameter = containerW >= 768 ? 48 : 40;
  const arrowRadius = arrowDiameter / 2;
  const gap = containerW >= 1024 ? 20 : 16;
  const isLarge = containerW >= 1280;

  const sideOffsetFromCenterSlide = centerW / 2 + arrowRadius + gap;
  const leftCalc = isLarge ? `calc(50% - ${tx}px)` : `calc(50% - ${sideOffsetFromCenterSlide}px)`;
  const rightCalc = isLarge ? `calc(50% + ${tx}px)` : `calc(50% + ${sideOffsetFromCenterSlide}px)`;

  // Drag zones
  const leftZoneRef = useRef(null);
  const rightZoneRef = useRef(null);

  useSideDragNavigation({
    enabled: ready && drag && items.length > 1,
    leftElRef: leftZoneRef,
    rightElRef: rightZoneRef,
    onLeft: goToPrevious,
    onRight: goToNext,
    dragThreshold: Math.max(40, Math.round(containerW * 0.05)),
    tapThreshold: 12,
  });

  const sideZoneWidth = Math.max(140, Math.min(sideW, 520));
  const sideZoneStyle = (leftPx) => ({
    left: `calc(50% ${leftPx >= 0 ? "+" : "-"} ${Math.abs(leftPx)}px)`,
    transform: "translateX(-50%)",
    width: `${sideZoneWidth}px`,
    top: 0,
    height: "100%",
  });

  const leftZoneLeftPx = isLarge ? tx : sideOffsetFromCenterSlide;
  const rightZoneLeftPx = isLarge ? tx : sideOffsetFromCenterSlide;

  return (
    <div
      ref={containerRef}
      data-carousel-container
      {...(clientScopeId ? { "data-autoplay-scope": clientScopeId } : {})}
      suppressHydrationWarning
      className={`w-full ${className}`}
      {...carouselAnimProps}
    >
      {ready && (
        <>
          <div className="relative overflow-visible w-full leading-none" style={{ height: `${centerH}px` }}>
            {items.map((item, i) => (
              <PortfolioItemComponent
                key={item.id ?? i}
                item={item}
                i={i}
                activeIndex={index}
                itemsLength={items.length}
                centerW={centerW}
                centerH={centerH}
                sideW={sideW}
                sideH={sideH}
                tx={tx}
                onSelect={setIndex}
              />
            ))}

            {/* Drag zones */}
            {drag && items.length > 1 && (
              <>
                <div
                  ref={leftZoneRef}
                  className="absolute z-30 cursor-grab touch-pan-x select-none"
                  style={sideZoneStyle(-leftZoneLeftPx)}
                  aria-hidden="true"
                  data-drag-zone="left"
                />
                <div
                  ref={rightZoneRef}
                  className="absolute z-30 cursor-grab touch-pan-x select-none"
                  style={sideZoneStyle(rightZoneLeftPx)}
                  aria-hidden="true"
                  data-drag-zone="right"
                />
              </>
            )}

            {/* Floating arrows positioned around center slide */}
            {showArrows && items.length > 1 && (
              <>
                <LeftArrow
                  onClick={goToPrevious}
                  variant="floating"
                  position={{ 
                    left: leftCalc, 
                    top: "50%", 
                    transform: "translate(-50%, -50%)" 
                  }}
                />
                <RightArrow
                  onClick={goToNext}
                  variant="floating"
                  position={{ 
                    left: rightCalc, 
                    top: "50%", 
                    transform: "translate(-50%, -50%)" 
                  }}
                />
              </>
            )}
          </div>

          {/* Pagination dots */}
          {showDots && items.length > 1 && (
            <nav className="mt-6 flex justify-center gap-3" aria-label="Carousel Pagination">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === index ? "bg-primary scale-[1.30]" : "faded-bg"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  );
}