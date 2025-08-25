// src/components/Logo/TextLogo.jsx - Standalone with integrated visibility hook
import React, { useEffect, useRef, useState } from "react";
import { useVisibility } from "../../hooks/animations/useVisibility";

/**
 * Standalone TextLogo with integrated visibility logic
 */
const TextLogo = ({
  title = "Griffin's Web Services",
  className = "",
  firstClass = "text-2xl lg:text-3xl -ml-[0.1rem] leading-wide font-bold",
  restClass = "font-light text-accent uppercase text-xs lg:text-sm p-0 m-0 tracking-wider",
  fadeDuration = 1200,
  animateOutText = false,
  loading = "lazy",
}) => {
  const textRef = useRef(null);
  const [textHidden, setTextHidden] = useState(false);

  // Integrated visibility hook for text fade behavior
  useVisibility(textRef, {
    threshold: 0,
    pauseDelay: fadeDuration,
    onForward: () => {
      if (animateOutText) setTextHidden(true);
    },
    onBackward: () => setTextHidden(false),
  });

  // Runtime toggle for animateOutText
  useEffect(() => {
    if (!animateOutText) setTextHidden(false);
  }, [animateOutText]);

  const [firstWord, ...others] = (title || "").split(" ");
  const restOfTitle = others.join(" ");

  return (
    <div
      ref={textRef}
      className={`
        ${className}
        transition-opacity duration-[${fadeDuration}ms]
        transition-transform duration-[${fadeDuration}ms]
        ease-in-out transform
        ${textHidden ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"}
      `}
    >
      <span className={firstClass} style={{ lineHeight: "normal" }}>
        {firstWord}
      </span>
      {restOfTitle && (
        <span className={restClass} style={{ lineHeight: "normal" }}>
          {" "}{restOfTitle}
        </span>
      )}
    </div>
  );
};

export default TextLogo;