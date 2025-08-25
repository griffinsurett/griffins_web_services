// src/components/NavToggle.jsx
import React from "react";

export default function NavToggle({
  /**
   * the `id` shared between the <input> and <label>;
   * defaults to "nav-toggle"
   */
  id = "nav-toggle",
  /** any extra classes for the label */
  labelClassName = "",
  /** a11y label for your button */
  ariaLabel = "Open navigation menu",
}) {
  return (
    <>
      {/* hidden checkbox drives open/close */}
      <input
        type="checkbox"
        id={id}
        className="hidden peer"
        aria-hidden="true"
      />
      {/* clicking this toggles the above input */}
      <label
        htmlFor={id}
        className={`
          block md:hidden p-3 cursor-pointer
          text-accent hover:text-primary-secondary
          ${labelClassName}
        `}
        aria-label={ariaLabel}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </label>
    </>
  );
}
