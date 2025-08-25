import React from "react";
import { useAnimatedElement } from "../../hooks/animations/useViewAnimation";

const PrimaryButton = ({ Base = "button", className = "", ...props }) => {
  const anim = useAnimatedElement({
    duration: 400,
    delay: 0,
    threshold: 0,
    rootMargin: "0px 0px -15% 0px",
  });

  const classes = [
    "button-transition button-hover-transition",
    "border-2 border-primary",
    "bg-primary text-bg",
    "hover:text-zinc-900",
    "hover:bg-transparent",
    "dark:hover:text-primary-light",
  ].join(" ");

  return (
    <Base
      ref={anim.ref} // observe THIS element
      className={`animated-element zoom-in ${classes} ${className}`}
      {...anim.props} // adds data-visible & CSS vars
      {...props}
    />
  );
};

export default PrimaryButton;
