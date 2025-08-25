// src/components/Menu/HamburgerIcon.jsx
import React from "react";

export default function HamburgerIcon({ checkboxId, className = "" }) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Sync with checkbox state
  React.useEffect(() => {
    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) return;

    const handleChange = () => {
      setIsOpen(checkbox.checked);
    };

    checkbox.addEventListener("change", handleChange);
    handleChange(); // init

    return () => checkbox.removeEventListener("change", handleChange);
  }, [checkboxId]);

  return (
    <label
      htmlFor={checkboxId}
      className={`
        group                       /* enable group-hover */
        relative h-4.5 lg:h-5 w-6  cursor-pointer
        flex flex-col justify-between items-start
        z-50
        ${className}
      `}
    >
      {/* Top bar */}
      <span
        className={`
          block h-px bg-current transition-all duration-300
          ${isOpen
            ? "absolute top-1/2 transform -translate-y-1/2 rotate-45 w-full"
            : "w-full"}
        `}
      />

      {/* Middle bar: grows on hover */}
      <span
        className={`
          block h-px bg-current transition-all duration-300
          ${isOpen
            ? "opacity-0 w-full"                      /* hidden when open */
            : "opacity-100 w-4 group-hover:w-full"} 
        `}
      />

      {/* Bottom bar */}
      <span
        className={`
          block h-px bg-current transition-all duration-300
          ${isOpen
            ? "absolute top-1/2 transform -translate-y-1/2 -rotate-45 w-full"
            : "w-full"}
        `}
      />
    </label>
  );
}
