// src/components/WebsiteTypes.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from "react";
import EnhancedAccordionItem from "./LoopComponents/EnhancedAccordionItem";
import VideoPlayer from "./VideoPlayer";
import AnimatedElementWrapper from "./AnimatedElementWrapper";
import useEngagementAutoplay from "../hooks/autoplay/useEngagementAutoplay";
import { useAnimatedElement } from "../hooks/animations/useViewAnimation";

export default function WebsiteTypes({
  types = [],
  autoAdvanceDelay = 3000,
  debug = process.env.NODE_ENV === "development",
}) {
  // Root wrapper drives IO and scopes all queries
  const rootRef = useRef(null);
  const wrapAnim = useAnimatedElement({
    ref: rootRef,
    duration: 500,
    delay: 0,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    threshold: 0,
    rootMargin: "0px 0px -20% 0px",
  });

  // Unique, per-instance radio group name (prevents collisions)
  const groupName = useId();

  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);

  const autoplayTime = useMemo(
    () => () => {
      const v = desktopVideoRef.current || mobileVideoRef.current;
      if (!v || !isFinite(v.duration)) return autoAdvanceDelay;
      const remaining = Math.max(0, (v.duration - v.currentTime) * 1000);
      return remaining + autoAdvanceDelay;
    },
    [autoAdvanceDelay]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const suppressEngageRef = useRef(false);
  const engageRef = useRef(null);

  const selectIndex = useCallback(
    (index) => {
      const host = rootRef.current;
      if (!host) return;
      const input = host.querySelector(
        `input[type="radio"][name="${groupName}"][value="${index}"]`
      );
      if (input) {
        suppressEngageRef.current = true;
        input.click(); // semantic & fires change
      }
    },
    [groupName]
  );

  const core = useEngagementAutoplay({
    totalItems: types.length,
    currentIndex: activeIndex,
    setIndex: selectIndex,
    autoplayTime,
    resumeDelay: 5000,
    resumeTriggers: ["scroll", "click-outside", "hover-away"],
    containerSelector: "[data-accordion-container], [data-video-slot]",
    itemSelector: "[data-accordion-item]",
    inView: wrapAnim.inView,
    pauseOnEngage: false,
    engageOnlyOnActiveItem: true,
    activeItemAttr: "data-active",
  });

  useEffect(() => {
    engageRef.current = core.engageUser;
  }, [core.engageUser]);

  // Sync internal state with native radios (scoped to this component)
  useEffect(() => {
    const host = rootRef.current;
    if (!host) return;

    const radios = Array.from(
      host.querySelectorAll(`input[type="radio"][name="${groupName}"]`)
    );

    const onChange = (e) => {
      if (!e.target.checked) return;
      const idx = parseInt(e.target.value, 10);
      setActiveIndex(Number.isFinite(idx) ? idx : 0);
      if (suppressEngageRef.current) {
        suppressEngageRef.current = false;
      } else {
        engageRef.current?.();
      }
    };

    radios.forEach((r) => r.addEventListener("change", onChange));

    // init
    const checked = radios.find((r) => r.checked);
    if (checked) {
      const idx = parseInt(checked.value, 10);
      setActiveIndex(Number.isFinite(idx) ? idx : 0);
    } else if (types.length > 0) {
      selectIndex(0);
    }

    return () =>
      radios.forEach((r) => r.removeEventListener("change", onChange));
  }, [groupName, types.length, selectIndex]);

  // Progress + transitions
  const [progress, setProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const advanceTimeoutRef = useRef(null);

  const rescheduleRef = useRef(core.schedule);
  useEffect(() => {
    rescheduleRef.current = core.schedule;
  }, [core.schedule]);

  useEffect(() => {
    if (isTransitioning || !wrapAnim.inView) return;

    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }

    const timer = setTimeout(() => {
      const dv = desktopVideoRef.current;
      const mv = mobileVideoRef.current;

      [dv, mv].forEach((video) => {
        if (video) {
          video.currentTime = 0;
          setProgress(0);
          video.play().catch(() => {});
        }
      });

      rescheduleRef.current?.();
    }, 100);

    return () => clearTimeout(timer);
  }, [activeIndex, isTransitioning, wrapAnim.inView]);

  const handleTimeUpdate = () => {
    const v = desktopVideoRef.current || mobileVideoRef.current;
    if (!v?.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
    rescheduleRef.current?.();
  };

  const handleEnded = () => {
    setProgress(100);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    if (wrapAnim.inView) core.beginGraceWindow();
  };

  const handleLoadedData = () => {
    setProgress(0);
    rescheduleRef.current?.();
  };

  const handleRadioChange = () => {
    setIsTransitioning(true);
    setProgress(0);
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    setTimeout(() => setIsTransitioning(false), 150);
  };

  const handleVideoClick = () => core.engageUser();

  return (
    <div ref={rootRef} className="fade-in animated-element" {...wrapAnim.props}>
      {/* FLEX instead of GRID on lg+ */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-12 max-2-primary">
        {/* Left rail: CLAMP width so it never collapses or balloons */}
        <div
          className="
            min-w-0
            lg:basis-[clamp(420px,40vw,560px)]
            lg:flex-shrink-0
            flex flex-col space-y-4
          "
          data-accordion-container
        >
          {types.map((t, idx) => (
            <AnimatedElementWrapper
              key={idx}
              variant="fade-in"
              animationDuration={600}
              style={{ animationDelay: `${(idx % 3) * 300}ms` }}
              threshold={0}
              rootMargin="0px 0px -50px 0px"
              once={false}
            >
              <EnhancedAccordionItem
                data={{
                  icon: t.icon,
                  title: t.title,
                  description: t.description,
                }}
                isActive={activeIndex === idx}
                progress={progress}
                onToggle={handleRadioChange}
                index={idx}
                name={groupName}
                value={idx.toString()}
                className="transition-all duration-300"
              >
                {/* MOBILE video lives INSIDE the active accordion item */}
                {activeIndex === idx && (
                  <div className="lg:hidden mt-4">
                    <div
                      className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-card/40"
                      data-video-slot
                    >
                      <VideoPlayer
                        key={`mobile-${idx}-${activeIndex}`}
                        ref={mobileVideoRef}
                        src={types[idx]?.videoSrc}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onLoadedData={handleLoadedData}
                        onClick={handleVideoClick}
                        desktop={false}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </EnhancedAccordionItem>
            </AnimatedElementWrapper>
          ))}
        </div>

        {/* Right: fills remaining space exactly (desktop player) */}
        <div className="hidden lg:block lg:flex-1 min-w-0 sticky top-0">
          <div className="sticky top-8">
            <div
              className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-card/40 shadow-2xl shadow-accent/20"
              data-video-slot
            >
              <VideoPlayer
                key={`desktop-${activeIndex}`}
                ref={desktopVideoRef}
                src={types[activeIndex]?.videoSrc}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedData={handleLoadedData}
                onClick={handleVideoClick}
                desktop={true}
                className="w-full h-full object-cover"
              />
            </div>

            {debug && (
              <div className="mt-4 text-xs opacity-75 bg-zinc-800 p-2 rounded">
                <div>
                  ⏸️ Autoplay Paused: {core.isAutoplayPaused ? "✅" : "❌"}
                </div>
                <div>👤 Engaged: {core.userEngaged ? "✅" : "❌"}</div>
                <div>
                  ⏲️ Resume Scheduled: {core.isResumeScheduled ? "✅" : "❌"}
                </div>
                <div>🎪 Active Index: {activeIndex}</div>
                <div>📊 Progress: {Math.round(progress)}%</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
