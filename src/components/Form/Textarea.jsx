// src/components/Form/Textarea.jsx
import React, { useState, useCallback, useId } from "react";
import AnimatedBorder from "../AnimatedBorder/AnimatedBorder";

const Textarea = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 5,
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
  const id = idProp || `${name || "textarea"}-${reactId}`;

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
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            form-field resize-none
            ${error ? "form-field-error" : ""}
            ${className}
          `}
          {...props}
        />
      </AnimatedBorder>
    </div>
  );
};

export default Textarea;
