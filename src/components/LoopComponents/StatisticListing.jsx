import React, { useMemo, useRef } from "react";
import Counter from "../Counter";
import { useVisibility } from "../../hooks/animations/useVisibility"; // uses your IO hook

export default function StatisticListing({
  data,
  start = 0,
  duration = 2000,
  triggerOnView = true,
  threshold = 0.4,
  visibleRootMargin = "0px", // number|string|{top,right,bottom,left}
}) {
  const { number, label } = data;

  // Use your hook (with once:true so it fires only the first time)
  const ref = useRef(null);
  const seen = useVisibility(ref, {
    threshold,
    rootMargin: visibleRootMargin,
    once: true,
  });
  const shouldStart = triggerOnView ? seen : true;

  // Extract numeric part, keep prefix/suffix like “100+”
  const { value, prefix, suffix } = useMemo(() => {
    if (typeof number === "number")
      return { value: number, prefix: "", suffix: "" };
    const str = String(number ?? "");
    const m = str.match(/^\s*([^0-9\-+]*)(-?\d+(?:\.\d+)?)(.*)$/);
    if (m)
      return {
        value: parseFloat(m[2]),
        prefix: m[1] ?? "",
        suffix: m[3] ?? "",
      };
    return { value: 0, prefix: "", suffix: str };
  }, [number]);

  return (
    <div ref={ref}>
      <h3 className="font-bold text-5xl text-accent mb-3">
        {prefix}
        {shouldStart ? (
          <Counter start={start} end={value} duration={duration} />
        ) : (
          <span>{start}</span>
        )}
        {suffix}
      </h3>
      <p className="text-text text-lg">{label}</p>
    </div>
  );
}
