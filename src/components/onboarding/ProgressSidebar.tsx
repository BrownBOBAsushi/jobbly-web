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
    <div className="flex flex-col h-full p-6 bg-white border-r sm:w-1/4 lg:w-64" style={{ 
      borderColor: 'rgba(124, 58, 237, 0.1)',
      boxShadow: '0 2px 12px rgba(124, 58, 237, 0.06)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif"
    }}>
      <div className="mb-8 p-4 border-b" style={{ borderColor: 'rgba(124, 58, 237, 0.1)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#5B21B6' }}>Your Progress</h3>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xl font-bold" style={{ color: '#7C3AED' }}>
            {progressPercentage}% Complete
          </p>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
          <div
            className="h-full transition-all duration-500 ease-out rounded-full"
            style={{ 
              width: `${progressPercentage}%`,
              background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)'
            }}
          />
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {steps.map((step) => {
          const isActive = pathname === step.path;
          const isAccessible = step.isCompleted || isActive;
          
          const linkStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            fontSize: '0.875rem',
            fontWeight: isActive ? 600 : 500,
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            borderLeft: isActive ? '4px solid #7C3AED' : 'none',
            background: isActive ? 'rgba(124, 58, 237, 0.05)' : 'transparent',
            color: isActive ? '#7C3AED' : (step.isCompleted ? '#6B7280' : '#9CA3AF'),
            boxShadow: isActive ? '0 2px 12px rgba(124, 58, 237, 0.06)' : 'none',
            cursor: isAccessible ? 'pointer' : 'not-allowed'
          };

          const StepContent = (
            <>
              <StepIcon isActive={isActive} isCompleted={step.isCompleted} />
              <div className="ml-3 flex flex-col">
                <span style={{ color: isActive ? '#7C3AED' : (step.isCompleted ? '#1F2937' : '#9CA3AF') }}>{step.label}</span>
                <span className="text-xs" style={{ 
                  color: isActive ? '#7C3AED' : (step.isCompleted ? '#10B981' : '#9CA3AF')
                }}>
                  {step.isCompleted ? 'Completed' : (isActive ? 'Current' : 'Not Started')}
                </span>
              </div>
            </>
          );

          return (
            <div key={step.id}>
              {isAccessible ? (
                <Link href={step.path} style={linkStyle} onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(124, 58, 237, 0.02)';
                  }
                }} onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}>
                  {StepContent}
                </Link>
              ) : (
                <div style={linkStyle}>
                  {StepContent}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      <div className="mt-8 pt-4 border-t" style={{ borderColor: 'rgba(124, 58, 237, 0.1)' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#6B7280' }}>Helpful Tips</h4>
        <ul className="text-xs space-y-1 list-disc list-inside" style={{ color: '#6B7280' }}>
          <li>Start with your most recent experience.</li>
          <li>Ensure all fields are accurate.</li>
        </ul>
      </div>
    </div>
  );
};