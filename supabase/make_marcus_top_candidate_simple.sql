-- Make Marcus Chen the Top Candidate (95% Match) for HR Dashboard
-- Simple script that ensures Marcus appears first when HR views job matches

-- Step 1: Update Marcus Chen's existing matches to 95% (highest score)
UPDATE public.matches
SET 
  overall_score = 95,
  skills_score = 95,
  behaviour_score = 90,
  prefs_score = 100,
  ai_summary = 'Excellent match! Marcus Chen has strong technical skills that perfectly align with our requirements. His React, TypeScript, and CSS expertise makes him an ideal candidate. His work style matches our team culture, and his preferences align perfectly with our offer. This is a top-tier candidate for the role.',
  updated_at = NOW()
WHERE applicant_user_id IN (
  SELECT u.id 
  FROM public.users u
  WHERE u.email LIKE '%marcus%' 
     OR u.email LIKE '%mike.johnson%' 
     OR u.full_name LIKE '%Marcus%' 
     OR u.full_name LIKE '%marcus%'
     OR u.email LIKE '%marcus.chen%'
)
AND job_id IN (
  SELECT j.id 
  FROM public.jobs j 
  WHERE j.status = 'open'
)
AND overall_score < 95;  -- Only update if not already 95%

-- Step 2: Ensure Marcus has a match for each open job (create if missing)
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
  u.id,
  j.id,
  95,  -- Overall score
  95,  -- Skills score
  90,  -- Behaviour score
  100, -- Preferences score
  'Excellent match! Marcus Chen has strong technical skills that perfectly align with our requirements. His React, TypeScript, and CSS expertise makes him an ideal candidate. His work style matches our team culture, and his preferences align perfectly with our offer. This is a top-tier candidate for the role.',
  'pending'
FROM public.users u
CROSS JOIN public.jobs j
WHERE (u.email LIKE '%marcus%' 
   OR u.email LIKE '%mike.johnson%' 
   OR u.full_name LIKE '%Marcus%' 
   OR u.full_name LIKE '%marcus%'
   OR u.email LIKE '%marcus.chen%')
  AND j.status = 'open'
  AND NOT EXISTS (
    SELECT 1 
    FROM public.matches m 
    WHERE m.applicant_user_id = u.id 
      AND m.job_id = j.id
  );

-- Step 3: Verify Marcus Chen is the top candidate for each job
SELECT 
  j.title as job_title,
  u.email as applicant_email,
  u.full_name as applicant_name,
  m.overall_score,
  m.skills_score,
  m.behaviour_score,
  m.prefs_score,
  ROW_NUMBER() OVER (PARTITION BY j.id ORDER BY m.overall_score DESC, m.created_at ASC) as candidate_rank
FROM public.matches m
JOIN public.jobs j ON j.id = m.job_id
JOIN public.users u ON u.id = m.applicant_user_id
WHERE j.status = 'open'
ORDER BY j.title, m.overall_score DESC;

