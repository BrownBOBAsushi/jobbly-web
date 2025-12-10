-- SwiftJobs Seed Data
-- This file seeds the database with demo data for testing

-- Note: This seed file assumes the migration has been run first
-- Users will be created via Supabase Auth, but we'll insert their records into public.users

-- ============================================================================
-- DEMO USERS (These should be created via Supabase Auth first, then we link them)
-- ============================================================================
-- For demo purposes, we'll use placeholder UUIDs
-- In production, these would be actual auth.users IDs

-- Demo Applicant User
-- Email: applicant@demo.com
-- Password: demo123
-- Note: You'll need to create this user via Supabase Auth dashboard or API first
-- Then update the UUID below with the actual user ID

-- Demo HR User
-- Email: hr@demo.com
-- Password: demo123
-- Note: You'll need to create this user via Supabase Auth dashboard or API first
-- Then update the UUID below with the actual user ID

-- ============================================================================
-- HELPER FUNCTION: Create user record if auth user exists
-- ============================================================================
-- This function helps link auth.users with public.users
-- You'll need to manually create users via Supabase Auth first, then run this seed

-- Insert user records into users table
INSERT INTO public.users (id, email, role, full_name)
VALUES 
  ('0974eb22-c5ba-4eb2-b79a-d3e2910abf1d', 'applicant@demo.com', 'applicant', 'Demo Applicant'),
  ('fb151446-8251-46f2-88c9-7eb5b50e498b', 'hr@demo.com', 'hr', 'Demo HR Manager')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

-- ============================================================================
-- DEMO APPLICANT PROFILE
-- ============================================================================
INSERT INTO public.applicant_profiles (
  user_id,
  resume_url,
  cover_letter_url,
  photo_url,
  skills
) VALUES (
  '0974eb22-c5ba-4eb2-b79a-d3e2910abf1d',
  'https://example.com/resumes/demo-resume.pdf',
  'https://example.com/resumes/demo-cover-letter.pdf',
  'https://example.com/photos/demo-photo.jpg',
  '["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
  resume_url = EXCLUDED.resume_url,
  cover_letter_url = EXCLUDED.cover_letter_url,
  photo_url = EXCLUDED.photo_url,
  skills = EXCLUDED.skills;

-- ============================================================================
-- DEMO APPLICANT PREFERENCES
-- ============================================================================
INSERT INTO public.applicant_preferences (
  user_id,
  target_job_title,
  role_level,
  salary_min,
  salary_max,
  mode_of_work
) VALUES (
  '0974eb22-c5ba-4eb2-b79a-d3e2910abf1d',
  'Frontend Engineer',
  'Senior',
  5000,
  8000,
  'Hybrid'
) ON CONFLICT (user_id) DO UPDATE SET
  target_job_title = EXCLUDED.target_job_title,
  role_level = EXCLUDED.role_level,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  mode_of_work = EXCLUDED.mode_of_work;

-- ============================================================================
-- DEMO APPLICANT BEHAVIOUR
-- ============================================================================
INSERT INTO public.applicant_behaviour (
  user_id,
  answers,
  independent_vs_team,
  structured_vs_open,
  fast_vs_steady,
  quick_vs_thorough,
  hands_on_vs_strategic,
  feedback_vs_autonomy,
  innovation_vs_process,
  flexible_vs_schedule
) VALUES (
  '0974eb22-c5ba-4eb2-b79a-d3e2910abf1d',
  '{
    "independent_vs_team": 3,
    "structured_vs_open": 4,
    "fast_vs_steady": 3,
    "quick_vs_thorough": 4,
    "hands_on_vs_strategic": 3,
    "feedback_vs_autonomy": 3,
    "innovation_vs_process": 4,
    "flexible_vs_schedule": 4
  }'::jsonb,
  3,
  4,
  3,
  4,
  3,
  3,
  4,
  4
) ON CONFLICT (user_id) DO UPDATE SET
  answers = EXCLUDED.answers,
  independent_vs_team = EXCLUDED.independent_vs_team,
  structured_vs_open = EXCLUDED.structured_vs_open,
  fast_vs_steady = EXCLUDED.fast_vs_steady,
  quick_vs_thorough = EXCLUDED.quick_vs_thorough,
  hands_on_vs_strategic = EXCLUDED.hands_on_vs_strategic,
  feedback_vs_autonomy = EXCLUDED.feedback_vs_autonomy,
  innovation_vs_process = EXCLUDED.innovation_vs_process,
  flexible_vs_schedule = EXCLUDED.flexible_vs_schedule;

-- ============================================================================
-- DEMO JOBS
-- ============================================================================
INSERT INTO public.jobs (
  hr_user_id,
  title,
  jd_text,
  jd_url,
  status
) VALUES 
  (
    'fb151446-8251-46f2-88c9-7eb5b50e498b',
    'Senior Frontend Engineer',
    'We are looking for a Senior Frontend Engineer with expertise in React, TypeScript, and Next.js. You will work on building scalable web applications and collaborate with cross-functional teams.',
    NULL,
    'open'
  ),
  (
    'fb151446-8251-46f2-88c9-7eb5b50e498b',
    'Full Stack Developer',
    'Join our team as a Full Stack Developer. You will work on both frontend and backend systems, using modern technologies like React, Node.js, and PostgreSQL.',
    NULL,
    'open'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO JOB PREFERENCES
-- ============================================================================
-- Get job IDs first, then insert preferences
WITH job_ids AS (
  SELECT id, title FROM public.jobs WHERE hr_user_id = 'fb151446-8251-46f2-88c9-7eb5b50e498b' ORDER BY created_at DESC LIMIT 2
)
INSERT INTO public.job_preferences (
  job_id,
  role_level,
  salary_min,
  salary_max,
  mode_of_work
)
SELECT 
  id,
  CASE 
    WHEN title LIKE '%Senior%' THEN 'Senior'
    ELSE 'Junior'
  END,
  CASE 
    WHEN title LIKE '%Senior%' THEN 6000
    ELSE 4000
  END,
  CASE 
    WHEN title LIKE '%Senior%' THEN 9000
    ELSE 6000
  END,
  'Hybrid'
FROM job_ids
ON CONFLICT (job_id) DO UPDATE SET
  role_level = EXCLUDED.role_level,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  mode_of_work = EXCLUDED.mode_of_work;

-- ============================================================================
-- DEMO JOB BEHAVIOUR
-- ============================================================================
WITH job_ids AS (
  SELECT id FROM public.jobs WHERE hr_user_id = 'fb151446-8251-46f2-88c9-7eb5b50e498b' ORDER BY created_at DESC LIMIT 2
)
INSERT INTO public.job_behaviour (
  job_id,
  answers,
  work_style,
  task_structure,
  environment_pace,
  decision_making,
  role_focus,
  feedback_style,
  innovation_style,
  schedule_type
)
SELECT 
  id,
  '{
    "work_style": "Team",
    "task_structure": "Structured",
    "environment_pace": "Fast-paced",
    "decision_making": "Thorough",
    "role_focus": "Hands-on",
    "feedback_style": "Frequent",
    "innovation_style": "Innovation",
    "schedule_type": "Flexible"
  }'::jsonb,
  'Team',
  'Structured',
  'Fast-paced',
  'Thorough',
  'Hands-on',
  'Frequent',
  'Innovation',
  'Flexible'
FROM job_ids
ON CONFLICT (job_id) DO UPDATE SET
  answers = EXCLUDED.answers,
  work_style = EXCLUDED.work_style,
  task_structure = EXCLUDED.task_structure,
  environment_pace = EXCLUDED.environment_pace,
  decision_making = EXCLUDED.decision_making,
  role_focus = EXCLUDED.role_focus,
  feedback_style = EXCLUDED.feedback_style,
  innovation_style = EXCLUDED.innovation_style,
  schedule_type = EXCLUDED.schedule_type;

-- ============================================================================
-- INSTRUCTIONS FOR USING THIS SEED FILE
-- ============================================================================
/*
1. Run the migration first: supabase/migrations/001_initial_schema.sql

2. Create demo users via Supabase Auth:
   - Go to Supabase Dashboard > Authentication > Users
   - Create user: applicant@demo.com / demo123
   - Create user: hr@demo.com / demo123
   - Copy their user IDs

3. Update the seed file:
   - Replace <APPLICANT_USER_ID> with the applicant user ID
   - Replace <HR_USER_ID> with the HR user ID

4. Uncomment the INSERT statements above

5. Run the seed file in Supabase SQL Editor

Alternatively, you can use the Supabase CLI:
   supabase db reset (runs migrations + seed)
*/

