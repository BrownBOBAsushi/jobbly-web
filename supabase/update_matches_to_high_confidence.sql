-- Update Existing Matches to High Confidence (>90%) for Showcase
-- This script automatically finds Marcus Chen by email/name and updates their matches to >90% scores

-- Step 1: Update the top 2 matches to have >90% scores
-- This updates matches in descending order of current score, ensuring at least 2 high-confidence matches

WITH ranked_matches AS (
  SELECT 
    m.id,
    m.job_id,
    ROW_NUMBER() OVER (ORDER BY m.overall_score DESC, m.created_at DESC) as rn
  FROM public.matches m
  JOIN public.users u ON u.id = m.applicant_user_id
  WHERE u.email LIKE '%marcus%' 
     OR u.email LIKE '%mike.johnson%' 
     OR u.full_name LIKE '%Marcus%' 
     OR u.full_name LIKE '%marcus%'
     OR u.email LIKE '%marcus.chen%'
)
UPDATE public.matches
SET 
  overall_score = CASE 
    WHEN rn = 1 THEN 95  -- First match: 95%
    WHEN rn = 2 THEN 92  -- Second match: 92%
    ELSE overall_score    -- Keep others as is
  END,
  skills_score = CASE 
    WHEN rn = 1 THEN 95  -- First match: 95% skills
    WHEN rn = 2 THEN 90   -- Second match: 90% skills
    ELSE skills_score
  END,
  behaviour_score = CASE 
    WHEN rn = 1 THEN 90   -- First match: 90% behaviour
    WHEN rn = 2 THEN 90   -- Second match: 90% behaviour
    ELSE behaviour_score
  END,
  prefs_score = CASE 
    WHEN rn = 1 THEN 100  -- First match: 100% preferences
    WHEN rn = 2 THEN 95   -- Second match: 95% preferences
    ELSE prefs_score
  END,
  ai_summary = CASE 
    WHEN rn = 1 THEN 'Excellent match! The applicant has strong technical skills that perfectly align with our requirements. Their work style matches our team culture, and their preferences align perfectly with our offer. This is an ideal candidate for the role.'
    WHEN rn = 2 THEN 'Strong match! The applicant possesses the required skills and experience. Their preferences and work style align well with our role and company culture. Highly recommended for consideration.'
    ELSE ai_summary
  END,
  updated_at = NOW()
FROM ranked_matches rm
WHERE matches.id = rm.id
  AND rm.rn <= 2;

-- Step 2: Verify the updates
SELECT 
  u.email,
  u.full_name,
  j.title as job_title,
  m.overall_score,
  m.skills_score,
  m.behaviour_score,
  m.prefs_score,
  m.status
FROM public.matches m
JOIN public.jobs j ON j.id = m.job_id
JOIN public.users u ON u.id = m.applicant_user_id
WHERE u.email LIKE '%marcus%' 
   OR u.email LIKE '%mike.johnson%' 
   OR u.full_name LIKE '%Marcus%' 
   OR u.full_name LIKE '%marcus%'
   OR u.email LIKE '%marcus.chen%'
ORDER BY m.overall_score DESC
LIMIT 5;

