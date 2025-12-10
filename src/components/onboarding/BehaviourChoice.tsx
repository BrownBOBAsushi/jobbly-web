'use client';

import React from 'react';

interface BehaviourChoiceProps {
  label: string;
  leftText: string;
  rightText: string;
  value: number; // Current value: 1 (left) or 5 (right)
  onChange: (val: number) => void;
}

export const BehaviourChoice: React.FC<BehaviourChoiceProps> = ({
  label,
  leftText,
  rightText,
  value,
  onChange,
}) => {
  const isLeftActive = value <= 2; // Treat 1/2 as left choice
  const isRightActive = value >= 4; // Treat 4/5 as right choice

  const handleLeftClick = () => onChange(1); // Force commit to the left extreme
  const handleRightClick = () => onChange(5); // Force commit to the right extreme

  // Common button styles
  const baseClasses = 'px-6 py-2 text-sm font-medium rounded-lg transition-all duration-150 flex-1 text-center';
  
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <label className="block text-base font-semibold text-gray-900 mb-3">{label}</label>
      
      <div className="flex space-x-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
        
        {/* Left Option Button */}
        <button
          type="button"
          onClick={handleLeftClick}
          className={`
            ${baseClasses}
            ${isLeftActive
              ? 'bg-white text-indigo-700 shadow-md ring-2 ring-indigo-500'
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          {leftText}
        </button>
        
        {/* Right Option Button */}
        <button
          type="button"
          onClick={handleRightClick}
          className={`
            ${baseClasses}
            ${isRightActive
              ? 'bg-white text-indigo-700 shadow-md ring-2 ring-indigo-500'
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          {rightText}
        </button>
      </div>
      
      {/* Optional: Descriptive helper text below the choice */}
      <p className="text-xs text-gray-500 mt-2">
        Current Choice: **{isLeftActive ? leftText : rightText}**
      </p>
    </div>
  );
};