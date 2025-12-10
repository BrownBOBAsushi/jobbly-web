-- Create RPC function to fetch matches for a job with applicant details (bypasses RLS)

DROP FUNCTION IF EXISTS public.get_job_matches(p_job_id UUID);
CREATE OR REPLACE FUNCTION public.get_job_matches(p_job_id UUID)
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
            'id', m.id,
            'overall_score', m.overall_score,
            'skills_score', m.skills_score,
            'behaviour_score', m.behaviour_score,
            'prefs_score', m.prefs_score,
            'ai_summary', m.ai_summary,
            'status', m.status,
            'interview_scheduled_at', m.interview_scheduled_at,
            'created_at', m.created_at,
            'applicant_user', (
                SELECT row_to_json(u.*)
                FROM users u
                WHERE u.id = m.applicant_user_id
            ),
            'applicant_profile', (
                SELECT row_to_json(ap.*)
                FROM applicant_profiles ap
                WHERE ap.user_id = m.applicant_user_id
                LIMIT 1
            ),
            'applicant_preferences', (
                SELECT row_to_json(apr.*)
                FROM applicant_preferences apr
                WHERE apr.user_id = m.applicant_user_id
                LIMIT 1
            )
        )
        ORDER BY m.overall_score DESC
    ) INTO v_result
    FROM matches m
    WHERE m.job_id = p_job_id;
    
    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

