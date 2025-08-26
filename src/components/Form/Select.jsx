// src/components/Form/Select.jsx
import React, { useState, useCallback, useId } from "react";
import AnimatedBorder from "../AnimatedBorder/AnimatedBorder";

const Select = ({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  className = "",
  colSpan = "",
  error = false,
  borderDuration = 900,
  borderWidth = 2,
  borderRadius = "rounded-xl",
  id: idProp,
  label,                 // ✅ accessible label text
  labelHidden = true,    // ✅ default to visually hidden
  describedBy,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const reactId = useId();
  const id = idProp || `${name || "select"}-${reactId}`;

  const handleFocus = useCallback(
    (e) => {
      setFocused(true);
      props.onFocus?.(e);
    },
    [props]
  );

  const handleBlur = useCallback(
    (e) => {
      setFocused(false);
      props.onBlur?.(e);
    },
    [props]
  );

  return (
    <div className={`space-y-2 ${colSpan}`}>
      {label && (
        <label
          htmlFor={id}
          className={labelHidden ? "sr-only" : "block text-sm text-text/80"}
        >
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}

      <AnimatedBorder
        variant="solid"
        triggers="controlled"
        active={focused}
        duration={borderDuration}
        borderWidth={borderWidth}
        borderRadius={borderRadius}
        color="var(--color-accent)"
        innerClassName={`!bg-transparent !border-transparent p-0 ${borderRadius}`}
      >
        <div className="relative">
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            aria-required={required || undefined}
            aria-invalid={error || undefined}
            aria-describedby={describedBy}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`
              form-field appearance-none pr-10
              ${error ? "form-field-error" : ""}
              ${className}
            `}
            {...props}
          >
            {/* Placeholder as first, disabled option */}
            <option value="" className="form-option" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="form-option"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </AnimatedBorder>
    </div>
  );
};

export default Select;
