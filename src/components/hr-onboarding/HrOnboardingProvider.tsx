'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { HrOnboardingContextType, HrPreferenceData, HrBehaviourData } from '@/types/hr-onboarding';

const HrOnboardingContext = createContext<HrOnboardingContextType | undefined>(undefined);

const stepToPath = (step: number): string => {
  switch (step) {
    case 0: return '/hr/onboarding';
    case 1: return '/hr/onboarding/preference';
    case 2: return '/hr/onboarding/behaviour';
    default: return '/hr/onboarding';
  }
};

export function HrOnboardingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSaving, setIsSaving] = useState(false);

  const initialStep = useMemo(() => {
    if (pathname === '/hr/onboarding/preference') return 1;
    if (pathname === '/hr/onboarding/behaviour') return 2;
    return 0;
  }, [pathname]);

  const [currentStep, setCurrentStep] = useState(initialStep);

  const [profile, setProfile] = useState({
    jobTitle: '',
    jobDescriptionFile: null as File | null,
  });

  const [preference, setPreference] = useState<HrPreferenceData>({
    targetRole: '',
    seniorityLevel: '',
    salaryMin: '',
    salaryMax: '',
    location: '',
    remotePolicy: 'Hybrid',
  });

  // NEW: Initial state for the 8 matching axes
  const [behaviour, setBehaviour] = useState<HrBehaviourData>({
    workStyle: '',
    taskStructure: '',
    environmentPace: '',
    decisionMaking: '',
    roleFocus: '',
    feedbackStyle: '',
    innovationStyle: '',
    scheduleType: '',
  });

  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  // Actions
  const setJobTitle = (title: string) => {
    setProfile((prev) => ({ ...prev, jobTitle: title }));
  };

  const setJobDescriptionFile = (file: File | null) => {
    setProfile((prev) => ({ ...prev, jobDescriptionFile: file }));
  };

  const updatePreference = (field: keyof HrPreferenceData, value: string) => {
    setPreference((prev) => ({ ...prev, [field]: value }));
  };

  const updateBehaviour = (field: keyof HrBehaviourData, value: string) => {
    setBehaviour((prev) => ({ ...prev, [field]: value }));
  };

  // Saving & Navigation
  const saveProfileAndContinue = async () => {
    if (!profile.jobTitle || !profile.jobDescriptionFile) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('jobTitle', profile.jobTitle);
      formData.append('file', profile.jobDescriptionFile);

      const response = await fetch('/api/hr/profile', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to save');
      
      const next = Math.min(currentStep + 1, 2);
      router.push(stepToPath(next));
    } catch (error) {
      console.error(error);
      alert('Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const completeOnboarding = async () => {
    setIsSaving(true);
    try {
      // Simulate Final API Submit
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('FINAL SYMMETRIC MATCHING DATA:', { profile, preference, behaviour });
      alert("Setup Complete! Ready for matching.");
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 0) {
      await saveProfileAndContinue();
    } else if (currentStep === 2) {
      await completeOnboarding();
    } else {
      const next = Math.min(currentStep + 1, 2);
      router.push(stepToPath(next));
    }
  };

  const prevStep = () => {
    const prev = Math.max(currentStep - 1, 0);
    router.push(stepToPath(prev));
  };

  // Validation
  const canProceed = useMemo(() => {
    if (currentStep === 0) {
      return profile.jobTitle.trim() !== '' && profile.jobDescriptionFile !== null;
    }
    if (currentStep === 1) {
      return (
        preference.targetRole.trim() !== '' &&
        preference.seniorityLevel !== '' &&
        preference.location.trim() !== ''
      );
    }
    if (currentStep === 2) {
      // Validate all 8 keys are selected (not empty strings)
      return Object.values(behaviour).every(value => value !== '');
    }
    return true;
  }, [currentStep, profile, preference, behaviour]);

  const value: HrOnboardingContextType = {
    state: { currentStep, profile, preference, behaviour },
    setJobTitle,
    setJobDescriptionFile,
    updatePreference,
    updateBehaviour,
    nextStep,
    prevStep,
    canProceed,
    isSaving,
  };

  return <HrOnboardingContext.Provider value={value}>{children}</HrOnboardingContext.Provider>;
}

export function useHrOnboarding() {
  const context = useContext(HrOnboardingContext);
  if (!context) throw new Error('useHrOnboarding must be used within a HrOnboardingProvider');
  return context;
}