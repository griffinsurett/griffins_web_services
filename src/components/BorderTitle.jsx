// src/components/BorderTitle.jsx
import React from "react";
import AnimatedBorder from "./AnimatedBorder/AnimatedBorder";
import { useAnimatedElement } from "../hooks/animations/useViewAnimation";
import Heading from "./Heading";

/**
 * BorderTitle
 * - Decorative pill label; still not a semantic heading element.
 * - Uses <Heading tagName="span"> so our typography utilities stay consistent.
 */
export default function BorderTitle({
  children,
  className = "",
  duration = 1200,
  hoverSweep = true,
  pillClassName = "text-sm px-5 py-2.5 tracking-wider",
}) {
  // Drive visibility + timing for the text only
  const { ref: textRef, props: textAnimProps } = useAnimatedElement({
    duration, // fade length
    delay: 0,
    threshold: 0, // flip as soon as it's on screen
    rootMargin: "0px 0px -15px 0px",
  });

  return (
    <div className="inline-block mb-3">
      <div className="relative inline-block">
        <AnimatedBorder
          variant="progress-b-f"
          triggers="visible"
          duration={duration}
          borderRadius="rounded-full"
          borderWidth={2}
          color="var(--color-primary)"
          className="inline-block"
          innerClassName={`bg-transparent border-transparent ${pillClassName}`}
        >
          <Heading
            tagName="span"
            className={`uppercase tracking-wider font-semibold text-heading ${className}`}
          >
            <span
              ref={textRef}
              className="animated-element color-text-fade"
              {...textAnimProps}
            >
              {children}
            </span>
          </Heading>
        </AnimatedBorder>

        {hoverSweep && (
          <div className="absolute inset-0 pointer-events-none">
            <AnimatedBorder
              variant="progress-infinite"
              triggers="hover"
              duration={1200}
              borderRadius="rounded-full"
              borderWidth={2}
              color="var(--color-accent)"
              className="w-full h-full"
              innerClassName="bg-transparent border-transparent px-0 py-0 pointer-events-none"
            >
              <span className="sr-only">Decorative border sweep</span>
            </AnimatedBorder>
          </div>
        )}
      </div>
    </div>
  );
}
