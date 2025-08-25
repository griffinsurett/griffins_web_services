// src/components/SquareCheckbox.jsx
import React from 'react';

export function SquareCheckbox({ color, checked, onChange }) {
  return (
    <label className="inline-block cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        style={{ backgroundColor: color }}
        checked={checked}
        onChange={onChange}
      />
      <span
        className="
          w-8 h-8 
          block 
          rounded-sm 
          border-2 border-transparent 
          peer-checked:border-primary-light peer-checked:shadow-lg
          "
        style={{ backgroundColor: color }}
      />
    </label>
  );
}
