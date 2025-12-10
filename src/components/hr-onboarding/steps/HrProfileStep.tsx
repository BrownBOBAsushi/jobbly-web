'use client';

import React from 'react';
import { useHrOnboarding } from '../HrOnboardingProvider';
import FileUploadZone from '../ui/FileUploadZone';
import { Input } from '../ui/Input';   // <--- Import
import { Button } from '../ui/Button'; // <--- Import

export default function HrProfileStep() {
  const { state, setJobTitle, setJobDescriptionFile, nextStep, canProceed, isSaving } = useHrOnboarding();

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Upload your JD to let our AI match the best talent.</p>
      </div>

      <div className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        
        {/* REFACTORED: Clean Input Component */}
        <Input
          label="Job Title"
          placeholder="e.g. Senior Full Stack Developer"
          value={state.profile.jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          disabled={isSaving}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Job Description Upload
          </label>
          <FileUploadZone 
            selectedFile={state.profile.jobDescriptionFile}
            onFileSelect={setJobDescriptionFile}
            isDisabled={isSaving}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        {/* REFACTORED: Clean Button Components */}
        <Button 
          variant="secondary"
          disabled={true} // Always disabled on step 1
        >
          Back
        </Button>

        <Button
          variant="primary"
          onClick={nextStep}
          disabled={!canProceed}
          isLoading={isSaving} // Passed directly to the button!
        >
          Next
        </Button>
      </div>
    </div>
  );
}