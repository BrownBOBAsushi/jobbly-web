-- Fix RLS for job_preferences table
-- Create RPC function for job preferences insert/update (bypasses RLS)

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.insert_or_update_job_preferences(
    p_job_id UUID,
    p_role_level TEXT,
    p_salary_min INTEGER,
    p_salary_max INTEGER,
    p_mode_of_work TEXT
);

-- Create function to insert/update job preferences (bypasses RLS)
CREATE OR REPLACE FUNCTION public.insert_or_update_job_preferences(
    p_job_id UUID,
    p_role_level TEXT DEFAULT NULL,
    p_salary_min INTEGER DEFAULT NULL,
    p_salary_max INTEGER DEFAULT NULL,
    p_mode_of_work TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_pref_id UUID;
BEGIN
    -- Check if preferences exist
    SELECT id INTO v_pref_id
    FROM public.job_preferences
    WHERE job_id = p_job_id;
    
    IF v_pref_id IS NOT NULL THEN
        -- Update existing preferences
        UPDATE public.job_preferences
        SET 
            role_level = COALESCE(p_role_level, role_level),
            salary_min = COALESCE(p_salary_min, salary_min),
            salary_max = COALESCE(p_salary_max, salary_max),
            mode_of_work = COALESCE(p_mode_of_work, mode_of_work),
            updated_at = NOW()
        WHERE id = v_pref_id;
        RETURN v_pref_id;
    ELSE
        -- Insert new preferences
        INSERT INTO public.job_preferences (
            job_id,
            role_level,
            salary_min,
            salary_max,
            mode_of_work
        )
        VALUES (
            p_job_id,
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

-- Also add policies to allow service role (backup)
DROP POLICY IF EXISTS "Service role can manage job preferences" ON public.job_preferences;
CREATE POLICY "Service role can manage job preferences"
    ON public.job_preferences FOR ALL
    USING (auth.uid() IS NULL)
    WITH CHECK (auth.uid() IS NULL);

