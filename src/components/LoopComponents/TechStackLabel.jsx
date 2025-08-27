// src/components/LoopComponents/TechStackLabel.jsx
import React, { useState, useRef, useEffect } from "react";
import AnimatedElementWrapper from "../AnimatedElementWrapper";

const TechStackLabel = ({ 
  name, 
  index, 
  onTechHover, 
  onTechLeave, 
  showName = false, 
  className = "",
  children // This will be the Astro-rendered icon
}) => {
  // Mobile touch state for this specific item
  const [isMobileActive, setIsMobileActive] = useState(false);
  const mobileTimeoutRef = useRef(null);
  const rootRef = useRef(null);

  // Mobile touch handler
  const handleMobileTouch = (techName, itemIndex) => {
    if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current);
    
    setIsMobileActive(true);
    onTechHover?.(techName);

    mobileTimeoutRef.current = setTimeout(() => {
      setIsMobileActive(false);
      onTechLeave?.();
    }, 2500);
  };

  // Mouse handlers that don't interfere with parent carousel's engagement system
  const handleMouseEnter = (e) => {
    onTechHover?.(name);
    // Don't stop propagation - let the event bubble up to the carousel wrapper
  };

  const handleMouseLeave = (e) => {
    onTechLeave?.();
    // Don't stop propagation - let the event bubble up to the carousel wrapper
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current);
    };
  }, []);

  return (
    <AnimatedElementWrapper
      variant="fade-in"
      animationDuration={600}
      animationDelay={300}
      threshold={0.2}
      rootMargin="0px 0px -50px 0px"
      once={false}
    >
      <div
        ref={rootRef}
        data-tech-item
        data-tech-name={name}
        data-index={index}
        className={`group flex flex-col items-center flex-shrink-0 ${className}`}
        role="button"
        tabIndex={0}
        aria-label={name}
        // Lightweight hover handlers that don't interfere with parent
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
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
          onTouchStart={() => handleMobileTouch(name, index)}
        >
          {/* Astro-rendered icon passed as children */}
          <div
            className={`
              relative text-heading transition-opacity duration-300
              ${isMobileActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}
            `}
          >
            {children}
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
              ${isMobileActive
                ? "opacity-100 translate-y-0"
                : "opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"}
            `}
          >
            {name}
          </div>
        ) : (
          <span className="sr-only">{name}</span>
        )}
      </div>
    </AnimatedElementWrapper>
  );
};

export default TechStackLabel;