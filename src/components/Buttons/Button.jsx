// src/components/buttons/Button.jsx
import React from "react";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import LogoLink from "./LogoLink";

/** ButtonBase */
export const ButtonBase = ({
  href,
  as = undefined,
  kind = "button",
  className = "",
  leftIcon,
  rightIcon,
  icon,
  children,
  ...props
}) => {
  const Tag = as || (href ? "a" : "button");
  const tagProps = href ? { href, ...props } : props;

  // 🔧 rely on global `button-style` (px-8 py-4), don’t override with smaller padding
  const baseButton =
    "button-style button-transition h4 shadow-accent/30 inline-flex items-center justify-center gap-2 rounded-full";
  const baseLogoLink = "inline-flex items-center gap-1 font-medium";
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70";

  const baseClasses = kind === "LogoLink" ? baseLogoLink : baseButton;

  return (
    <Tag
      className={`${baseClasses} ${focusRing} ${className}`.trim()}
      {...tagProps}
    >
      {leftIcon || icon ? (
        <span className="inline-flex">{leftIcon || icon}</span>
      ) : null}
      {children}
      {rightIcon ? <span className="inline-flex">{rightIcon}</span> : null}
    </Tag>
  );
};

/** router */
const VARIANT_MAP = {
  primary: PrimaryButton,
  secondary: SecondaryButton,
  LogoLink: LogoLink,
  underline: LogoLink,
};

const Button = ({ variant = "primary", ...props }) => {
  const VariantComp = VARIANT_MAP[variant] || PrimaryButton;
  return <VariantComp Base={ButtonBase} {...props} />;
};

export default Button;
