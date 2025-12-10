-- Fix RLS policies to allow service role inserts
-- Service role should bypass RLS, but adding explicit policies as backup

-- Drop ALL existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Applicants can update own profile" ON public.applicant_profiles;
DROP POLICY IF EXISTS "Applicants can view own profile" ON public.applicant_profiles;
DROP POLICY IF EXISTS "Applicants can insert own profile" ON public.applicant_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.applicant_profiles;

-- Create a Postgres function that bypasses RLS for inserts/updates
-- This function runs with SECURITY DEFINER, so it bypasses RLS
CREATE OR REPLACE FUNCTION public.insert_or_update_applicant_profile(
    p_user_id UUID,
    p_resume_url TEXT,
    p_cover_letter_url TEXT,
    p_photo_url TEXT,
    p_skills JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id UUID;
BEGIN
    -- Check if profile exists
    SELECT id INTO v_profile_id
    FROM public.applicant_profiles
    WHERE user_id = p_user_id;
    
    IF v_profile_id IS NOT NULL THEN
        -- Update existing profile
        UPDATE public.applicant_profiles
        SET 
            resume_url = COALESCE(p_resume_url, resume_url),
            cover_letter_url = COALESCE(p_cover_letter_url, cover_letter_url),
            photo_url = COALESCE(p_photo_url, photo_url),
            skills = COALESCE(p_skills, skills),
            updated_at = NOW()
        WHERE id = v_profile_id;
        RETURN v_profile_id;
    ELSE
        -- Insert new profile
        INSERT INTO public.applicant_profiles (
            user_id,
            resume_url,
            cover_letter_url,
            photo_url,
            skills
        )
        VALUES (
            p_user_id,
            p_resume_url,
            p_cover_letter_url,
            p_photo_url,
            p_skills
        )
        RETURNING id INTO v_profile_id;
        RETURN v_profile_id;
    END IF;
END;
$$;

-- Create a function to fetch applicant data (bypasses RLS for SELECT)
CREATE OR REPLACE FUNCTION public.get_applicant_data(p_user_id UUID)
RETURNS TABLE (
    profile JSONB,
    preferences JSONB,
    behaviour JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT row_to_json(p)::jsonb FROM applicant_profiles p WHERE p.user_id = p_user_id) as profile,
        (SELECT row_to_json(pr)::jsonb FROM applicant_preferences pr WHERE pr.user_id = p_user_id) as preferences,
        (SELECT row_to_json(b)::jsonb FROM applicant_behaviour b WHERE b.user_id = p_user_id) as behaviour;
END;
$$;

-- Create a function to fetch open jobs with preferences and behaviour (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_open_jobs_for_matching()
RETURNS TABLE (
    job JSONB,
    job_preferences JSONB,
    job_behaviour JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        row_to_json(j)::jsonb as job,
        (SELECT row_to_json(jp)::jsonb FROM job_preferences jp WHERE jp.job_id = j.id LIMIT 1) as job_preferences,
        (SELECT row_to_json(jb)::jsonb FROM job_behaviour jb WHERE jb.job_id = j.id LIMIT 1) as job_behaviour
    FROM jobs j
    WHERE j.status = 'open';
END;
$$;

-- Create separate policies for different operations
CREATE POLICY "Applicants can insert own profile"
    ON public.applicant_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Applicants can update own profile"
    ON public.applicant_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Applicants can view own profile"
    ON public.applicant_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Allow service role to bypass RLS (service role has NULL auth.uid())
-- This policy allows inserts when auth.uid() is NULL (service role)
CREATE POLICY "Service role can manage profiles"
    ON public.applicant_profiles FOR ALL
    USING (auth.uid() IS NULL OR auth.uid() = user_id)
    WITH CHECK (auth.uid() IS NULL OR auth.uid() = user_id);

-- ============================================================================
-- FIX APPLICANT_PREFERENCES RLS
-- ============================================================================
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Applicants can insert own preferences" ON public.applicant_preferences;
DROP POLICY IF EXISTS "Applicants can update own preferences" ON public.applicant_preferences;
DROP POLICY IF EXISTS "Applicants can view own preferences" ON public.applicant_preferences;
DROP POLICY IF EXISTS "Service role can manage preferences" ON public.applicant_preferences;

-- Create Postgres function for preferences
CREATE OR REPLACE FUNCTION public.insert_or_update_applicant_preferences(
    p_user_id UUID,
    p_target_job_title TEXT,
    p_role_level TEXT,
    p_salary_min INTEGER,
    p_salary_max INTEGER,
    p_mode_of_work TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_pref_id UUID;
BEGIN
    SELECT id INTO v_pref_id
    FROM public.applicant_preferences
    WHERE user_id = p_user_id;
    
    IF v_pref_id IS NOT NULL THEN
        UPDATE public.applicant_preferences
        SET 
            target_job_title = COALESCE(p_target_job_title, target_job_title),
            role_level = COALESCE(p_role_level, role_level),
            salary_min = COALESCE(p_salary_min, salary_min),
            salary_max = COALESCE(p_salary_max, salary_max),
            mode_of_work = COALESCE(p_mode_of_work, mode_of_work),
            updated_at = NOW()
        WHERE id = v_pref_id;
        RETURN v_pref_id;
    ELSE
        INSERT INTO public.applicant_preferences (
            user_id,
            target_job_title,
            role_level,
            salary_min,
            salary_max,
            mode_of_work
        )
        VALUES (
            p_user_id,
            p_target_job_title,
            p_role_level,
            p_salary_min,
            p_salary_max,
            p_mode_of_work
        )
        RETURNING id INTO v_pref_id;
        RETURN v_pref_id;
    END IF;
END;
$$;

-- Create policies
CREATE POLICY "Applicants can insert own preferences"
    ON public.applicant_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Applicants can update own preferences"
    ON public.applicant_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Applicants can view own preferences"
    ON public.applicant_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage preferences"
    ON public.applicant_preferences FOR ALL
    USING (auth.uid() IS NULL OR auth.uid() = user_id)
    WITH CHECK (auth.uid() IS NULL OR auth.uid() = user_id);

-- ============================================================================
-- FIX APPLICANT_BEHAVIOUR RLS
-- ============================================================================
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Applicants can insert own behaviour" ON public.applicant_behaviour;
DROP POLICY IF EXISTS "Applicants can update own behaviour" ON public.applicant_behaviour;
DROP POLICY IF EXISTS "Applicants can view own behaviour" ON public.applicant_behaviour;
DROP POLICY IF EXISTS "Service role can manage behaviour" ON public.applicant_behaviour;

-- Create Postgres function for behaviour
CREATE OR REPLACE FUNCTION public.insert_or_update_applicant_behaviour(
    p_user_id UUID,
    p_answers JSONB,
    p_independent_vs_team INTEGER DEFAULT NULL,
    p_structured_vs_open INTEGER DEFAULT NULL,
    p_fast_vs_steady INTEGER DEFAULT NULL,
    p_quick_vs_thorough INTEGER DEFAULT NULL,
    p_hands_on_vs_strategic INTEGER DEFAULT NULL,
    p_feedback_vs_autonomy INTEGER DEFAULT NULL,
    p_innovation_vs_process INTEGER DEFAULT NULL,
    p_flexible_vs_schedule INTEGER DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_behaviour_id UUID;
BEGIN
    SELECT id INTO v_behaviour_id
    FROM public.applicant_behaviour
    WHERE user_id = p_user_id;
    
    IF v_behaviour_id IS NOT NULL THEN
        UPDATE public.applicant_behaviour
        SET 
            answers = COALESCE(p_answers, answers),
            independent_vs_team = COALESCE(p_independent_vs_team, independent_vs_team),
            structured_vs_open = COALESCE(p_structured_vs_open, structured_vs_open),
            fast_vs_steady = COALESCE(p_fast_vs_steady, fast_vs_steady),
            quick_vs_thorough = COALESCE(p_quick_vs_thorough, quick_vs_thorough),
            hands_on_vs_strategic = COALESCE(p_hands_on_vs_strategic, hands_on_vs_strategic),
            feedback_vs_autonomy = COALESCE(p_feedback_vs_autonomy, feedback_vs_autonomy),
            innovation_vs_process = COALESCE(p_innovation_vs_process, innovation_vs_process),
            flexible_vs_schedule = COALESCE(p_flexible_vs_schedule, flexible_vs_schedule),
            updated_at = NOW()
        WHERE id = v_behaviour_id;
        RETURN v_behaviour_id;
    ELSE
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
        )
        VALUES (
            p_user_id,
            p_answers,
            p_independent_vs_team,
            p_structured_vs_open,
            p_fast_vs_steady,
            p_quick_vs_thorough,
            p_hands_on_vs_strategic,
            p_feedback_vs_autonomy,
            p_innovation_vs_process,
            p_flexible_vs_schedule
        )
        RETURNING id INTO v_behaviour_id;
        RETURN v_behaviour_id;
    END IF;
END;
$$;

-- Create policies
CREATE POLICY "Applicants can insert own behaviour"
    ON public.applicant_behaviour FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Applicants can update own behaviour"
    ON public.applicant_behaviour FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Applicants can view own behaviour"
    ON public.applicant_behaviour FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage behaviour"
    ON public.applicant_behaviour FOR ALL
    USING (auth.uid() IS NULL OR auth.uid() = user_id)
    WITH CHECK (auth.uid() IS NULL OR auth.uid() = user_id);

-- ============================================================================
-- FIX JOBS, JOB_PREFERENCES, JOB_BEHAVIOUR, AND MATCHES RLS
-- Allow service role to read these tables for matching
-- ============================================================================

-- Drop existing policies for jobs
DROP POLICY IF EXISTS "HR can view own jobs" ON public.jobs;
DROP POLICY IF EXISTS "HR can manage own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Service role can read jobs" ON public.jobs;

-- Recreate HR policies and add service role policy
CREATE POLICY "HR can view own jobs"
    ON public.jobs FOR SELECT
    USING (auth.uid() = hr_user_id);

CREATE POLICY "HR can manage own jobs"
    ON public.jobs FOR ALL
    USING (auth.uid() = hr_user_id)
    WITH CHECK (auth.uid() = hr_user_id);

-- Allow service role to read jobs (for matching)
CREATE POLICY "Service role can read jobs"
    ON public.jobs FOR SELECT
    USING (auth.uid() IS NULL);

-- Drop and recreate job_preferences policies
DROP POLICY IF EXISTS "HR can view own job preferences" ON public.job_preferences;
DROP POLICY IF EXISTS "HR can update own job preferences" ON public.job_preferences;
DROP POLICY IF EXISTS "Service role can read job preferences" ON public.job_preferences;

CREATE POLICY "HR can view own job preferences"
    ON public.job_preferences FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = job_preferences.job_id AND jobs.hr_user_id = auth.uid()
    ));

CREATE POLICY "HR can update own job preferences"
    ON public.job_preferences FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = job_preferences.job_id AND jobs.hr_user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = job_preferences.job_id AND jobs.hr_user_id = auth.uid()
    ));

CREATE POLICY "Service role can read job preferences"
    ON public.job_preferences FOR SELECT
    USING (auth.uid() IS NULL);

-- Drop and recreate job_behaviour policies
DROP POLICY IF EXISTS "HR can view own job behaviour" ON public.job_behaviour;
DROP POLICY IF EXISTS "HR can update own job behaviour" ON public.job_behaviour;
DROP POLICY IF EXISTS "Service role can read job behaviour" ON public.job_behaviour;

CREATE POLICY "HR can view own job behaviour"
    ON public.job_behaviour FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = job_behaviour.job_id AND jobs.hr_user_id = auth.uid()
    ));

CREATE POLICY "HR can update own job behaviour"
    ON public.job_behaviour FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = job_behaviour.job_id AND jobs.hr_user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = job_behaviour.job_id AND jobs.hr_user_id = auth.uid()
    ));

CREATE POLICY "Service role can read job behaviour"
    ON public.job_behaviour FOR SELECT
    USING (auth.uid() IS NULL);

-- Drop and recreate matches policies
DROP POLICY IF EXISTS "Applicants can view own matches" ON public.matches;
DROP POLICY IF EXISTS "HR can view matches for own jobs" ON public.matches;
DROP POLICY IF EXISTS "HR can update matches for own jobs" ON public.matches;
DROP POLICY IF EXISTS "Service role can manage matches" ON public.matches;

CREATE POLICY "Applicants can view own matches"
    ON public.matches FOR SELECT
    USING (auth.uid() = applicant_user_id);

CREATE POLICY "HR can view matches for own jobs"
    ON public.matches FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = matches.job_id AND jobs.hr_user_id = auth.uid()
    ));

CREATE POLICY "HR can update matches for own jobs"
    ON public.matches FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = matches.job_id AND jobs.hr_user_id = auth.uid()
    ));

-- Allow service role to insert/update matches (for matching engine)
CREATE POLICY "Service role can manage matches"
    ON public.matches FOR ALL
    USING (auth.uid() IS NULL)
    WITH CHECK (auth.uid() IS NULL);

-- Create RPC function to fetch matches for an applicant (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_applicant_matches(p_user_id UUID)
RETURNS TABLE (
    match_id UUID,
    overall_score INTEGER,
    skills_score INTEGER,
    behaviour_score INTEGER,
    prefs_score INTEGER,
    ai_summary TEXT,
    status TEXT,
    interview_scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    job JSONB,
    job_preferences JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as match_id,
        m.overall_score,
        m.skills_score,
        m.behaviour_score,
        m.prefs_score,
        m.ai_summary,
        m.status,
        m.interview_scheduled_at,
        m.created_at,
        (SELECT row_to_json(j)::jsonb FROM jobs j WHERE j.id = m.job_id) as job,
        (SELECT row_to_json(jp)::jsonb FROM job_preferences jp WHERE jp.job_id = m.job_id LIMIT 1) as job_preferences
    FROM matches m
    WHERE m.applicant_user_id = p_user_id
    ORDER BY m.overall_score DESC;
END;
$$;

-- Create RPC function to insert/update matches (bypasses RLS)
CREATE OR REPLACE FUNCTION public.insert_or_update_match(
    p_applicant_user_id UUID,
    p_job_id UUID,
    p_overall_score INTEGER,
    p_skills_score INTEGER,
    p_behaviour_score INTEGER,
    p_prefs_score INTEGER,
    p_ai_summary TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'pending'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_match_id UUID;
BEGIN
    -- Check if match exists
    SELECT id INTO v_match_id
    FROM public.matches
    WHERE applicant_user_id = p_applicant_user_id
      AND job_id = p_job_id;
    
    IF v_match_id IS NOT NULL THEN
        -- Update existing match
        UPDATE public.matches
        SET 
            overall_score = p_overall_score,
            skills_score = p_skills_score,
            behaviour_score = p_behaviour_score,
            prefs_score = p_prefs_score,
            ai_summary = COALESCE(p_ai_summary, ai_summary),
            status = p_status,
            updated_at = NOW()
        WHERE id = v_match_id;
        RETURN v_match_id;
    ELSE
        -- Insert new match
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
        VALUES (
            p_applicant_user_id,
            p_job_id,
            p_overall_score,
            p_skills_score,
            p_behaviour_score,
            p_prefs_score,
            p_ai_summary,
            p_status
        )
        RETURNING id INTO v_match_id;
        RETURN v_match_id;
    END IF;
END;
$$;

