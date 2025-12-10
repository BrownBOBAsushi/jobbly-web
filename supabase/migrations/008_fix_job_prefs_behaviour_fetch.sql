-- Create RPC functions to fetch job preferences and behaviour (bypasses RLS)

-- Function to get job preferences by job_id
DROP FUNCTION IF EXISTS public.get_job_preferences(p_job_id UUID);
CREATE OR REPLACE FUNCTION public.get_job_preferences(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_prefs JSONB;
BEGIN
    SELECT row_to_json(jp.*)::jsonb INTO v_prefs
    FROM public.job_preferences jp
    WHERE jp.job_id = p_job_id;
    
    RETURN v_prefs;
END;
$$;

-- Function to get job behaviour by job_id
DROP FUNCTION IF EXISTS public.get_job_behaviour(p_job_id UUID);
CREATE OR REPLACE FUNCTION public.get_job_behaviour(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_behaviour JSONB;
BEGIN
    SELECT row_to_json(jb.*)::jsonb INTO v_behaviour
    FROM public.job_behaviour jb
    WHERE jb.job_id = p_job_id;
    
    RETURN v_behaviour;
END;
$$;

