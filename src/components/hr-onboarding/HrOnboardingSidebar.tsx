'use client';

import React from 'react';
import { useHrOnboarding } from './HrOnboardingProvider';

const STEPS = ['Profile', 'Preference', 'Behaviour'];

export default function HrOnboardingSidebar() {
  const { state } = useHrOnboarding();
  
  // Calculate percentage: 0/3 = 0%, 1/3 = 33%, etc.
  const progressPercent = Math.round(((state.currentStep) / 3) * 100);

  return (
    <div className="w-full md:w-64 flex-shrink-0 p-6 md:h-screen bg-gray-50 border-r border-gray-200">
      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
          Your Progress
        </h2>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">{state.currentStep} of 3 steps completed</p>
      </div>

      <nav className="space-y-4">
        {STEPS.map((stepLabel, index) => {
          const isActive = state.currentStep === index;
          const isCompleted = state.currentStep > index;

          return (
            <div 
              key={stepLabel}
              className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                isActive ? 'bg-white shadow-sm border border-gray-200' : 'opacity-60'
              }`}
            >
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2
                ${isActive || isCompleted ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}
              `}>
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {stepLabel}
              </span>
            </div>
          );
        })}
      </nav>
    </div>
  );
}