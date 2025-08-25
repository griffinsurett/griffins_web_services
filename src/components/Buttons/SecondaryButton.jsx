// src/components/buttons/SecondaryButton.jsx
import React from "react";
import AnimatedBorder from "../AnimatedBorder/AnimatedBorder";

/** Secondary always uses the AnimatedBorder load effect. */
const SecondaryButton = ({
  Base,
  className = "",
  fullWidth = true, // match primary sizing on mobile
  animatedBorder = {
    color: "var(--color-accent)",
    duration: 700,
    borderWidth: 2,
    borderRadius: "rounded-full", // ⬅ match Base's rounded-full so outlines line up
  },
  ...props
}) => {
  const {
    color = "var(--color-accent)",
    duration = 700,
    borderWidth = 2,
    borderRadius = "rounded-full",
  } = animatedBorder || {};

  const containerClasses = fullWidth
    ? "block w-full lg:w-auto"
    : "inline-block";
  const innerWrapWidth = fullWidth ? "w-full" : "";

  const innerButtonClasses =
    `bg-transparent text-heading${borderRadius} ` +
    `hover:bg-accent hover:text-primary-dark`;

  return (
    <AnimatedBorder
      variant="progress"
      triggers="always" // run once on mount (no reverse)
      duration={duration}
      color={color}
      borderWidth={borderWidth}
      borderRadius={borderRadius}
      className={containerClasses}
      // ⬇️ Overwrite AnimatedBorder's default `card-bg` with a truly plain wrapper
      innerClassName={`!bg-transparent !border-transparent shadow-none p-0 ${borderRadius} ${innerWrapWidth}`}
    >
      <Base className={`${innerButtonClasses} ${className}`} {...props} />
    </AnimatedBorder>
  );
};

export default SecondaryButton;
