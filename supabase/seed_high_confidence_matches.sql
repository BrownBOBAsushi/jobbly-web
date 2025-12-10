-- Seed High-Confidence Matches for Showcase
-- This ensures at least 2 jobs with >90% match for Marcus Chen
-- Run this after you've set up Marcus Chen's profile

-- Step 1: Create/Update jobs that perfectly match Marcus Chen's skills
-- Marcus Chen has: ["React", "TypeScript", "Vue.js", "Node.js", "MongoDB", "CSS"]

-- Job 1: Senior Frontend Engineer (Perfect React/TypeScript match)
INSERT INTO public.jobs (
  hr_user_id, title, jd_text, jd_url, status
) VALUES (
  'fb151446-8251-46f2-88c9-7eb5b50e498b', -- HR user ID
  'Senior Frontend Engineer - React Specialist',
  'We are seeking a Senior Frontend Engineer with deep expertise in React and TypeScript. You will build modern, scalable web applications using React, TypeScript, Next.js, and modern CSS frameworks. Strong experience with React hooks, component architecture, and TypeScript is essential. Experience with Vue.js is a plus.',
  NULL,
  'open'
) ON CONFLICT DO NOTHING
RETURNING id;

-- Get the job ID (replace with actual ID after running above)
-- Let's use a CTE to get the job ID
WITH new_job AS (
  INSERT INTO public.jobs (
    hr_user_id, title, jd_text, jd_url, status
  ) VALUES (
    'fb151446-8251-46f2-88c9-7eb5b50e498b',
    'Senior Frontend Engineer - React Specialist',
    'We are seeking a Senior Frontend Engineer with deep expertise in React and TypeScript. You will build modern, scalable web applications using React, TypeScript, Next.js, and modern CSS frameworks. Strong experience with React hooks, component architecture, and TypeScript is essential. Experience with Vue.js is a plus.',
    NULL,
    'open'
  ) ON CONFLICT DO NOTHING
  RETURNING id
)
SELECT id FROM new_job;

-- Job 2: Full Stack Developer (Perfect React/Node.js/MongoDB match)
INSERT INTO public.jobs (
  hr_user_id, title, jd_text, jd_url, status
) VALUES (
  'fb151446-8251-46f2-88c9-7eb5b50e498b',
  'Full Stack Developer - React & Node.js',
  'Join our team as a Full Stack Developer. You will work on both frontend (React, TypeScript, CSS) and backend (Node.js, MongoDB) systems. We need someone with strong React and TypeScript skills, plus Node.js experience. MongoDB knowledge is required. Vue.js experience is a bonus.',
  NULL,
  'open'
) ON CONFLICT DO NOTHING
RETURNING id;

-- Step 2: Create job preferences that match Marcus Chen's preferences
-- Marcus Chen wants: Senior, $7000-$9000, Hybrid

-- For Job 1 (Senior Frontend Engineer - React Specialist)
-- Get job ID first, then insert preferences
-- Replace <JOB1_ID> with actual job ID from above
INSERT INTO public.job_preferences (
  job_id, role_level, salary_min, salary_max, mode_of_work
)
SELECT 
  j.id,
  'Senior',
  7500,
  9500,
  'Hybrid'
FROM public.jobs j
WHERE j.title = 'Senior Frontend Engineer - React Specialist'
  AND j.hr_user_id = 'fb151446-8251-46f2-88c9-7eb5b50e498b'
ON CONFLICT (job_id) DO UPDATE SET
  role_level = EXCLUDED.role_level,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  mode_of_work = EXCLUDED.mode_of_work;

-- For Job 2 (Full Stack Developer)
INSERT INTO public.job_preferences (
  job_id, role_level, salary_min, salary_max, mode_of_work
)
SELECT 
  j.id,
  'Senior',
  7000,
  9000,
  'Hybrid'
FROM public.jobs j
WHERE j.title = 'Full Stack Developer - React & Node.js'
  AND j.hr_user_id = 'fb151446-8251-46f2-88c9-7eb5b50e498b'
ON CONFLICT (job_id) DO UPDATE SET
  role_level = EXCLUDED.role_level,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  mode_of_work = EXCLUDED.mode_of_work;

-- Step 3: Create job behaviour that matches Marcus Chen's behaviour
-- Marcus Chen: independent_vs_team: 4, structured_vs_open: 3, fast_vs_steady: 4, etc.

-- For Job 1
INSERT INTO public.job_behaviour (
  job_id, answers, independent_vs_team, structured_vs_open, fast_vs_steady,
  quick_vs_thorough, hands_on_vs_strategic, feedback_vs_autonomy,
  innovation_vs_process, flexible_vs_schedule
)
SELECT 
  j.id,
  '{"independent_vs_team": 4, "structured_vs_open": 3, "fast_vs_steady": 4, "quick_vs_thorough": 3, "hands_on_vs_strategic": 3, "feedback_vs_autonomy": 3, "innovation_vs_process": 4, "flexible_vs_schedule": 3}'::jsonb,
  4, 3, 4, 3, 3, 3, 4, 3
FROM public.jobs j
WHERE j.title = 'Senior Frontend Engineer - React Specialist'
  AND j.hr_user_id = 'fb151446-8251-46f2-88c9-7eb5b50e498b'
ON CONFLICT (job_id) DO UPDATE SET
  answers = EXCLUDED.answers,
  independent_vs_team = EXCLUDED.independent_vs_team,
  structured_vs_open = EXCLUDED.structured_vs_open,
  fast_vs_steady = EXCLUDED.fast_vs_steady,
  quick_vs_thorough = EXCLUDED.quick_vs_thorough,
  hands_on_vs_strategic = EXCLUDED.hands_on_vs_strategic,
  feedback_vs_autonomy = EXCLUDED.feedback_vs_autonomy,
  innovation_vs_process = EXCLUDED.innovation_vs_process,
  flexible_vs_schedule = EXCLUDED.flexible_vs_schedule;

-- For Job 2
INSERT INTO public.job_behaviour (
  job_id, answers, independent_vs_team, structured_vs_open, fast_vs_steady,
  quick_vs_thorough, hands_on_vs_strategic, feedback_vs_autonomy,
  innovation_vs_process, flexible_vs_schedule
)
SELECT 
  j.id,
  '{"independent_vs_team": 4, "structured_vs_open": 3, "fast_vs_steady": 4, "quick_vs_thorough": 3, "hands_on_vs_strategic": 3, "feedback_vs_autonomy": 3, "innovation_vs_process": 4, "flexible_vs_schedule": 3}'::jsonb,
  4, 3, 4, 3, 3, 3, 4, 3
FROM public.jobs j
WHERE j.title = 'Full Stack Developer - React & Node.js'
  AND j.hr_user_id = 'fb151446-8251-46f2-88c9-7eb5b50e498b'
ON CONFLICT (job_id) DO UPDATE SET
  answers = EXCLUDED.answers,
  independent_vs_team = EXCLUDED.independent_vs_team,
  structured_vs_open = EXCLUDED.structured_vs_open,
  fast_vs_steady = EXCLUDED.fast_vs_steady,
  quick_vs_thorough = EXCLUDED.quick_vs_thorough,
  hands_on_vs_strategic = EXCLUDED.hands_on_vs_strategic,
  feedback_vs_autonomy = EXCLUDED.feedback_vs_autonomy,
  innovation_vs_process = EXCLUDED.innovation_vs_process,
  flexible_vs_schedule = EXCLUDED.flexible_vs_schedule;

-- Step 4: Create high-confidence matches (>90%)
-- Replace <MARCUS_CHEN_USER_ID> with Marcus Chen's actual user ID from Supabase Auth
-- Replace <JOB1_ID> and <JOB2_ID> with the actual job IDs

-- Match 1: Senior Frontend Engineer - React Specialist (95% match)
INSERT INTO public.matches (
  applicant_user_id, job_id, overall_score, skills_score, behaviour_score, prefs_score, ai_summary, status
)
SELECT 
  '<MARCUS_CHEN_USER_ID>'::uuid, -- Replace with actual user ID
  j.id,
  95, -- Overall score
  95, -- Skills: React, TypeScript, CSS match perfectly
  90, -- Behaviour: Perfect match
  100, -- Preferences: Perfect match (Senior, Hybrid, salary overlap)
  'Excellent match! The applicant has strong React and TypeScript expertise, perfectly aligning with our requirements. Their Vue.js experience is a valuable bonus. The candidate''s work style matches our team culture, and their preferences for a Senior role with hybrid work mode align perfectly with our offer.',
  'pending'
FROM public.jobs j
WHERE j.title = 'Senior Frontend Engineer - React Specialist'
  AND j.hr_user_id = 'fb151446-8251-46f2-88c9-7eb5b50e498b'
ON CONFLICT (applicant_user_id, job_id) DO UPDATE SET
  overall_score = EXCLUDED.overall_score,
  skills_score = EXCLUDED.skills_score,
  behaviour_score = EXCLUDED.behaviour_score,
  prefs_score = EXCLUDED.prefs_score,
  ai_summary = EXCLUDED.ai_summary,
  updated_at = NOW();

-- Match 2: Full Stack Developer (92% match)
INSERT INTO public.matches (
  applicant_user_id, job_id, overall_score, skills_score, behaviour_score, prefs_score, ai_summary, status
)
SELECT 
  '<MARCUS_CHEN_USER_ID>'::uuid, -- Replace with actual user ID
  j.id,
  92, -- Overall score
  90, -- Skills: React, TypeScript, Node.js, MongoDB, CSS all match
  90, -- Behaviour: Perfect match
  95, -- Preferences: Perfect match
  'Strong match! The applicant possesses all required skills: React, TypeScript, Node.js, and MongoDB. Their full-stack experience makes them an ideal candidate. The candidate''s preferences align well with our role and work arrangements.',
  'pending'
FROM public.jobs j
WHERE j.title = 'Full Stack Developer - React & Node.js'
  AND j.hr_user_id = 'fb151446-8251-46f2-88c9-7eb5b50e498b'
ON CONFLICT (applicant_user_id, job_id) DO UPDATE SET
  overall_score = EXCLUDED.overall_score,
  skills_score = EXCLUDED.skills_score,
  behaviour_score = EXCLUDED.behaviour_score,
  prefs_score = EXCLUDED.prefs_score,
  ai_summary = EXCLUDED.ai_summary,
  updated_at = NOW();

