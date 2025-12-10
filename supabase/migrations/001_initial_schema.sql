-- SwiftJobs Database Schema
-- This migration creates all tables needed for the matching platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE (extends auth.users)
-- ============================================================================
-- This table stores additional user information beyond Supabase auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('applicant', 'hr')),
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================================================
-- APPLICANT PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.applicant_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    resume_url TEXT,
    cover_letter_url TEXT,
    photo_url TEXT,
    skills JSONB DEFAULT '[]'::jsonb, -- Array of skill strings extracted by Groq
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_applicant_profiles_user_id ON public.applicant_profiles(user_id);

-- ============================================================================
-- APPLICANT PREFERENCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.applicant_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_job_title TEXT,
    role_level TEXT CHECK (role_level IN ('Intern', 'Junior', 'Senior', 'Lead')),
    salary_min INTEGER,
    salary_max INTEGER,
    mode_of_work TEXT CHECK (mode_of_work IN ('Work from Home', 'On site', 'Hybrid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_applicant_preferences_user_id ON public.applicant_preferences(user_id);

-- ============================================================================
-- APPLICANT BEHAVIOUR (8-question quiz answers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.applicant_behaviour (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    -- Store all 8 answers as JSONB for flexibility
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Individual columns for easier querying (optional, but helpful)
    independent_vs_team INTEGER CHECK (independent_vs_team BETWEEN 1 AND 5),
    structured_vs_open INTEGER CHECK (structured_vs_open BETWEEN 1 AND 5),
    fast_vs_steady INTEGER CHECK (fast_vs_steady BETWEEN 1 AND 5),
    quick_vs_thorough INTEGER CHECK (quick_vs_thorough BETWEEN 1 AND 5),
    hands_on_vs_strategic INTEGER CHECK (hands_on_vs_strategic BETWEEN 1 AND 5),
    feedback_vs_autonomy INTEGER CHECK (feedback_vs_autonomy BETWEEN 1 AND 5),
    innovation_vs_process INTEGER CHECK (innovation_vs_process BETWEEN 1 AND 5),
    flexible_vs_schedule INTEGER CHECK (flexible_vs_schedule BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_applicant_behaviour_user_id ON public.applicant_behaviour(user_id);

-- ============================================================================
-- JOBS (HR job postings)
-- ============================================================================
-- Drop table if exists to avoid conflicts (comment out if you have existing data)
-- DROP TABLE IF EXISTS public.job_preferences CASCADE;
-- DROP TABLE IF EXISTS public.job_behaviour CASCADE;
-- DROP TABLE IF EXISTS public.matches CASCADE;
-- DROP TABLE IF EXISTS public.jobs CASCADE;

CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hr_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    jd_text TEXT, -- Job description text (if entered directly)
    jd_url TEXT, -- Job description file URL (if uploaded)
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_hr_user_id ON public.jobs(hr_user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);

-- ============================================================================
-- JOB PREFERENCES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.job_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    role_level TEXT CHECK (role_level IN ('Intern', 'Junior', 'Senior', 'Lead')),
    salary_min INTEGER,
    salary_max INTEGER,
    mode_of_work TEXT CHECK (mode_of_work IN ('Work from Home', 'On site', 'Hybrid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_preferences_job_id ON public.job_preferences(job_id);

-- ============================================================================
-- JOB BEHAVIOUR (8-question desired candidate profile)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.job_behaviour (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    -- Store all 8 answers as JSONB
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Individual columns matching applicant_behaviour structure
    work_style TEXT, -- Independent vs Team
    task_structure TEXT, -- Structured vs Open-ended
    environment_pace TEXT, -- Fast-paced vs Steady
    decision_making TEXT, -- Quick vs Thorough
    role_focus TEXT, -- Hands-on vs Strategic
    feedback_style TEXT, -- Frequent vs Autonomy
    innovation_style TEXT, -- Innovation vs Process
    schedule_type TEXT, -- Flexible vs Set
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_behaviour_job_id ON public.job_behaviour(job_id);

-- ============================================================================
-- MATCHES (Applicant-Job matching results)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    applicant_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    skills_score INTEGER NOT NULL CHECK (skills_score BETWEEN 0 AND 100),
    behaviour_score INTEGER NOT NULL CHECK (behaviour_score BETWEEN 0 AND 100),
    prefs_score INTEGER NOT NULL CHECK (prefs_score BETWEEN 0 AND 100),
    ai_summary TEXT, -- Generated by Groq
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'interview_scheduled', 'rejected', 'accepted')),
    interview_scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(applicant_user_id, job_id) -- One match per applicant-job pair
);

CREATE INDEX IF NOT EXISTS idx_matches_applicant_user_id ON public.matches(applicant_user_id);
CREATE INDEX IF NOT EXISTS idx_matches_job_id ON public.matches(job_id);
CREATE INDEX IF NOT EXISTS idx_matches_overall_score ON public.matches(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicant_behaviour ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_behaviour ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Applicants can view own profile"
    ON public.applicant_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Applicants can update own profile"
    ON public.applicant_profiles FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Applicants can view own preferences"
    ON public.applicant_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Applicants can update own preferences"
    ON public.applicant_preferences FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Applicants can view own behaviour"
    ON public.applicant_behaviour FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Applicants can update own behaviour"
    ON public.applicant_behaviour FOR ALL
    USING (auth.uid() = user_id);

-- HR can view and manage their own jobs
CREATE POLICY "HR can view own jobs"
    ON public.jobs FOR SELECT
    USING (auth.uid() = hr_user_id);

CREATE POLICY "HR can manage own jobs"
    ON public.jobs FOR ALL
    USING (auth.uid() = hr_user_id);

CREATE POLICY "HR can view own job preferences"
    ON public.job_preferences FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = job_preferences.job_id AND jobs.hr_user_id = auth.uid()
    ));

CREATE POLICY "HR can update own job preferences"
    ON public.job_preferences FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = job_preferences.job_id AND jobs.hr_user_id = auth.uid()
    ));

CREATE POLICY "HR can view own job behaviour"
    ON public.job_behaviour FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = job_behaviour.job_id AND jobs.hr_user_id = auth.uid()
    ));

CREATE POLICY "HR can update own job behaviour"
    ON public.job_behaviour FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.jobs WHERE jobs.id = job_behaviour.job_id AND jobs.hr_user_id = auth.uid()
    ));

-- Matches: Applicants can view their own matches, HR can view matches for their jobs
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

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicant_profiles_updated_at BEFORE UPDATE ON public.applicant_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicant_preferences_updated_at BEFORE UPDATE ON public.applicant_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicant_behaviour_updated_at BEFORE UPDATE ON public.applicant_behaviour
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_preferences_updated_at BEFORE UPDATE ON public.job_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_behaviour_updated_at BEFORE UPDATE ON public.job_behaviour
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'applicant'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on auth signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

