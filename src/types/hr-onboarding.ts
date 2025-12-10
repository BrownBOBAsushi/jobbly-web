// src/types/hr-onboarding.ts

export interface HrProfileData {
    jobTitle: string;
    jobDescriptionFile: File | null;
  }
  
  export interface HrPreferenceData {
    targetRole: string;
    seniorityLevel: string;
    salaryMin: string;
    salaryMax: string;
    location: string;
    remotePolicy: string;
  }
  
  // NEW: Symmetric Matching Data (8 Keys)
  export interface HrBehaviourData {
    workStyle: string;          // Independent vs Team
    taskStructure: string;      // Structured vs Open-ended
    environmentPace: string;    // Fast-paced vs Steady
    decisionMaking: string;     // Quick vs Thorough
    roleFocus: string;          // Hands-on vs Strategic
    feedbackStyle: string;      // Frequent vs Autonomy
    innovationStyle: string;    // Innovation vs Process
    scheduleType: string;       // Flexible vs Set
  }
  
  export interface HrOnboardingState {
    currentStep: number;
    profile: HrProfileData;
    preference: HrPreferenceData;
    behaviour: HrBehaviourData; // Updated
  }
  
  export interface HrOnboardingContextType {
    state: HrOnboardingState;
    
    // Actions
    setJobTitle: (title: string) => void;
    setJobDescriptionFile: (file: File | null) => void;
    updatePreference: (field: keyof HrPreferenceData, value: string) => void;
    updateBehaviour: (field: keyof HrBehaviourData, value: string) => void;
    
    nextStep: () => void;
    prevStep: () => void;
    
    canProceed: boolean;
    isSaving: boolean;
  }