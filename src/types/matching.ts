// src/types/matching.ts
// Types for matching engine and API responses

import { Match, Job, ApplicantProfile, ApplicantPreferences, ApplicantBehaviour } from './database';

export interface MatchScores {
  skills_score: number;
  behaviour_score: number;
  prefs_score: number;
  overall_score: number;
}

export interface MatchResult extends MatchScores {
  ai_summary?: string;
}

// Extended match with related data for API responses
export interface MatchWithJob extends Match {
  job: Job & {
    preferences?: {
      role_level: string | null;
      salary_min: number | null;
      salary_max: number | null;
      mode_of_work: string | null;
    };
  };
}

export interface MatchWithApplicant extends Match {
  applicant: {
    profile: ApplicantProfile;
    preferences: ApplicantPreferences;
    user: {
      id: string;
      email: string;
      full_name: string | null;
    };
  };
}

// API Response types
export interface ApplicantMatchesResponse {
  profile: ApplicantProfile;
  matches: MatchWithJob[];
}

export interface HRJobMatchesResponse {
  job: Job & {
    preferences?: {
      role_level: string | null;
      salary_min: number | null;
      salary_max: number | null;
      mode_of_work: string | null;
    };
    behaviour?: Record<string, any>;
  };
  matches: MatchWithApplicant[];
}

export interface HRJobsResponse {
  jobs: (Job & {
    preferences?: {
      role_level: string | null;
      salary_min: number | null;
      salary_max: number | null;
      mode_of_work: string | null;
    };
    match_count?: number; // Number of matches for this job
  })[];
}

