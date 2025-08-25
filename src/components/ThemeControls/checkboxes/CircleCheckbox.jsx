import React from 'react';

export function CircleCheckbox({ checked, className = "circle-box", onChange, label, children, ...props }) {
  return (
    <label className="inline-flex items-center cursor-pointer">
      {/* 1. Visually hide the real checkbox but keep it accessible */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
        aria-label={label}
        {...props}
      />
      
      {/* 2. The visible circle with theme-aware border and children support */}
      <span
        className={`${className} w-9 h-9 rounded-full transition-all flex items-center justify-center relative`}
      >
        {children}
      </span>
    </label>
  );
}