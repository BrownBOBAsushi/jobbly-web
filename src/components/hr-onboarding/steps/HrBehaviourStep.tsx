'use client';

import React from 'react';
import { useHrOnboarding } from '../HrOnboardingProvider';
import { Button } from '../ui/Button';
import { BinaryChoice } from '../ui/BinaryChoice'; // Import the new component
import { HrBehaviourData } from '@/types/hr-onboarding';

export default function HrBehaviourStep() {
  const { state, updateBehaviour, nextStep, prevStep, canProceed, isSaving } = useHrOnboarding();
  const { behaviour } = state;

  // Exact configuration matching your Applicant UI screenshots
  const questions = [
    {
      key: 'workStyle' as keyof HrBehaviourData,
      label: 'Collaboration Style',
      left: { label: 'Works Independently', value: 'Independent' },
      right: { label: 'Prefers Team Work', value: 'Team' }
    },
    {
      key: 'taskStructure' as keyof HrBehaviourData,
      label: 'Task Approach',
      left: { label: 'Highly Structured', value: 'Structured' },
      right: { label: 'Open-ended & Flexible', value: 'Open' }
    },
    {
      key: 'environmentPace' as keyof HrBehaviourData,
      label: 'Environment Pace',
      left: { label: 'Steady & Detailed', value: 'Steady' },
      right: { label: 'Fast-paced & Urgent', value: 'Fast' }
    },
    {
      key: 'decisionMaking' as keyof HrBehaviourData,
      label: 'Decision Making',
      left: { label: 'Thorough & Slow', value: 'Thorough' },
      right: { label: 'Quick & Decisive', value: 'Quick' }
    },
    {
      key: 'roleFocus' as keyof HrBehaviourData,
      label: 'Work Focus',
      left: { label: 'Hands-on Execution', value: 'Hands-on' },
      right: { label: 'Strategic Oversight', value: 'Strategic' }
    },
    {
      key: 'feedbackStyle' as keyof HrBehaviourData,
      label: 'Supervision',
      left: { label: 'Frequent Feedback Needed', value: 'Frequent' },
      right: { label: 'High Autonomy Preferred', value: 'Autonomy' }
    },
    {
      key: 'innovationStyle' as keyof HrBehaviourData,
      label: 'Process Orientation',
      left: { label: 'Follows Strict Processes', value: 'Process' },
      right: { label: 'Prioritizes Innovation', value: 'Innovation' }
    },
    {
      key: 'scheduleType' as keyof HrBehaviourData,
      label: 'Schedule',
      left: { label: 'Adheres to Set Schedule', value: 'Set' },
      right: { label: 'Requires High Flexibility', value: 'Flexible' }
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Behaviour</h1>
        <p className="text-gray-500 mt-2">
          Select the option that best describes how you want the candidate to operate.
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        
        {/* Render the questions in a 1-column layout to give space for the binary buttons */}
        <div className="space-y-10">
          {questions.map((q) => (
            <BinaryChoice
              key={q.key}
              label={q.label}
              leftLabel={q.left.label}
              leftValue={q.left.value}
              rightLabel={q.right.label}
              rightValue={q.right.value}
              selectedValue={behaviour[q.key]}
              onChange={(val) => updateBehaviour(q.key, val)}
              disabled={isSaving}
            />
          ))}
        </div>

      </div>

      <div className="flex justify-between items-center mt-12">
        <Button variant="secondary" onClick={prevStep} disabled={isSaving}>
          Back
        </Button>

        <Button
          variant="primary"
          onClick={nextStep}
          disabled={!canProceed || isSaving}
          isLoading={isSaving}
        >
          Save & Start Matching
        </Button>
      </div>
    </div>
  );
}