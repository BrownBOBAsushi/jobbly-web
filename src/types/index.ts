// src/types/index.ts

export type ModeOfWork = 'Remote' | 'On-site' | 'Hybrid';
export type EmploymentType = 'Full-time' | 'Contract' | 'Internship' | 'Part-time';

// Matches a future "users" or "profiles" table in Supabase
export interface ApplicantProfile {
  id: string;
  name: string;
  avatarUrl?: string; // URL to image
  roleLevel: 'Intern' | 'Junior' | 'Senior' | 'Lead';
  bio?: string; // Short summary
}

// Matches a future "preferences" table
export interface ApplicantPreferences {
  targetSalaryRange: string; // e.g. "$5k - $8k"
  preferredMode: ModeOfWork[];
  locations: string[];
}

// Matches a future "behaviours" table
export interface ApplicantBehaviour {
  riskTolerance: number; // 0-100
  autonomyLevel: number; // 0-100
  processOrientation: number; // 0-100
}

// Matches a future "jobs" table
export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  modeOfWork: ModeOfWork;
  employmentType: EmploymentType;
  salaryRange: string;
  tags: string[];
  description: string; // Markdown or HTML string
  postedDate: string;
  logoUrl?: string; // Company logo placeholder
  
  // AI Matching Fields (computed, might not be in DB but returned by API)
  matchConfidence: number; 
  matchDetails: {
    skillMatch: number;      // e.g. 95
    cultureMatch: number;    // e.g. 88
    preferenceMatch: number; // e.g. 100
    reason: string;          // "High overlap in React skills and Remote preference."
  };
}

// Global App State Interface
export interface AppState {
  user: ApplicantProfile | null;
  preferences: ApplicantPreferences | null;
  behaviour: ApplicantBehaviour | null;
  matchedJobs: JobMatch[];
  selectedJobId: string | null;
  isLoading: boolean;
}