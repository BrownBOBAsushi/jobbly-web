-- Fix RLS for job_behaviour table
-- Create RPC function for job behaviour insert/update (bypasses RLS)

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.insert_or_update_job_behaviour(
    p_job_id UUID,
    p_work_style TEXT,
    p_task_structure TEXT,
    p_environment_pace TEXT,
    p_decision_making TEXT,
    p_role_focus TEXT,
    p_feedback_style TEXT,
    p_innovation_style TEXT,
    p_schedule_type TEXT
);

-- Create function to insert/update job behaviour (bypasses RLS)
CREATE OR REPLACE FUNCTION public.insert_or_update_job_behaviour(
    p_job_id UUID,
    p_work_style TEXT DEFAULT NULL,
    p_task_structure TEXT DEFAULT NULL,
    p_environment_pace TEXT DEFAULT NULL,
    p_decision_making TEXT DEFAULT NULL,
    p_role_focus TEXT DEFAULT NULL,
    p_feedback_style TEXT DEFAULT NULL,
    p_innovation_style TEXT DEFAULT NULL,
    p_schedule_type TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_behaviour_id UUID;
    v_answers JSONB;
BEGIN
    -- Build answers JSONB object
    v_answers := jsonb_build_object(
        'work_style', p_work_style,
        'task_structure', p_task_structure,
        'environment_pace', p_environment_pace,
        'decision_making', p_decision_making,
        'role_focus', p_role_focus,
        'feedback_style', p_feedback_style,
        'innovation_style', p_innovation_style,
        'schedule_type', p_schedule_type
    );
    
    -- Remove NULL values from JSONB
    v_answers := v_answers - 'null';
    
    -- Check if behaviour exists
    SELECT id INTO v_behaviour_id
    FROM public.job_behaviour
    WHERE job_id = p_job_id;
    
    IF v_behaviour_id IS NOT NULL THEN
        -- Update existing behaviour
        UPDATE public.job_behaviour
        SET 
            work_style = COALESCE(p_work_style, work_style),
            task_structure = COALESCE(p_task_structure, task_structure),
            environment_pace = COALESCE(p_environment_pace, environment_pace),
            decision_making = COALESCE(p_decision_making, decision_making),
            role_focus = COALESCE(p_role_focus, role_focus),
            feedback_style = COALESCE(p_feedback_style, feedback_style),
            innovation_style = COALESCE(p_innovation_style, innovation_style),
            schedule_type = COALESCE(p_schedule_type, schedule_type),
            answers = COALESCE(v_answers, answers),
            updated_at = NOW()
        WHERE id = v_behaviour_id;
        RETURN v_behaviour_id;
    ELSE
        -- Insert new behaviour
        INSERT INTO public.job_behaviour (
            job_id,
            work_style,
            task_structure,
            environment_pace,
            decision_making,
            role_focus,
            feedback_style,
            innovation_style,
            schedule_type,
            answers
        )
        VALUES (
            p_job_id,
            p_work_style,
            p_task_structure,
            p_environment_pace,
            p_decision_making,
            p_role_focus,
            p_feedback_style,
            p_innovation_style,
            p_schedule_type,
            v_answers
        )
        RETURNING id INTO v_behaviour_id;
        RETURN v_behaviour_id;
    END IF;
END;
$$;

-- Also add policies to allow service role (backup)
DROP POLICY IF EXISTS "Service role can manage job behaviour" ON public.job_behaviour;
CREATE POLICY "Service role can manage job behaviour"
    ON public.job_behaviour FOR ALL
    USING (auth.uid() IS NULL)
    WITH CHECK (auth.uid() IS NULL);

