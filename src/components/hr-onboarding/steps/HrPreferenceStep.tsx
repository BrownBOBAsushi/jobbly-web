'use client';

import React from 'react';
import { useHrOnboarding } from '../HrOnboardingProvider';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PillSelector } from '../ui/PillSelector'; // Import the new component

export default function HrPreferenceStep() {
  const { state, updatePreference, nextStep, prevStep, canProceed } = useHrOnboarding();
  const { preference } = state;

  // Configuration for Pills
  const roleOptions = [
    { value: 'Intern', label: 'Intern' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Lead', label: 'Lead' }, // Added Lead for HR completeness
  ];

  const workModeOptions = [
    { value: 'Remote', label: 'Work from Home' },
    { value: 'On-site', label: 'On site' },
    { value: 'Hybrid', label: 'Hybrid' },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      {/* Header matching Applicant UI */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Preference</h1>
        <p className="text-gray-500 mt-2">Tell us what you’re looking for</p>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        
        {/* 1. Job Title */}
        <Input
          label="Job Title"
          placeholder="e.g. Frontend Engineer"
          value={preference.targetRole} // We map 'targetRole' to Job Title
          onChange={(e) => updatePreference('targetRole', e.target.value)}
        />

        {/* 2. Indicate Role (Seniority) - Using Pills */}
        <PillSelector
          label="Indicate Role"
          options={roleOptions}
          value={preference.seniorityLevel}
          onChange={(val) => updatePreference('seniorityLevel', val)}
        />

        {/* 3. Expected Salary Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Expected Salary Range (Per Month)
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input 
                label="" // Empty label since main label is above
                type="number" 
                placeholder="$ Min" 
                value={preference.salaryMin}
                onChange={(e) => updatePreference('salaryMin', e.target.value)}
                className="text-center"
              />
            </div>
            <div className="text-gray-400 font-medium">—</div>
            <div className="flex-1">
              <Input 
                label="" 
                type="number" 
                placeholder="$ Max" 
                value={preference.salaryMax}
                onChange={(e) => updatePreference('salaryMax', e.target.value)}
                className="text-center"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Enter the monthly base salary range.
          </p>
        </div>

        {/* 4. Mode of work - Using Pills */}
        <PillSelector
          label="Mode of work"
          options={workModeOptions}
          value={preference.remotePolicy} // Maps to remotePolicy
          onChange={(val) => updatePreference('remotePolicy', val)}
        />
        
        {/* Location Input (Only show if NOT Remote) */}
        {preference.remotePolicy !== 'Remote' && (
           <Input
             label="Office Location"
             placeholder="e.g. Singapore, CBD"
             value={preference.location}
             onChange={(e) => updatePreference('location', e.target.value)}
           />
        )}

      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Button variant="secondary" onClick={prevStep}>
          Back
        </Button>

        <Button
          variant="primary"
          onClick={nextStep}
          disabled={!canProceed}
        >
          Next
        </Button>
      </div>
    </div>
  );
}