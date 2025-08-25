// src/components/LoopComponents/Counter.jsx
import React, { useState, useEffect } from "react";

export default function Counter({
  start = 0,
  end,
  duration = 2000,    // total animation time in ms
  className = "",
  onComplete,
}) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const range = end - start;
    if (range === 0) return;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    const increment = end > start ? 1 : -1;

    const timer = setInterval(() => {
      current += increment;
      setCount(current);
      if (current === end) {
        clearInterval(timer);
        onComplete?.();
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [start, end, duration, onComplete]);

  return <span className={className}>{count}</span>;
}
