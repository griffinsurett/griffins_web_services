import React from "react";
import AnimatedBorder from "../AnimatedBorder/AnimatedBorder";

/**
 * Accessible radio-driven accordion (single-open) WITHOUT <button>.
 * - The <input type="radio"> is the interactive control (kept focusable + SR-visible).
 * - The <label> is purely visual; NO aria-* on it (fixes the audit).
 * - The panel is role="region" and aria-labelledby -> label's id.
 * - Uses a safe custom id (no React :r…: tokens).
 */
function AccordionItem({
  data,
  name = "faq-accordion",
  value = "0",
  defaultChecked = false,
  onToggle,
  className = "",
}) {
  const { question, answer } = data;

  // Safe, simple id (avoid React.useId() tokens like :r0:)
  const uidRef = React.useRef(Math.random().toString(36).slice(2));
  const baseId = `acc-${name}-${value}-${uidRef.current}`;
  const inputId = `${baseId}-input`;
  const labelId = `${baseId}-label`;
  const panelId = `${baseId}-panel`;

  const inputRef = React.useRef(null);
  const [isOpen, setIsOpen] = React.useState(!!defaultChecked);
  const [isFocus, setIsFocus] = React.useState(false);

  // Keep local isOpen synced with the radio group's state
  React.useEffect(() => {
    const radios = Array.from(
      document.querySelectorAll(`input[type="radio"][name="${name}"]`)
    );
    const handleAnyChange = () => {
      if (inputRef.current) setIsOpen(!!inputRef.current.checked);
    };
    radios.forEach((r) => r.addEventListener("change", handleAnyChange));
    handleAnyChange();
    return () => radios.forEach((r) => r.removeEventListener("change", handleAnyChange));
  }, [name]);

  const handleChange = (e) => {
    const checked = e.target.checked;
    setIsOpen(checked);
    onToggle?.(checked);
  };

  return (
    <div
      className={`group relative ${className}`}
      data-accordion-item
      data-active={isOpen ? "true" : "false"}
    >
      {/* Focusable SR-visible control (kept off-screen visually but in tab order) */}
      <input
        ref={inputRef}
        type="radio"
        id={inputId}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        // SR-only pattern that remains focusable (not display:none)
        className="sr-only"
        // no aria-expanded/controls here (not valid on role=radio)
      />

      <AnimatedBorder
        variant="progress-b-f"
        triggers="controlled"
        active={isOpen || isFocus}
        borderRadius="rounded-2xl"
        borderWidth={2}
        duration={800}
        className="transition-all main-duration overflow-hidden"
        innerClassName="card-bg"
      >
        {/* Visual header (no aria-* here = fixes the audit) */}
        <label
          id={labelId}
          htmlFor={inputId}
          className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-card transition-colors main-duration cursor-pointer relative z-20 focus-within:outline-none"
          // keep clicks/keyboard routed to the radio via htmlFor; no extra handlers needed
        >
          <h3 className="h3 pr-4">{question}</h3>
          <div
            className={`flex-shrink-0 icon-xsmall transition-all main-duration ${
              isOpen
                ? "light:bg-heading dark:bg-primary dark:text-bg rotate-45"
                : "bg-primary/20 rotate-0"
            }`}
            aria-hidden="true"
          >
            <svg
              className={`w-4 h-4 ${isOpen ? "light:text-accent" : "text-primary"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </label>

        {/* Panel: associated to the header, hidden to AT when collapsed */}
        <div
          id={panelId}
          role="region"
          aria-labelledby={labelId}
          aria-hidden={!isOpen}
          className={`overflow-hidden transition-all main-duration ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 pb-5">
            <div className="w-full h-px bg-accent/20 mb-4" />
            <p className="text-text leading-relaxed">{answer}</p>
          </div>
        </div>
      </AnimatedBorder>
    </div>
  );
}

export default AccordionItem;
