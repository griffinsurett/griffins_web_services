// src/components/LoopComponents/LabelIcon.jsx
import React, { useRef } from "react";

export default function LabelIcon({
  tech,
  index,
  isActive = false,
  onTouch,
  onHoverStart,   // (element) => void
  onHoverEnd,     // (element) => void
  showName = true,
  className = "",
}) {
  const rootRef = useRef(null);

  return (
    <div
      ref={rootRef}
      data-tech-item
      data-tech-name={tech.name}     // used by the hook to read the label
      data-index={index}
      className={`group flex flex-col items-center flex-shrink-0 ${className}`}
      role="button"
      tabIndex={0}
      onFocus={() => onHoverStart?.(rootRef.current)}
      onBlur={() => onHoverEnd?.(rootRef.current)}
      aria-label={tech.name}
    >
      {/* Logo container */}
      <div
        className="
          relative
          p-2
          transition-all duration-300
          group-hover:scale-110
          cursor-pointer
          select-none
        "
        // Mobile touch
        onTouchStart={() => onTouch?.(tech.name, index)}
        // Desktop hover
        onMouseEnter={() => onHoverStart?.(rootRef.current)}
        onMouseLeave={() => onHoverEnd?.(rootRef.current)}
      >
        {/* Glow */}
        {/* <div
          className={`
            absolute inset-0
            bg-accent/30
            blur-2xl
            transition-opacity duration-300
            rounded-full
            ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
        /> */}
        {/* Icon */}
        <div
          className={`
            relative text-heading transition-opacity duration-300
            ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}
          `}
        >
          {tech.icon}
        </div>
      </div>

      {/* Under-icon label is optional */}
      {showName ? (
        <div
          className={`
            mt-2
            text-xs md:text-sm
            text-muted
            transition-all duration-300
            whitespace-nowrap
            ${isActive
              ? "opacity-100 translate-y-0"
              : "opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"}
          `}
        >
          {tech.name}
        </div>
      ) : (
        <span className="sr-only">{tech.name}</span>
      )}
    </div>
  );
}
