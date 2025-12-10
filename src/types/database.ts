// src/types/database.ts
// TypeScript types matching the Supabase database schema

export type UserRole = 'applicant' | 'hr';

export type RoleLevel = 'Intern' | 'Junior' | 'Senior' | 'Lead';

export type ModeOfWork = 'Work from Home' | 'On site' | 'Hybrid';

export type JobStatus = 'open' | 'closed';

export type MatchStatus = 'pending' | 'interview_scheduled' | 'rejected' | 'accepted';

// Database table types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicantProfile {
  id: string;
  user_id: string;
  resume_url: string | null;
  cover_letter_url: string | null;
  photo_url: string | null;
  skills: string[]; // JSONB array
  created_at: string;
  updated_at: string;
}

export interface ApplicantPreferences {
  id: string;
  user_id: string;
  target_job_title: string | null;
  role_level: RoleLevel | null;
  salary_min: number | null;
  salary_max: number | null;
  mode_of_work: ModeOfWork | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicantBehaviour {
  id: string;
  user_id: string;
  answers: Record<string, any>; // JSONB
  independent_vs_team: number | null;
  structured_vs_open: number | null;
  fast_vs_steady: number | null;
  quick_vs_thorough: number | null;
  hands_on_vs_strategic: number | null;
  feedback_vs_autonomy: number | null;
  innovation_vs_process: number | null;
  flexible_vs_schedule: number | null;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  hr_user_id: string;
  title: string;
  jd_text: string | null;
  jd_url: string | null;
  status: JobStatus;
  created_at: string;
  updated_at: string;
}

export interface JobPreferences {
  id: string;
  job_id: string;
  role_level: RoleLevel | null;
  salary_min: number | null;
  salary_max: number | null;
  mode_of_work: ModeOfWork | null;
  created_at: string;
  updated_at: string;
}

export interface JobBehaviour {
  id: string;
  job_id: string;
  answers: Record<string, any>; // JSONB
  work_style: string | null;
  task_structure: string | null;
  environment_pace: string | null;
  decision_making: string | null;
  role_focus: string | null;
  feedback_style: string | null;
  innovation_style: string | null;
  schedule_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  applicant_user_id: string;
  job_id: string;
  overall_score: number;
  skills_score: number;
  behaviour_score: number;
  prefs_score: number;
  ai_summary: string | null;
  status: MatchStatus;
  interview_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

// Insert types (for creating new records)
export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type ApplicantProfileInsert = Omit<ApplicantProfile, 'id' | 'created_at' | 'updated_at'>;
export type ApplicantPreferencesInsert = Omit<ApplicantPreferences, 'id' | 'created_at' | 'updated_at'>;
export type ApplicantBehaviourInsert = Omit<ApplicantBehaviour, 'id' | 'created_at' | 'updated_at'>;
export type JobInsert = Omit<Job, 'id' | 'created_at' | 'updated_at'>;
export type JobPreferencesInsert = Omit<JobPreferences, 'id' | 'created_at' | 'updated_at'>;
export type JobBehaviourInsert = Omit<JobBehaviour, 'id' | 'created_at' | 'updated_at'>;
export type MatchInsert = Omit<Match, 'id' | 'created_at' | 'updated_at'>;

// Update types (for partial updates)
export type ApplicantProfileUpdate = Partial<Omit<ApplicantProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type ApplicantPreferencesUpdate = Partial<Omit<ApplicantPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type ApplicantBehaviourUpdate = Partial<Omit<ApplicantBehaviour, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type JobUpdate = Partial<Omit<Job, 'id' | 'hr_user_id' | 'created_at' | 'updated_at'>>;
export type JobPreferencesUpdate = Partial<Omit<JobPreferences, 'id' | 'job_id' | 'created_at' | 'updated_at'>>;
export type JobBehaviourUpdate = Partial<Omit<JobBehaviour, 'id' | 'job_id' | 'created_at' | 'updated_at'>>;
export type MatchUpdate = Partial<Omit<Match, 'id' | 'applicant_user_id' | 'job_id' | 'created_at' | 'updated_at'>>;

