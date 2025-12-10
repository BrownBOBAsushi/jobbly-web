-- Make Marcus Chen the Top Candidate (95% Match) for HR Dashboard Showcase
-- This script ensures Marcus Chen appears as the #1 candidate when HR views job matches

-- Step 1: Find Marcus Chen's user ID and their top match
WITH marcus_info AS (
  SELECT 
    u.id as user_id,
    u.email,
    u.full_name,
    m.id as match_id,
    m.job_id,
    m.overall_score,
    ROW_NUMBER() OVER (ORDER BY m.overall_score DESC, m.created_at DESC) as match_rank
  FROM public.users u
  JOIN public.matches m ON m.applicant_user_id = u.id
  WHERE u.email LIKE '%marcus%' 
     OR u.email LIKE '%mike.johnson%' 
     OR u.full_name LIKE '%Marcus%' 
     OR u.full_name LIKE '%marcus%'
     OR u.email LIKE '%marcus.chen%'
),
-- Step 2: Get the job that Marcus is matched to (for HR to view)
job_info AS (
  SELECT 
    j.id as job_id,
    j.hr_user_id,
    j.title as job_title
  FROM public.jobs j
  WHERE j.status = 'open'
  ORDER BY j.created_at DESC
  LIMIT 1
)
-- Step 3: Update Marcus Chen's top match to 95% and ensure it's linked to a visible job
UPDATE public.matches
SET 
  overall_score = 95,
  skills_score = 95,
  behaviour_score = 90,
  prefs_score = 100,
  ai_summary = 'Excellent match! Marcus Chen has strong technical skills that perfectly align with our requirements. His React, TypeScript, and CSS expertise makes him an ideal candidate. His work style matches our team culture, and his preferences align perfectly with our offer. This is a top-tier candidate for the role.',
  updated_at = NOW()
FROM marcus_info mi
WHERE matches.id = mi.match_id
  AND mi.match_rank = 1;

-- Step 4: If Marcus doesn't have a match for the HR's job, create one
-- First, let's find the HR user and their job
WITH hr_job AS (
  SELECT 
    j.id as job_id,
    j.hr_user_id,
    j.title
  FROM public.jobs j
  WHERE j.status = 'open'
  ORDER BY j.created_at DESC
  LIMIT 1
),
marcus_user AS (
  SELECT u.id as user_id
  FROM public.users u
  WHERE u.email LIKE '%marcus%' 
     OR u.email LIKE '%mike.johnson%' 
     OR u.full_name LIKE '%Marcus%' 
     OR u.full_name LIKE '%marcus%'
     OR u.email LIKE '%marcus.chen%'
  LIMIT 1
)
INSERT INTO public.matches (
  applicant_user_id,
  job_id,
  overall_score,
  skills_score,
  behaviour_score,
  prefs_score,
  ai_summary,
  status
)
SELECT 
  mu.user_id,
  hj.job_id,
  95,  -- Overall score
  95,  -- Skills score
  90,  -- Behaviour score
  100, -- Preferences score
  'Excellent match! Marcus Chen has strong technical skills that perfectly align with our requirements. His React, TypeScript, and CSS expertise makes him an ideal candidate. His work style matches our team culture, and his preferences align perfectly with our offer. This is a top-tier candidate for the role.',
  'pending'
FROM hr_job hj
CROSS JOIN marcus_user mu
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.matches m 
  WHERE m.applicant_user_id = mu.user_id 
    AND m.job_id = hj.job_id
);

-- Step 5: Verify Marcus Chen is now the top candidate
SELECT 
  u.email,
  u.full_name,
  j.title as job_title,
  j.hr_user_id,
  m.overall_score,
  m.skills_score,
  m.behaviour_score,
  m.prefs_score,
  m.status,
  ROW_NUMBER() OVER (PARTITION BY j.id ORDER BY m.overall_score DESC) as candidate_rank
FROM public.matches m
JOIN public.users u ON u.id = m.applicant_user_id
JOIN public.jobs j ON j.id = m.job_id
WHERE (u.email LIKE '%marcus%' 
   OR u.email LIKE '%mike.johnson%' 
   OR u.full_name LIKE '%Marcus%' 
   OR u.full_name LIKE '%marcus%'
   OR u.email LIKE '%marcus.chen%')
  AND j.status = 'open'
ORDER BY j.id, m.overall_score DESC;

