// src/components/LoopComponents/PortfolioItemComponent.jsx
import React, { useRef, useEffect, useState } from "react";
import { useEngagementAutoScroll } from "../../hooks/autoscroll/useEngagementAutoScroll";

export default function PortfolioItemComponent({
  item,
  i,
  activeIndex,
  itemsLength,
  centerW,
  centerH,
  sideW,
  sideH,
  tx,
  onSelect,
}) {
  const viewportRef = useRef(null);

  // wrap-around positioning
  const diff = i - activeIndex;
  let pos = "hidden";
  if (diff === 0) pos = "center";
  else if (diff === -1 || diff === itemsLength - 1) pos = "left";
  else if (diff === 1 || diff === -(itemsLength - 1)) pos = "right";

  const isActive = pos === "center";
  const topClass = isActive ? "top-0" : "top-1/2";
  const baseTranslate = isActive
    ? "translate(-50%, 0)"
    : "translate(-50%, -50%)";

  // ✅ Updated to use explicit engagement hook
  const auto = useEngagementAutoScroll({
    ref: viewportRef,
    active: isActive,
    cycleDuration: 30,
    loop: false,
    startDelay: 1500,
    resumeDelay: 900,
    resumeOnUserInput: true,
    threshold: 0.1,
    resetOnInactive: true,
  });

  // dev-only progress % (for the overlay, like WebsiteTypes)
  const [progressPct, setProgressPct] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    let raf;
    const tick = () => {
      const el = viewportRef.current;
      if (el) {
        const max = Math.max(0, el.scrollHeight - el.clientHeight);
        const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
        setProgressPct(Math.round(pct));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isActive]);

  const slideBase =
    "absolute left-1/2 overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] " +
    "transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform";

  let style;
  if (isActive) {
    style = {
      width: `${centerW}px`,
      height: `${centerH}px`,
      transform: `${baseTranslate} scale(1) rotateY(0deg)`,
      zIndex: 30,
      opacity: 1,
    };
  } else if (pos === "left") {
    style = {
      width: `${sideW}px`,
      height: `${sideH}px`,
      transform: `${baseTranslate} translateX(-${tx}px) scale(0.9) rotateY(22deg)`,
      zIndex: 20,
      opacity: 0.5,
      filter: "brightness(0.75)",
    };
  } else if (pos === "right") {
    style = {
      width: `${sideW}px`,
      height: `${sideH}px`,
      transform: `${baseTranslate} translateX(${tx}px) scale(0.9) rotateY(-22deg)`,
      zIndex: 20,
      opacity: 0.5,
      filter: "brightness(0.75)",
    };
  } else {
    style = {
      width: `${sideW}px`,
      height: `${sideH}px`,
      transform: `${baseTranslate} scale(0)`,
      zIndex: 10,
      opacity: 0,
      pointerEvents: "none",
    };
  }

  const viewportClassesActive = `
    w-full h-full bg-primary-light
    overflow-y-auto overscroll-auto
    touch-pan-y m-0 p-0
  `;
  const viewportClassesInactive = `
    w-full h-full bg-primary-light
    overflow-hidden pointer-events-none select-none
    m-0 p-0
  `;

  const viewportInlineStyle = isActive
    ? { WebkitOverflowScrolling: "touch", overscrollBehaviorY: "auto" }
    : undefined;

  return (
    <div
      className={`${slideBase} ${topClass}`}
      style={style}
      data-carousel-item
      data-index={i}
      data-active={isActive ? "true" : "false"}
      onClick={() => i !== activeIndex && onSelect(i)}
    >
      <figure
        ref={viewportRef}
        className={isActive ? viewportClassesActive : viewportClassesInactive}
        style={viewportInlineStyle}
        aria-hidden={isActive ? "false" : "true"}
        tabIndex={isActive ? 0 : -1}
      >
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          draggable={false}
          className="block w-full h-auto select-none"
        />
      </figure>

      {/* dev overlay — same vibe as WebsiteTypes */}
      {process.env.NODE_ENV === "development" && isActive && (
        <div className="absolute right-3 top-3 text-xs opacity-75 bg-zinc-800/95 p-3 rounded-lg shadow-lg border border-white/10">
          <div>👁️ In View: {auto.inView ? "✅" : "❌"}</div>
          <div>⏸️ Autoplay Paused: {auto.paused ? "✅" : "❌"}</div>
          <div>👤 Engaged: {auto.engaged ? "✅" : "❌"}</div>
          <div>⏲️ Resume Scheduled: {auto.resumeScheduled ? "✅" : "❌"}</div>
          <div>🎪 Active Index: {activeIndex}</div>
          <div>📊 Progress: {progressPct}%</div>
          <div>🎞️ Animating (RAF): {auto.isAnimating() ? "✅" : "❌"}</div>
        </div>
      )}
    </div>
  );
}
