// components/onboarding/types.ts

export interface ProfileState {
    resume: File | null;
    coverLetter: File | null;
    photo: File | null;
    certificates: File[];
  }
  
  export interface PreferenceState {
    jobTitle: string; // <--- NEW FIELD
    role: 'Intern' | 'Junior' | 'Senior' | null;
    salaryMin: number;
    salaryMax: number;
    modeOfWork: 'Work from Home' | 'On site' | 'Hybrid' | null;
  }
  
  export interface BehaviourState {
    independentVsTeam: number;
    structuredVsOpen: number;
    fastVsSteady: number;
    quickVsThorough: number;
    handsOnVsStrategic: number;
    feedbackVsAutonomy: number;
    innovationVsProcess: number;
    flexibleVsSchedule: number;
  }
  
  export interface OnboardingData {
    profile: ProfileState;
    preference: PreferenceState;
    behaviour: BehaviourState;
    currentStep: number;
    steps: {
      id: number;
      label: string;
      isCompleted: boolean;
      path: string;
    }[];
  }
  
  export interface OnboardingContextType {
    data: OnboardingData;
    updateProfile: (updates: Partial<ProfileState>) => void;
    updatePreference: (updates: Partial<PreferenceState>) => void;
    updateBehaviour: (updates: Partial<BehaviourState>) => void;
    markStepComplete: (stepId: number) => void;
    finalSubmit: () => void;
  }