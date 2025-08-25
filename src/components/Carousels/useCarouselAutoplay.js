// src/components/Carousels/useCarouselAutoplay.js
import { useMemo } from "react";
import { useVisibility } from "../../hooks/animations/useVisibility";
import useEngagementAutoplay from "../../hooks/autoplay/useEngagementAutoplay";

/**
 * Thin wrapper around useEngagementAutoplay tailored for our carousels.
 * - Generates a unique scope id and returns it for the container.
 * - Wires up item/container selectors and visibility.
 *
 * NOTE: In your carousel markup:
 *   - Put `data-autoplay-scope={scopeId}` on the carousel container
 *   - Put `data-carousel-item` on each page/slide wrapper
 *   - Set `data-active="true"` on the active page/slide
 */
export default function useCarouselAutoplay({
  containerRef,
  totalItems,
  currentIndex,
  setIndex,
  autoplay = true,
  autoplayTime = 4000,
  threshold = 0.3,
  resumeDelay = 5000,
  resumeTriggers = ["scroll", "click-outside", "hover-away"],
  pauseOnEngage = true,
  engageOnlyOnActiveItem = true,
  activeItemAttr = "data-active",
}) {
  const scopeId = useMemo(
    () => `carousel-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  const inView = useVisibility(containerRef, { threshold });

  const autoplayState = useEngagementAutoplay({
    totalItems,
    currentIndex,
    setIndex,
    autoplayTime,
    resumeDelay,
    resumeTriggers,
    containerSelector: `[data-autoplay-scope="${scopeId}"]`,
    itemSelector: `[data-autoplay-scope="${scopeId}"] [data-carousel-item]`,
    inView: autoplay && inView,
    pauseOnEngage,
    engageOnlyOnActiveItem,
    activeItemAttr,
  });

  return {
    scopeId,
    inView,
    ...autoplayState, // { isAutoplayPaused, isResumeScheduled, userEngaged, pause, resume, engageUser, ... }
  };
}
