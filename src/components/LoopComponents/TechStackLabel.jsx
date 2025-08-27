// src/components/LoopComponents/TechStackIcon.jsx
import React, { useState, useRef, useEffect } from "react";
import AnimatedElementWrapper from "../AnimatedElementWrapper";
import { useHoverInteraction } from "../../hooks/animations/useInteractions";

const TechStackIcon = ({ 
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

  // Hover interactions
  const { handleMouseEnter, handleMouseLeave } = useHoverInteraction({
    hoverDelay: 0,
    onHoverStart: (el) => {
      const techName = el?.dataset?.techName || name;
      onTechHover?.(techName);
    },
    onHoverEnd: () => onTechLeave?.(),
  });

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
        onFocus={() => handleMouseEnter(rootRef.current, index)}
        onBlur={() => handleMouseLeave(rootRef.current, index)}
        aria-label={name}
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
          // Desktop hover
          onMouseEnter={() => handleMouseEnter(rootRef.current, index)}
          onMouseLeave={() => handleMouseLeave(rootRef.current, index)}
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

export default TechStackIcon;