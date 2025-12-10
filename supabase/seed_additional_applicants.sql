-- Additional Applicants Seed Data
-- This file adds more applicants with varying match scores for demo purposes
-- Run this after the main seed.sql file

-- ============================================================================
-- ADDITIONAL APPLICANTS (High Confidence Match)
-- ============================================================================

-- High Confidence Applicant (85%+ match for Senior Frontend Engineer)
-- This applicant has perfect alignment with the job requirements
INSERT INTO public.users (id, email, role, full_name)
VALUES 
  ('8691408e-716b-4146-a893-7eb1375f1eb9', 'sarah.chen@demo.com', 'applicant', 'Sarah Chen'),
  ('1c381cde-0a6c-4cc8-99de-d83f1910451a', 'mike.johnson@demo.com', 'applicant', 'Mike Johnson'),
  ('da129e66-6d8b-42ae-a7cd-13b4e3f8fea9', 'emily.davis@demo.com', 'applicant', 'Emily Davis'),
  ('6e67eb97-cf73-4154-b438-fdd35daeaeca', 'david.wilson@demo.com', 'applicant', 'David Wilson'),
  ('e5e233ce-99cb-45f2-a5a1-d1b1ff6d7d2e', 'lisa.anderson@demo.com', 'applicant', 'Lisa Anderson')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

-- Sarah Chen - HIGH CONFIDENCE MATCH (85%+ for Senior Frontend Engineer)
-- Skills: React, TypeScript, Next.js (perfect match - 100% skills score)
-- Role: Senior (matches - 40 points)
-- Salary: 6500-8500 (overlaps with 6000-9000 - 100% overlap = 30 points)
-- Work mode: Hybrid (matches - 30 points)
-- Behaviour: Perfect alignment - Team(5), Structured(2), Fast(2), Thorough(5), Hands-on(2), Frequent(2), Innovation(2), Flexible(2)
-- Expected Overall Score: ~85-95%
INSERT INTO public.applicant_profiles (
  user_id, resume_url, cover_letter_url, photo_url, skills
) VALUES (
  '8691408e-716b-4146-a893-7eb1375f1eb9',
  'https://example.com/resumes/sarah-chen-resume.pdf',
  'https://example.com/resumes/sarah-chen-cover-letter.pdf',
  'https://example.com/photos/sarah-chen.jpg',
  '["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "GraphQL", "Jest"]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
  resume_url = EXCLUDED.resume_url,
  cover_letter_url = EXCLUDED.cover_letter_url,
  photo_url = EXCLUDED.photo_url,
  skills = EXCLUDED.skills;

INSERT INTO public.applicant_preferences (
  user_id, target_job_title, role_level, salary_min, salary_max, mode_of_work
) VALUES (
  '8691408e-716b-4146-a893-7eb1375f1eb9',
  'Senior Frontend Engineer',
  'Senior',
  6500,
  8500,
  'Hybrid'
) ON CONFLICT (user_id) DO UPDATE SET
  target_job_title = EXCLUDED.target_job_title,
  role_level = EXCLUDED.role_level,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  mode_of_work = EXCLUDED.mode_of_work;

INSERT INTO public.applicant_behaviour (
  user_id, answers, independent_vs_team, structured_vs_open, fast_vs_steady,
  quick_vs_thorough, hands_on_vs_strategic, feedback_vs_autonomy,
  innovation_vs_process, flexible_vs_schedule
) VALUES (
  '8691408e-716b-4146-a893-7eb1375f1eb9',
  '{"independent_vs_team": 5, "structured_vs_open": 2, "fast_vs_steady": 2, "quick_vs_thorough": 5, "hands_on_vs_strategic": 2, "feedback_vs_autonomy": 2, "innovation_vs_process": 2, "flexible_vs_schedule": 2}'::jsonb,
  5, 2, 2, 5, 2, 2, 2, 2
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

-- Mike Johnson - MEDIUM-HIGH MATCH (70-80%)
-- Skills: React, TypeScript (good match, missing Next.js)
-- Role: Senior (matches)
-- Salary: 7000-9000 (overlaps)
-- Work mode: Hybrid (matches)
-- Behaviour: Mostly aligned
INSERT INTO public.applicant_profiles (
  user_id, resume_url, cover_letter_url, photo_url, skills
) VALUES (
  '1c381cde-0a6c-4cc8-99de-d83f1910451a',
  'https://example.com/resumes/mike-johnson-resume.pdf',
  'https://example.com/resumes/mike-johnson-cover-letter.pdf',
  'https://example.com/photos/mike-johnson.jpg',
  '["React", "TypeScript", "Vue.js", "Node.js", "MongoDB", "CSS"]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
  resume_url = EXCLUDED.resume_url,
  cover_letter_url = EXCLUDED.cover_letter_url,
  photo_url = EXCLUDED.photo_url,
  skills = EXCLUDED.skills;

INSERT INTO public.applicant_preferences (
  user_id, target_job_title, role_level, salary_min, salary_max, mode_of_work
) VALUES (
  '1c381cde-0a6c-4cc8-99de-d83f1910451a',
  'Frontend Engineer',
  'Senior',
  7000,
  9000,
  'Hybrid'
) ON CONFLICT (user_id) DO UPDATE SET
  target_job_title = EXCLUDED.target_job_title,
  role_level = EXCLUDED.role_level,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  mode_of_work = EXCLUDED.mode_of_work;

INSERT INTO public.applicant_behaviour (
  user_id, answers, independent_vs_team, structured_vs_open, fast_vs_steady,
  quick_vs_thorough, hands_on_vs_strategic, feedback_vs_autonomy,
  innovation_vs_process, flexible_vs_schedule
) VALUES (
  '1c381cde-0a6c-4cc8-99de-d83f1910451a',
  '{"independent_vs_team": 4, "structured_vs_open": 4, "fast_vs_steady": 4, "quick_vs_thorough": 4, "hands_on_vs_strategic": 4, "feedback_vs_autonomy": 4, "innovation_vs_process": 4, "flexible_vs_schedule": 4}'::jsonb,
  4, 4, 4, 4, 4, 4, 4, 4
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

-- Emily Davis - MEDIUM MATCH (50-60%)
-- Skills: React (partial match)
-- Role: Junior (doesn't match Senior)
-- Salary: 4000-6000 (partial overlap)
-- Work mode: On site (doesn't match Hybrid)
-- Behaviour: Somewhat aligned
INSERT INTO public.applicant_profiles (
  user_id, resume_url, cover_letter_url, photo_url, skills
) VALUES (
  'da129e66-6d8b-42ae-a7cd-13b4e3f8fea9',
  'https://example.com/resumes/emily-davis-resume.pdf',
  'https://example.com/resumes/emily-davis-cover-letter.pdf',
  'https://example.com/photos/emily-davis.jpg',
  '["React", "JavaScript", "HTML", "CSS", "Bootstrap"]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
  resume_url = EXCLUDED.resume_url,
  cover_letter_url = EXCLUDED.cover_letter_url,
  photo_url = EXCLUDED.photo_url,
  skills = EXCLUDED.skills;

INSERT INTO public.applicant_preferences (
  user_id, target_job_title, role_level, salary_min, salary_max, mode_of_work
) VALUES (
  'da129e66-6d8b-42ae-a7cd-13b4e3f8fea9',
  'Frontend Developer',
  'Junior',
  4000,
  6000,
  'On site'
) ON CONFLICT (user_id) DO UPDATE SET
  target_job_title = EXCLUDED.target_job_title,
  role_level = EXCLUDED.role_level,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  mode_of_work = EXCLUDED.mode_of_work;

INSERT INTO public.applicant_behaviour (
  user_id, answers, independent_vs_team, structured_vs_open, fast_vs_steady,
  quick_vs_thorough, hands_on_vs_strategic, feedback_vs_autonomy,
  innovation_vs_process, flexible_vs_schedule
) VALUES (
  'da129e66-6d8b-42ae-a7cd-13b4e3f8fea9',
  '{"independent_vs_team": 3, "structured_vs_open": 3, "fast_vs_steady": 3, "quick_vs_thorough": 3, "hands_on_vs_strategic": 3, "feedback_vs_autonomy": 3, "innovation_vs_process": 3, "flexible_vs_schedule": 3}'::jsonb,
  3, 3, 3, 3, 3, 3, 3, 3
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

-- David Wilson - LOW-MEDIUM MATCH (30-40%)
-- Skills: Angular, Java (different stack)
-- Role: Senior (matches)
-- Salary: 8000-10000 (overlaps)
-- Work mode: Remote (doesn't match Hybrid)
-- Behaviour: Different preferences
INSERT INTO public.applicant_profiles (
  user_id, resume_url, cover_letter_url, photo_url, skills
) VALUES (
  '6e67eb97-cf73-4154-b438-fdd35daeaeca',
  'https://example.com/resumes/david-wilson-resume.pdf',
  'https://example.com/resumes/david-wilson-cover-letter.pdf',
  'https://example.com/photos/david-wilson.jpg',
  '["Angular", "Java", "Spring Boot", "MySQL", "Docker"]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
  resume_url = EXCLUDED.resume_url,
  cover_letter_url = EXCLUDED.cover_letter_url,
  photo_url = EXCLUDED.photo_url,
  skills = EXCLUDED.skills;

INSERT INTO public.applicant_preferences (
  user_id, target_job_title, role_level, salary_min, salary_max, mode_of_work
) VALUES (
  '6e67eb97-cf73-4154-b438-fdd35daeaeca',
  'Backend Engineer',
  'Senior',
  8000,
  10000,
  'Work from Home'
) ON CONFLICT (user_id) DO UPDATE SET
  target_job_title = EXCLUDED.target_job_title,
  role_level = EXCLUDED.role_level,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  mode_of_work = EXCLUDED.mode_of_work;

INSERT INTO public.applicant_behaviour (
  user_id, answers, independent_vs_team, structured_vs_open, fast_vs_steady,
  quick_vs_thorough, hands_on_vs_strategic, feedback_vs_autonomy,
  innovation_vs_process, flexible_vs_schedule
) VALUES (
  '6e67eb97-cf73-4154-b438-fdd35daeaeca',
  '{"independent_vs_team": 2, "structured_vs_open": 2, "fast_vs_steady": 2, "quick_vs_thorough": 2, "hands_on_vs_strategic": 2, "feedback_vs_autonomy": 2, "innovation_vs_process": 2, "flexible_vs_schedule": 2}'::jsonb,
  2, 2, 2, 2, 2, 2, 2, 2
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

-- Lisa Anderson - HIGH CONFIDENCE MATCH (80%+ for Senior Frontend Engineer)
-- Skills: React, TypeScript, Next.js (perfect match - 100% skills score)
-- Role: Senior (matches - 40 points)
-- Salary: 6000-8000 (overlaps with 6000-9000 - 100% overlap = 30 points)
-- Work mode: Hybrid (matches - 30 points)
-- Behaviour: Perfect alignment - Team(5), Structured(1), Fast(1), Thorough(5), Hands-on(1), Frequent(1), Innovation(1), Flexible(1)
-- Expected Overall Score: ~85-95%
INSERT INTO public.applicant_profiles (
  user_id, resume_url, cover_letter_url, photo_url, skills
) VALUES (
  'e5e233ce-99cb-45f2-a5a1-d1b1ff6d7d2e',
  'https://example.com/resumes/lisa-anderson-resume.pdf',
  'https://example.com/resumes/lisa-anderson-cover-letter.pdf',
  'https://example.com/photos/lisa-anderson.jpg',
  '["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "Redux", "Testing Library"]'::jsonb
) ON CONFLICT (user_id) DO UPDATE SET
  resume_url = EXCLUDED.resume_url,
  cover_letter_url = EXCLUDED.cover_letter_url,
  photo_url = EXCLUDED.photo_url,
  skills = EXCLUDED.skills;

INSERT INTO public.applicant_preferences (
  user_id, target_job_title, role_level, salary_min, salary_max, mode_of_work
) VALUES (
  'e5e233ce-99cb-45f2-a5a1-d1b1ff6d7d2e',
  'Senior Frontend Engineer',
  'Senior',
  6000,
  8000,
  'Hybrid'
) ON CONFLICT (user_id) DO UPDATE SET
  target_job_title = EXCLUDED.target_job_title,
  role_level = EXCLUDED.role_level,
  salary_min = EXCLUDED.salary_min,
  salary_max = EXCLUDED.salary_max,
  mode_of_work = EXCLUDED.mode_of_work;

INSERT INTO public.applicant_behaviour (
  user_id, answers, independent_vs_team, structured_vs_open, fast_vs_steady,
  quick_vs_thorough, hands_on_vs_strategic, feedback_vs_autonomy,
  innovation_vs_process, flexible_vs_schedule
) VALUES (
  'e5e233ce-99cb-45f2-a5a1-d1b1ff6d7d2e',
  '{"independent_vs_team": 5, "structured_vs_open": 1, "fast_vs_steady": 1, "quick_vs_thorough": 5, "hands_on_vs_strategic": 1, "feedback_vs_autonomy": 1, "innovation_vs_process": 1, "flexible_vs_schedule": 1}'::jsonb,
  5, 1, 1, 5, 1, 1, 1, 1
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

