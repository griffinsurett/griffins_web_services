// src/components/AccentPicker.jsx
import { useState, useRef, useEffect } from "react";
import { useAccentColor } from "../../hooks/theme/useAccentColor.js";
import { CircleCheckbox } from "./checkboxes/CircleCheckbox.jsx";
import { SquareCheckbox } from "./checkboxes/SquareCheckbox.jsx";

export default function AccentPicker() {
  const [open, setOpen] = useState(false);
  const [accent, setAccent, accents] = useAccentColor();
  const containerRef = useRef(null);

  // Close if clicked outside
  useEffect(() => {
    function onClick(e) {
      if (containerRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={containerRef} className="relative contents">
      {/* trigger */}
      <CircleCheckbox
        checked={open}
        onChange={() => setOpen((o) => !o)}
        aria-label="Pick accent color"
        className="faded-bg"
      >
        <svg className="w-[22px] h-[22px]" viewBox="0 0 100 100">
          {" "}
          <path
            d="M50 10C50 10 25 35 25 55C25 70.464 37.536 83 50 83C62.464 83 75 70.464 75 55C75 35 50 10 50 10Z"
            fill="var(--color-accent)"
          />{" "}
        </svg>
      </CircleCheckbox>

      {/* dropdown panel */}
      {open && (
        <div
          className="
            absolute top-full mt-2 left-0
            faded-bg rounded-xl p-3
            flex space-x-3 overflow-x-auto hide-scrollbar
            shadow-lg z-50
          "
        >
          {accents.map((color) => (
            <SquareCheckbox
              key={color}
              color={color}
              checked={accent === color}
              onChange={() => {
                setAccent(color);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
