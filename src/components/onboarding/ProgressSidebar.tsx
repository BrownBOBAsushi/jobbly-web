// components/onboarding/ProgressSidebar.tsx
'use client';

import React from 'react';
import { useOnboarding } from './OnboardingContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaGraduationCap, FaCheckCircle, FaCircle } from 'react-icons/fa';

const StepIcon: React.FC<{ isActive: boolean, isCompleted: boolean }> = ({ isActive, isCompleted }) => {
  if (isCompleted) {
    return <FaCheckCircle className="w-5 h-5 text-green-500" />;
  }
  if (isActive) {
    return <FaGraduationCap className="w-5 h-5 text-indigo-600" />; 
  }
  return <FaCircle className="w-3 h-3 text-gray-400 fill-current" />;
};

export const ProgressSidebar: React.FC = () => { 
  const { data } = useOnboarding();
  const { steps } = data;
  const pathname = usePathname();

  const completedSteps = steps.filter(s => s.isCompleted).length;
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="flex flex-col h-full p-6 bg-white border-r border-gray-100 shadow-xl/5 sm:w-1/4 lg:w-64">
      <div className="mb-8 p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xl font-bold text-indigo-600">
            {progressPercentage}% Complete
          </p>
          <div className="w-full h-2 ml-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {steps.map((step) => {
          const isActive = pathname === step.path;
          const isAccessible = step.isCompleted || isActive;
          
          let linkClasses = 'flex items-center p-3 text-sm font-medium rounded-lg transition-colors duration-200 ';

          if (isActive) {
            linkClasses += 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 shadow-sm';
          } else if (step.isCompleted) {
            linkClasses += 'text-gray-600 hover:bg-gray-50';
          } else {
            linkClasses += 'text-gray-400 cursor-not-allowed';
          }

          const StepContent = (
            <>
              <StepIcon isActive={isActive} isCompleted={step.isCompleted} />
              <div className="ml-3 flex flex-col">
                <span className={isActive ? 'font-semibold' : ''}>{step.label}</span>
                <span className={`text-xs ${isActive ? 'text-indigo-500' : step.isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                  {step.isCompleted ? 'Completed' : (isActive ? 'Current' : 'Not Started')}
                </span>
              </div>
            </>
          );

          return (
            <div key={step.id}>
              {isAccessible ? (
                <Link href={step.path} className={linkClasses}>
                  {StepContent}
                </Link>
              ) : (
                <div className={linkClasses}>
                  {StepContent}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-500 mb-2">Helpful Tips</h4>
        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
          <li>Start with your most recent experience.</li>
          <li>Ensure all fields are accurate.</li>
        </ul>
      </div>
    </div>
  );
};