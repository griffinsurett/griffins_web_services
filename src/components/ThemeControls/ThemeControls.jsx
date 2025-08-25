// src/components/ThemeControls.jsx
import React, { useRef, useState } from "react";
import ThemeToggle from "./DarkLightToggle.jsx";
import AccentPicker from "./AccentPicker.jsx";
// import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function ThemeControls({ className = "" }) {
  const ref = useRef(null);
  const [hidden, setHidden] = useState(false);

  // useScrollAnimation(ref, {
  //   threshold: 0,
  //   pauseDelay: 100,
  //   onForward:  () => setHidden(true),   // scrolling down → hide
  //   onBackward: () => setHidden(false),  // scrolling up   → show
  // });

  return (
    <div
      ref={ref}
      className={[
        // ① center inside your hero (parent must be relative)
        "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
        // ② horizontal layout
        "flex items-center gap-1 lg:gap-2",
        // ③ fade in/out
        "transition-opacity duration-300 ease-in-out",
        hidden
          ? "opacity-0 pointer-events-none"
          : "opacity-100 pointer-events-auto",
        // ④ any extra overrides
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <ThemeToggle />
      <AccentPicker />
    </div>
  );
}
