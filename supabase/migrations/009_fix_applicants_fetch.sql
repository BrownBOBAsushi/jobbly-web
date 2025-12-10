-- Create RPC function to fetch applicants with their profiles, preferences, and behaviour (bypasses RLS)

DROP FUNCTION IF EXISTS public.get_applicants_for_matching();
CREATE OR REPLACE FUNCTION public.get_applicants_for_matching()
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
            'id', u.id,
            'email', u.email,
            'full_name', u.full_name,
            'applicant_profiles', (
                SELECT jsonb_agg(row_to_json(ap.*))
                FROM applicant_profiles ap
                WHERE ap.user_id = u.id
            ),
            'applicant_preferences', (
                SELECT jsonb_agg(row_to_json(apr.*))
                FROM applicant_preferences apr
                WHERE apr.user_id = u.id
            ),
            'applicant_behaviour', (
                SELECT jsonb_agg(row_to_json(ab.*))
                FROM applicant_behaviour ab
                WHERE ab.user_id = u.id
            )
        )
    ) INTO v_result
    FROM users u
    WHERE u.role = 'applicant';
    
    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

