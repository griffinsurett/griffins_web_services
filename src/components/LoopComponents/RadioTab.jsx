// src/components/LoopComponents/RadioTab.jsx
import React from "react";
import AnimatedBorder from "../AnimatedBorder/AnimatedBorder";
import IconListItem from "./IconListItem";
import { useAnimatedElement } from "../../hooks/animations/useViewAnimation";

const RadioTab = ({
  id,
  name,
  value,
  checked,
  onChange,
  category,
  className = "",
  size = "sm", // "sm" | "md" | "lg"
}) => {
  // Drive visibility + timing for the text only
  const {
    ref: textRef,
    inView,
    style: animStyle,
  } = useAnimatedElement({
    duration: 400, // fade length
    delay: 0,
    threshold: 0, // flip as soon as it's on screen
    rootMargin: "0px 0px -15% 0px",
  });
  const isActiveVisible = checked && inView;
  const sizeClasses = {
    sm: {
      padding: "px-1.5 py-2",
      text: "text-sm",
      gap: "gap-1.5",
      iconSize: "text-base",
    },
    md: {
      padding: "px-4 py-3",
      text: "text-base",
      gap: "gap-2",
      iconSize: "text-lg",
    },
    lg: {
      padding: "px-6 py-4",
      text: "text-lg",
      gap: "gap-3",
      iconSize: "text-xl",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className={`relative ${className}`}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className={`absolute -left-[9999px] flex-grow`}
        aria-hidden="true"
      />
      <AnimatedBorder
        variant="progress-b-f" // forward on open, reverse on close
        triggers="controlled"
        active={checked}
        duration={400}
        borderRadius="rounded-full"
        borderWidth={2}
        color="var(--color-accent)"
        innerClassName="px-2 py-1  card-bg border-off-hover"
      >
        <label
          htmlFor={id}
          className={`
    ${
      currentSize.padding
    } rounded-full flex-grow font-medium main-duration transition-all
    flex items-center ${currentSize.gap} cursor-pointer ${currentSize.text}
    text-heading ${isActiveVisible ? "animated-element color-text-fade" : ""}
  `}
          ref={textRef}
          style={isActiveVisible ? animStyle : undefined}
          {...(isActiveVisible ? { "data-visible": "true" } : {})}
        >
          <IconListItem
            data={{ icon: category.icon, title: category.title }}
            layout="horizontal"
            alignment="center"
            className={currentSize.gap}
            iconClassName={currentSize.iconSize}
            titleClassName={currentSize.text}
            titleTag="span"
            showDescription={false}
          />
        </label>
      </AnimatedBorder>
    </div>
  );
};

export default RadioTab;
