// components/onboarding/SalaryRangeSlider.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface SalaryRangeSliderProps {
  min: number;
  max: number;
  step: number;
  initialMin: number;
  initialMax: number;
  onChange: (min: number, max: number) => void;
}

export const SalaryRangeSlider: React.FC<SalaryRangeSliderProps> = ({
  min,
  max,
  step,
  initialMin,
  initialMax,
  onChange,
}) => {
  const [currentMin, setCurrentMin] = useState(initialMin);
  const [currentMax, setCurrentMax] = useState(initialMax);

  useEffect(() => {
    setCurrentMin(initialMin);
    setCurrentMax(initialMax);
  }, [initialMin, initialMax]);
  
  const minPercent = ((currentMin - min) / (max - min)) * 100;
  const maxPercent = ((currentMax - min) / (max - min)) * 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMin = Number(e.target.value);
    if (newMin >= currentMax) {
      newMin = currentMax - step;
    }
    setCurrentMin(newMin);
    onChange(newMin, currentMax);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMax = Number(e.target.value);
    if (newMax <= currentMin) {
      newMax = currentMin + step;
    }
    setCurrentMax(newMax);
    onChange(currentMin, newMax);
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-baseline mb-2">
        <label className="block text-sm font-medium text-gray-700">Expected Salary Range (Per Month)</label>
        <div className="text-lg font-semibold text-indigo-600">
          {formatCurrency(currentMin)} — {formatCurrency(currentMax)}
        </div>
      </div>
      
      {/* Visual Track and Inputs */}
      <div className="relative h-2 rounded-full bg-gray-200">
        
        {/* Progress Fill */}
        <div 
          className="absolute h-full bg-indigo-500 rounded-full z-10"
          style={{ 
            left: `${minPercent}%`, 
            right: `${100 - maxPercent}%` 
          }}
        />
        
        {/* We use a style tag here to force pointer-events on the thumb specifically */}
        <style jsx>{`
          input[type=range]::-webkit-slider-thumb {
            pointer-events: auto;
            width: 24px;
            height: 24px;
            -webkit-appearance: none; 
            border-radius: 50%;
            background: white;
            border: 2px solid #4f46e5; /* indigo-600 */
            cursor: pointer;
            margin-top: -10px; /* Center thumb vertically relative to track */
            position: relative;
            z-index: 50;
          }
          input[type=range]::-moz-range-thumb {
            pointer-events: auto;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: white;
            border: 2px solid #4f46e5;
            cursor: pointer;
            z-index: 50;
          }
        `}</style>

        {/* Min Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentMin}
          onChange={handleMinChange}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none z-20 top-0"
        />
        {/* Max Range Input */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentMax}
          onChange={handleMaxChange}
          className="absolute w-full h-full appearance-none bg-transparent pointer-events-none z-20 top-0"
        />
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatCurrency(min)}</span>
        <span>{formatCurrency(max)}</span>
      </div>
    </div>
  );
};