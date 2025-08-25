// src/components/buttons/Link.jsx
import React from "react";
import Logo from "@/assets/GWS-animated.png";
import { siteData } from "@/siteData.js";

const Link = ({
  Base = "a",
  className = "",
  underlineColor = "currentColor",
  underlineHeight = 2,
  underlineOffset = 2,
  underlineOnHover = true,

  // roll icon options
  rollIcon = false, // true | false | ReactNode
  iconSizeClass = "w-4 h-4 md:w-5 md:h-5", // dimensions
  iconPaddingClass = "pl-5", // reserve space; avoids text shift
  rollDist = "0.3rem", // how far to roll left
  rollTurns = 1.5, // how many full spins
  rollDuration = 600, // ms
  rollEase = "cubic-bezier(0.22,1,0.36,1)",
  ...props
}) => {
  const h =
    typeof underlineHeight === "number"
      ? `${underlineHeight}px`
      : underlineHeight;
  const off =
    typeof underlineOffset === "number"
      ? `${underlineOffset}px`
      : underlineOffset;

  const behavior = underlineOnHover
    ? "after:w-0 group-hover:after:w-full focus-visible:after:w-full"
    : "after:w-full";

  const hasIcon = rollIcon !== false && rollIcon != null;

  const defaultIcon = (
    <img
      src={Logo.src}
      alt={`${siteData.title} Logo 2d Version`}
      className="block"
    />
  );

  return (
    <Base
      kind="link"
      className={[
        "relative group no-underline inline-flex items-center",
        hasIcon ? iconPaddingClass : "", // no space if icon disabled
        "after:content-[''] after:absolute after:left-0 after:bottom-[var(--ul-off)]",
        "after:h-[var(--ul-h)] after:bg-[var(--ul-color)]",
        "after:transition-[width] after:duration-300",
        behavior,
        className,
      ].join(" ")}
      style={{
        "--ul-color": underlineColor,
        "--ul-h": h,
        "--ul-off": off,
      }}
      {...props}
    >
      {hasIcon && (
        <span
          aria-hidden="true"
          className={`pointer-events-none link-roll ${iconSizeClass}`}
          style={{
            "--roll-dist": rollDist,
            "--roll-turns": rollTurns,
            "--roll-duration": `${rollDuration}ms`,
            "--roll-ease": rollEase,
          }}
        >
          {rollIcon === true ? defaultIcon : rollIcon}
        </span>
      )}

      <span className="leading-none">{props.children}</span>
    </Base>
  );
};

export default Link;
