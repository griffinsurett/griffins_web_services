// src/components/Carousels/CarouselArrows.jsx
import React from "react";

// Inline SVG icons
const ChevronLeftIcon = ({ className = "" }) => (
  <svg 
    className={className}
    fill="currentColor" 
    viewBox="0 0 320 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/>
  </svg>
);

const ChevronRightIcon = ({ className = "" }) => (
  <svg 
    className={className}
    fill="currentColor" 
    viewBox="0 0 320 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
  </svg>
);

// Base arrow component
const CarouselArrow = ({ 
  direction = "left", 
  onClick, 
  variant = "floating", // "floating" | "inline" | "custom"
  position = null, // { left?, right?, top?, transform? } for absolute positioning
  className = "",
  iconClassName = "",
  disabled = false,
  ...props 
}) => {
  const Icon = direction === "left" ? ChevronLeftIcon : ChevronRightIcon;
  const label = direction === "left" ? "Previous" : "Next";

  // Variant styles
  const getVariantClasses = () => {
    switch (variant) {
      case "floating":
        return "absolute z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-light/10 border border-primary-light/20 text-text backdrop-blur-sm hover:bg-primary-light/20 transition hover:border-primary-light/75";
      
      case "inline":
        return "w-10 h-10 md:w-12 md:h-12 rounded-full faded-bg text-text backdrop-blur-sm transition hover:bg-primary-light/20 hover:border-primary-light/50";
      
      case "custom":
        return className;
      
      default:
        return variant; // Allow passing custom string directly
    }
  };

  const baseClasses = getVariantClasses();
  const defaultIconClasses = "mx-auto my-auto w-4.5 h-4.5 md:w-6 md:h-6";

  const buttonStyle = position ? {
    left: position.left,
    right: position.right,
    top: position.top || "50%",
    transform: position.transform || "translate(-50%, -50%)",
    ...position
  } : undefined;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={baseClasses}
      style={buttonStyle}
      {...props}
    >
      <Icon className={iconClassName || defaultIconClasses} />
    </button>
  );
};

// Specialized left arrow
export const LeftArrow = (props) => (
  <CarouselArrow direction="left" {...props} />
);

// Specialized right arrow  
export const RightArrow = (props) => (
  <CarouselArrow direction="right" {...props} />
);

// Arrow pair component for inline layouts
export const ArrowPair = ({
  onPrevious,
  onNext,
  variant = "inline",
  className = "",
  leftProps = {},
  rightProps = {},
  disabled = false,
  children, // Content between arrows (like pagination dots)
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <LeftArrow
        onClick={onPrevious}
        variant={variant}
        disabled={disabled}
        {...leftProps}
      />
      
      {children}
      
      <RightArrow
        onClick={onNext}
        variant={variant}
        disabled={disabled}
        {...rightProps}
      />
    </div>
  );
};

export default CarouselArrow;