// src/components/Form/Input.jsx
import React, { useState, useCallback } from "react";
import AnimatedBorder from "../AnimatedBorder/AnimatedBorder";

const Input = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
  error = false,
  borderDuration = 900,
  borderWidth = 2,
  borderRadius = "rounded-xl",
  ...props
}) => {
  const [focused, setFocused] = useState(false);

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
    <div className="space-y-2">
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
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            form-field
            ${error ? "form-field-error" : ""}
            ${className}
          `}
          {...props}
        />
      </AnimatedBorder>
    </div>
  );
};

export default Input;
