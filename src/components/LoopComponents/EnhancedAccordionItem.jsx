// EnhancedAccordionItem.jsx
import React from "react";
import AnimatedBorder from "../AnimatedBorder/AnimatedBorder";
import IconListItem from "./IconListItem";

const EnhancedAccordionItem = ({
  data,
  isActive,
  progress = 0,
  onToggle, // radio onChange
  children,
  className = "",
  name, // Radio group name
  value, // string index value
  index, // numeric index
}) => {
  const { icon, title, description } = data;

  return (
    <div
      className={`group relative ${className}`}
      data-accordion-item
      data-active={isActive ? "true" : "false"} // 👈 gating for hover/engage
    >
      {/* Native, UNCONTROLLED radio (source of truth). */}
      <input
        type="radio"
        id={`accordion-${value}`}
        name={name}
        value={value}
        defaultChecked={value === "0"} // initial selection
        onChange={onToggle}
        className="absolute -left-[9999px]"
        tabIndex={-1}
        aria-hidden="true"
        data-accordion-radio
        data-active={isActive ? "true" : "false"}
      />

      <AnimatedBorder
        variant="progress"
        triggers="controlled"
        active={isActive}
        controller={progress}
        borderRadius="rounded-3xl"
        borderWidth={2}
        className="transition-all duration-100"
        innerClassName="card-bg"
        loop={false}
      >
        {/* Label toggles the radio */}
        <label
          htmlFor={`accordion-${value}`}
          className="w-full text-left flex items-center justify-between p-5 hover:bg-card/50 transition-colors duration-300 cursor-pointer relative z-20"
          onMouseDown={(e) => e.preventDefault()} // prevent scroll-to-focus jump
        >
          {/* Icon and title using IconListItem */}
          <IconListItem
            data={{ icon, title }}
            layout="horizontal"
            alignment="left"
            className="gap-2"
            iconClassName="icon-medium card-icon-color"
            titleClassName="h3"
            titleTag="h3"
            showDescription={false}
          />

          {/* Expand/collapse indicator */}
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              transition-all duration-[600ms] text-xl font-normal leading-none text-primary
              ${
                isActive
                  ? "bg-primary dark:text-zinc-900 light:text-accent"
                  : "bg-primary/20 group-hover:bg-accent/30 text-accent "
              }
            `}
          >
            <span className="block translate-y-[-1px]">
              {isActive ? "−" : "+"}
            </span>
          </div>
        </label>

        {/* Collapsible content */}
        <div
          className={`
            overflow-hidden transition-all duration-500 ease-in-out relative z-20
            ${isActive ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="px-6 pb-6">
            <div className="w-full h-px bg-primary/20 mb-4" />
            <p className="text-text leading-relaxed mb-6">{description}</p>
            {children && <div className="lg:hidden">{children}</div>}
          </div>
        </div>
      </AnimatedBorder>
    </div>
  );
};

export default EnhancedAccordionItem;
