// src/components/LoopComponents/CircleImageWrapper.jsx
import { useEffect } from 'react';

export default function CircleImageWrapper({ href, ariaLabel, itemClass = '', children }) {
  useEffect(() => {
    // ensure we only ever init once
    if (window._circlePulseInitialized) return;
    window._circlePulseInitialized = true;

    // define pulse logic
    let circles, idx = 0, intervalId;
    function pulse() {
      const prev = (idx - 1 + circles.length) % circles.length;
      circles[prev]?.classList.remove('heartbeat');
      circles[idx]?.classList.add('heartbeat');
      idx = (idx + 1) % circles.length;
    }
    function startPulse() {
      circles = document.querySelectorAll('.testimonials .circle');
      if (circles.length === 0) return;
      pulse();                      // first beat
      intervalId = setInterval(pulse, 1600);
    }

    // if already loaded, start immediately; otherwise wait for load
    if (document.readyState === 'complete') {
      startPulse();
    } else {
      window.addEventListener('load', startPulse, { once: true });
    }

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const inner = (
    <div
      className={
        `circle w-8 h-8 lg:w-12 lg:h-12 rounded-full overflow-hidden shrink-0 ` +
        `flex items-center justify-center ${itemClass}`
      }
    >
      {children}
    </div>
  );

  return href ? (
    <a href={href} aria-label={ariaLabel} className="contents">
      {inner}
    </a>
  ) : (
    inner
  );
}
