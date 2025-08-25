// src/components/AnimatedElementWrapper.jsx (MOVED OUT OF LoopComponents)
import React, { forwardRef } from "react";
import { useAnimatedElement } from "../hooks/animations/useViewAnimation";

/**
 * AnimatedElementWrapper - Universal Animation Component
 *
 * Can be used ANYWHERE in your app, not just loop components!
 *
 * Examples:
 * - Sections: <AnimatedElementWrapper variant="fade-in-up"><section>...</section></AnimatedElementWrapper>
 * - Cards: <AnimatedElementWrapper variant="scale-in"><div className="card">...</div></AnimatedElementWrapper>
 * - Images: <AnimatedElementWrapper variant="fade-in"><img /></AnimatedElementWrapper>
 * - Text: <AnimatedElementWrapper variant="fade-in-left"><h1>Title</h1></AnimatedElementWrapper>
 * - Carousels: <AnimatedElementWrapper variant="fade-in-up"><SmoothScrollCarousel /></AnimatedElementWrapper>
 */
const AnimatedElementWrapper = forwardRef(function AnimatedElementWrapper(
  {
    as: Component = "div",
    children,
    className = "",
    // Animation variant(s) - can be string or array
    variant = "fade-in",

    // Timing controls
    animationDuration = 600,
    animationDelay = 0,
    easing = "cubic-bezier(0.4, 0, 0.2, 1)",

    // Visibility detection controls
    threshold = 0.2,
    rootMargin = "0px 0px -50px 0px",
    once = false,

    // Callbacks
    onStart,
    onComplete,
    onReverse,

    // Pass-through props
    style,
    ...rest
  },
  ref
) {
  const anim = useAnimatedElement({
    ref,
    duration: animationDuration,
    delay: animationDelay,
    easing,
    threshold,
    rootMargin,
    once,
    onStart,
    onComplete,
    onReverse,
  });

  // Handle variant as array or space-separated string
  const variantClasses = Array.isArray(variant)
    ? variant.filter(Boolean).join(" ")
    : String(variant || "");

  // Merge styles: animation vars first, caller overrides last
  const mergedStyle = { ...anim.style, ...style };

  return (
    <Component
      ref={anim.ref}
      className={`animated-element ${variantClasses} ${className}`.trim()}
      {...anim.props} // data-visible, data-animation-direction, CSS vars
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
});

export default AnimatedElementWrapper;
