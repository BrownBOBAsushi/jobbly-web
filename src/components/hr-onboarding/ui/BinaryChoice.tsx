'use client';

import React from 'react';

interface BinaryChoiceProps {
  label: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  selectedValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function BinaryChoice({
  label,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  selectedValue,
  onChange,
  disabled
}: BinaryChoiceProps) {
  
  // Helper to get display text for "Current Choice"
  const currentChoiceLabel = selectedValue === leftValue 
    ? leftLabel 
    : selectedValue === rightValue 
      ? rightLabel 
      : '';

  // Common button styles
  const baseButtonClass = "flex-1 py-4 px-4 text-center text-sm font-medium rounded-lg border transition-all duration-200";
  
  // Selected Style: White bg, Blue Border, Blue Text (from screenshot)
  const selectedClass = "bg-white border-blue-500 text-blue-600 shadow-sm ring-1 ring-blue-500";
  
  // Unselected Style: Light Grey bg, Grey Text
  const unselectedClass = "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100";

  return (
    <div className="space-y-3">
      {/* Main Label */}
      <h3 className="font-semibold text-gray-900 text-base">{label}</h3>
      
      {/* The Two Buttons Container */}
      <div className="flex gap-4">
        {/* Left Option */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(leftValue)}
          className={`
            ${baseButtonClass}
            ${selectedValue === leftValue ? selectedClass : unselectedClass}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {leftLabel}
        </button>

        {/* Right Option */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(rightValue)}
          className={`
            ${baseButtonClass}
            ${selectedValue === rightValue ? selectedClass : unselectedClass}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {rightLabel}
        </button>
      </div>

      {/* "Current Choice" Text */}
      <div className="text-xs text-gray-500 h-4">
        {currentChoiceLabel && (
          <span>
            Current Choice: <span className="font-semibold text-gray-700">**{currentChoiceLabel}**</span>
          </span>
        )}
      </div>
    </div>
  );
}