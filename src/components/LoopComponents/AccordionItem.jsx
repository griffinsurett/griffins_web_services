// src/components/LoopComponents/AccordionItem.jsx
import React from "react";
import AnimatedBorder from "../AnimatedBorder/AnimatedBorder";

/**
 * Radio-driven accordion item.
 * - Uses a native, UNCONTROLLED radio input.
 * - Border animates forward when opened and reverses when closed (progress-b-f).
 */
function AccordionItem({
  data,
  name = "faq-accordion",
  value = "0",
  defaultChecked = false,
  onToggle, // optional callback (checked:boolean)
  className = "",
}) {
  const { question, answer } = data;
  const uid = React.useId();
  const inputId = `accordion-${name}-${value}-${uid}`;
  const panelId = `${inputId}-panel`;

  const inputRef = React.useRef(null);
  const [isOpen, setIsOpen] = React.useState(!!defaultChecked);

  // Keep local isOpen in sync with the radio group's current checked state
  React.useEffect(() => {
    const radios = Array.from(
      document.querySelectorAll(`input[type="radio"][name="${name}"]`)
    );
    const handleAnyChange = () => {
      if (inputRef.current) {
        const checked = !!inputRef.current.checked;
        setIsOpen(checked);
      }
    };
    radios.forEach((r) => r.addEventListener("change", handleAnyChange));
    // initialize
    handleAnyChange();
    return () =>
      radios.forEach((r) => r.removeEventListener("change", handleAnyChange));
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
      <input
        ref={inputRef}
        type="radio"
        id={inputId}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        className="absolute -left-[9999px]"
        tabIndex={-1}
        aria-hidden="true"
        data-accordion-radio
        data-active={isOpen ? "true" : "false"}
      />

      <AnimatedBorder
        variant="progress-b-f" // forward on open, reverse on close
        triggers="controlled"
        active={isOpen}
        borderRadius="rounded-2xl"
        borderWidth={2}
        duration={800}
        className="cursor-pointer transition-all main-duration overflow-hidden"
        innerClassName="card-bg"
      >
        {/* Header / toggle */}
        <label
          htmlFor={inputId}
          className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-card transition-colors main-duration cursor-pointer relative z-20"
          onMouseDown={(e) => e.preventDefault()} // prevent scroll-to-focus jump
          aria-controls={panelId}
          aria-expanded={isOpen}
        >
          <h3 className="h3 pr-4">{question}</h3>
          <div
            className={`flex-shrink-0 icon-xsmall transition-all main-duration ${
              isOpen
                ? "light:bg-heading dark:bg-primary dark:text-bg rotate-45"
                : "bg-primary/20 rotate-0"
            }`}
          >
            <svg
              className={`w-4 h-4 ${
                isOpen ? "light:text-accent" : "text-primary"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </label>

        {/* Panel */}
        <div
          id={panelId}
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
