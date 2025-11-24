import React from "react";
import { useAnimatedElement } from "../../hooks/animations/useViewAnimation";

const PrimaryButton = ({ Base = "button", className = "", ...props }) => {
  const anim = useAnimatedElement({
    duration: 100,
    delay: 0,
    threshold: 0,
    rootMargin: "0px 0px -15% 0px",
  });

  const classes = [
    "primary-button-transition",
    "border-2 border-primary",
    "bg-primary text-bg",
    "hover:text-zinc-900",
    "hover:bg-transparent",
    "dark:hover:text-primary-light",
  ].join(" ");

  return (
    <span
      ref={anim.ref}
      className="inline-flex w-full lg:w-auto animated-element zoom-in"
    >
      <Base className={`${classes} ${className}`} {...props} />
    </span>
  );
};

export default PrimaryButton;
