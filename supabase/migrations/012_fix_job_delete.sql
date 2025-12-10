-- Create RPC function to delete a job (bypasses RLS)

DROP FUNCTION IF EXISTS public.delete_job(p_job_id UUID, p_hr_user_id UUID);
CREATE OR REPLACE FUNCTION public.delete_job(p_job_id UUID, p_hr_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_job_exists BOOLEAN;
BEGIN
    -- Verify job exists and belongs to HR user
    SELECT EXISTS(
        SELECT 1 FROM jobs 
        WHERE id = p_job_id AND hr_user_id = p_hr_user_id
    ) INTO v_job_exists;
    
    IF NOT v_job_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Delete job (cascade will handle related records)
    DELETE FROM jobs WHERE id = p_job_id;
    
    RETURN TRUE;
END;
$$;

