-- Fix RLS for jobs table to allow service role inserts
-- Create RPC function for job creation (bypasses RLS)

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.insert_job(
    p_hr_user_id UUID,
    p_title TEXT,
    p_jd_text TEXT,
    p_jd_url TEXT,
    p_status TEXT
);

-- Create function to insert jobs (bypasses RLS)
-- Returns the full job object as JSONB
CREATE OR REPLACE FUNCTION public.insert_job(
    p_hr_user_id UUID,
    p_title TEXT,
    p_jd_text TEXT DEFAULT NULL,
    p_jd_url TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'open'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_job JSONB;
BEGIN
    INSERT INTO public.jobs (
        hr_user_id,
        title,
        jd_text,
        jd_url,
        status
    )
    VALUES (
        p_hr_user_id,
        p_title,
        p_jd_text,
        p_jd_url,
        p_status
    )
    RETURNING row_to_json(jobs.*)::jsonb INTO v_job;
    
    RETURN v_job;
END;
$$;

-- Also add a policy to allow service role to insert (backup)
DROP POLICY IF EXISTS "Service role can insert jobs" ON public.jobs;
CREATE POLICY "Service role can insert jobs"
    ON public.jobs FOR INSERT
    WITH CHECK (auth.uid() IS NULL);

-- Also allow service role to update
DROP POLICY IF EXISTS "Service role can update jobs" ON public.jobs;
CREATE POLICY "Service role can update jobs"
    ON public.jobs FOR UPDATE
    USING (auth.uid() IS NULL)
    WITH CHECK (auth.uid() IS NULL);

-- Create function to get job by ID (bypasses RLS)
DROP FUNCTION IF EXISTS public.get_job_by_id(p_job_id UUID);
CREATE OR REPLACE FUNCTION public.get_job_by_id(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_job JSONB;
BEGIN
    SELECT row_to_json(j.*)::jsonb INTO v_job
    FROM public.jobs j
    WHERE j.id = p_job_id;
    
    RETURN v_job;
END;
$$;

