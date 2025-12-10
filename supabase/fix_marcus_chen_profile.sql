-- Fix Marcus Chen Profile
-- Run this if you changed Mike Johnson to Marcus Chen in Supabase Auth
-- First, get Marcus Chen's user ID from Supabase Auth, then update the UUID below

-- Step 1: Update the user record in public.users
-- Replace <MARCUS_CHEN_USER_ID> with the actual user ID from Supabase Auth
UPDATE public.users 
SET full_name = 'Marcus Chen', email = 'marcus.chen@demo.com'
WHERE email LIKE '%marcus%' OR email LIKE '%mike.johnson%'
RETURNING id, email, full_name;

-- Step 2: Get the user ID (run the above first, then use the returned ID)
-- Then run these with the actual user ID:

-- Update applicant profile (if it exists with old user ID)
-- Replace <MARCUS_CHEN_USER_ID> with the actual user ID
UPDATE public.applicant_profiles
SET updated_at = NOW()
WHERE user_id = '<MARCUS_CHEN_USER_ID>';

-- Update applicant preferences
UPDATE public.applicant_preferences
SET updated_at = NOW()
WHERE user_id = '<MARCUS_CHEN_USER_ID>';

-- Update applicant behaviour
UPDATE public.applicant_behaviour
SET updated_at = NOW()
WHERE user_id = '<MARCUS_CHEN_USER_ID>';

-- If profile doesn't exist, create it (replace <MARCUS_CHEN_USER_ID> with actual ID)
INSERT INTO public.applicant_profiles (
  user_id, resume_url, cover_letter_url, photo_url, skills
) 
SELECT 
  '<MARCUS_CHEN_USER_ID>'::uuid,
  'https://example.com/resumes/marcus-chen-resume.pdf',
  'https://example.com/resumes/marcus-chen-cover-letter.pdf',
  NULL,
  '["React", "TypeScript", "Vue.js", "Node.js", "MongoDB", "CSS"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM public.applicant_profiles WHERE user_id = '<MARCUS_CHEN_USER_ID>'::uuid
);

-- Create preferences if they don't exist
INSERT INTO public.applicant_preferences (
  user_id, target_job_title, role_level, salary_min, salary_max, mode_of_work
)
SELECT 
  '<MARCUS_CHEN_USER_ID>'::uuid,
  'Frontend Engineer',
  'Senior',
  7000,
  9000,
  'Hybrid'
WHERE NOT EXISTS (
  SELECT 1 FROM public.applicant_preferences WHERE user_id = '<MARCUS_CHEN_USER_ID>'::uuid
);

-- Create behaviour if it doesn't exist
INSERT INTO public.applicant_behaviour (
  user_id, answers, independent_vs_team, structured_vs_open, fast_vs_steady,
  quick_vs_thorough, hands_on_vs_strategic, feedback_vs_autonomy,
  innovation_vs_process, flexible_vs_schedule
)
SELECT 
  '<MARCUS_CHEN_USER_ID>'::uuid,
  '{"independent_vs_team": 4, "structured_vs_open": 3, "fast_vs_steady": 4, "quick_vs_thorough": 3, "hands_on_vs_strategic": 3, "feedback_vs_autonomy": 3, "innovation_vs_process": 4, "flexible_vs_schedule": 3}'::jsonb,
  4, 3, 4, 3, 3, 3, 4, 3
WHERE NOT EXISTS (
  SELECT 1 FROM public.applicant_behaviour WHERE user_id = '<MARCUS_CHEN_USER_ID>'::uuid
);

