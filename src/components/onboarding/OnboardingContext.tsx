'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OnboardingData, OnboardingContextType, ProfileState, PreferenceState, BehaviourState } from './types';

const INITIAL_DATA: OnboardingData = {
  profile: {
    resume: null,
    coverLetter: null,
    photo: null,
    certificates: [],
  },
  preference: {
    jobTitle: '',
    role: null,
    salaryMin: 3000,
    salaryMax: 8000,
    modeOfWork: null,
  },
  behaviour: {
    independentVsTeam: 3,
    structuredVsOpen: 3,
    fastVsSteady: 3,
    quickVsThorough: 3,
    handsOnVsStrategic: 3,
    feedbackVsAutonomy: 3,
    innovationVsProcess: 3,
    flexibleVsSchedule: 3,
  },
  currentStep: 1,
  steps: [
    { id: 1, label: 'Profile', isCompleted: false, path: '/onboarding/profile' },
    { id: 2, label: 'Preference', isCompleted: false, path: '/onboarding/preference' },
    { id: 3, label: 'Behaviour', isCompleted: false, path: '/onboarding/behaviour' },
  ],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA);

  const updateProfile = (updates: Partial<ProfileState>) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...updates },
    }));
  };

  const updatePreference = (updates: Partial<PreferenceState>) => {
    setData((prev) => ({
      ...prev,
      preference: { ...prev.preference, ...updates },
    }));
  };

  const updateBehaviour = (updates: Partial<BehaviourState>) => {
    setData((prev) => ({
      ...prev,
      behaviour: { ...prev.behaviour, ...updates },
    }));
  };

  const markStepComplete = (stepId: number) => {
    setData((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      ),
      currentStep: stepId + 1,
    }));
  };

  // 1. Define the missing function
  const finalSubmit = () => {
    console.log("--- FINAL SUBMITTED DATA ---");
    console.log("Profile:", data.profile);
    console.log("Preference:", data.preference);
    console.log("Behaviour:", data.behaviour);
    alert("Application Submitted! Check console for data.");
  };

  return (
    <OnboardingContext.Provider
      // 2. Add it to the value object here
      value={{ 
        data, 
        updateProfile, 
        updatePreference, 
        updateBehaviour, 
        markStepComplete, 
        finalSubmit 
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};