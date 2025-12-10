-- Create RPC function to fetch jobs for an HR user (bypasses RLS)

DROP FUNCTION IF EXISTS public.get_hr_jobs(p_hr_user_id UUID);
CREATE OR REPLACE FUNCTION public.get_hr_jobs(p_hr_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', j.id,
            'hr_user_id', j.hr_user_id,
            'title', j.title,
            'jd_text', j.jd_text,
            'jd_url', j.jd_url,
            'status', j.status,
            'created_at', j.created_at,
            'updated_at', j.updated_at,
            'match_count', (
                SELECT COUNT(*)::int
                FROM matches m
                WHERE m.job_id = j.id
            )
        )
        ORDER BY j.created_at DESC
    ) INTO v_result
    FROM jobs j
    WHERE j.hr_user_id = p_hr_user_id;
    
    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

