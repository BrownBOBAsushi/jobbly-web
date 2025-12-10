'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { HrOnboardingContextType, HrPreferenceData, HrBehaviourData } from '@/types/hr-onboarding';
import { supabase } from '@/lib/supabase';

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

  // Persist jobId in localStorage to survive page navigation
  const [currentJobId, setCurrentJobId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hr_current_job_id');
    }
    return null;
  });

  // Update localStorage whenever jobId changes
  useEffect(() => {
    if (currentJobId) {
      localStorage.setItem('hr_current_job_id', currentJobId);
    } else {
      localStorage.removeItem('hr_current_job_id');
    }
  }, [currentJobId]);

  // If jobId is missing but we're on preference/behaviour step, try to fetch the most recent job
  useEffect(() => {
    const fetchMostRecentJob = async () => {
      if (!currentJobId && (currentStep === 1 || currentStep === 2)) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const response = await fetch('/api/hr/jobs', {
            method: 'GET',
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.jobs && data.jobs.length > 0) {
              // Use the most recent job
              const mostRecentJob = data.jobs[0];
              console.log('✅ Found existing job, using:', mostRecentJob.id);
              setCurrentJobId(mostRecentJob.id);
            }
          }
        } catch (error) {
          console.error('Error fetching most recent job:', error);
        }
      }
    };

    fetchMostRecentJob();
  }, [currentJobId, currentStep]);

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

      const response = await fetch('/api/hr/profile', { 
        method: 'POST', 
        body: formData,
        credentials: 'include', // Include cookies for authentication
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      const data = await response.json();
      console.log('✅ Profile saved, response:', data);
      
      // Extract job ID from response
      const jobId = data.job?.id;
      if (!jobId) {
        console.error('❌ No job ID in response:', data);
        throw new Error('Job ID not returned from server');
      }
      
      console.log('✅ Setting currentJobId:', jobId);
      setCurrentJobId(jobId); // Store job ID for subsequent steps
      
      const next = Math.min(currentStep + 1, 2);
      router.push(stepToPath(next));
    } catch (error: any) {
      console.error(error);
      alert('Failed to save profile: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const savePreferencesAndContinue = async () => {
    if (!currentJobId) {
      alert('Job ID not found. Please go back and create a job first.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/hr/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          job_id: currentJobId,
          role_level: preference.seniorityLevel,
          salary_min: preference.salaryMin ? parseInt(preference.salaryMin) : undefined,
          salary_max: preference.salaryMax ? parseInt(preference.salaryMax) : undefined,
          mode_of_work: preference.remotePolicy === 'Remote' ? 'Work from Home' : 
                        preference.remotePolicy === 'On-site' ? 'On site' : 'Hybrid',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save preferences');
      }

      const next = Math.min(currentStep + 1, 2);
      router.push(stepToPath(next));
    } catch (error: any) {
      console.error(error);
      alert('Failed to save preferences: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveBehaviourAndContinue = async () => {
    if (!currentJobId) {
      alert('Job ID not found. Please go back and create a job first.');
      return;
    }
    try {
      const response = await fetch('/api/hr/behaviour', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          job_id: currentJobId,
          work_style: behaviour.workStyle,
          task_structure: behaviour.taskStructure,
          environment_pace: behaviour.environmentPace,
          decision_making: behaviour.decisionMaking,
          role_focus: behaviour.roleFocus,
          feedback_style: behaviour.feedbackStyle,
          innovation_style: behaviour.innovationStyle,
          schedule_type: behaviour.scheduleType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save behaviour');
      }
    } catch (error: any) {
      console.error(error);
      alert('Failed to save behaviour: ' + error.message);
      throw error; // Re-throw to prevent completing onboarding
    }
  };

  const completeOnboarding = async () => {
    if (!currentJobId) {
      alert('Job ID not found. Please go back and complete all steps.');
      return;
    }
    setIsSaving(true);
    try {
      // Trigger matching for this job
      const response = await fetch(`/api/hr/jobs/${currentJobId}/start-matching`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start matching');
      }

      const data = await response.json();
      console.log('Matching completed:', data);
      alert(`Setup Complete! ${data.matches_created} match(es) created.`);
      router.push('/hr-dashboard');
    } catch (error: any) {
      console.error(error);
      alert('Failed to complete onboarding: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 0) {
      await saveProfileAndContinue();
    } else if (currentStep === 1) {
      await savePreferencesAndContinue();
    } else if (currentStep === 2) {
      // Save behaviour first, then complete onboarding
      await saveBehaviourAndContinue();
      // After saving behaviour, complete onboarding (trigger matching)
      await completeOnboarding();
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
        preference.seniorityLevel !== '' &&
        preference.remotePolicy !== '' &&
        preference.salaryMin !== '' &&
        preference.salaryMax !== ''
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