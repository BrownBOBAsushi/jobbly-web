-- Quick fix: Allow service role to read jobs, job_preferences, job_behaviour, and manage matches
-- This is a subset of 002_fix_rls_policies.sql for quick testing

-- Jobs table
DROP POLICY IF EXISTS "Service role can read jobs" ON public.jobs;
CREATE POLICY "Service role can read jobs"
    ON public.jobs FOR SELECT
    USING (auth.uid() IS NULL);

-- Job preferences table
DROP POLICY IF EXISTS "Service role can read job preferences" ON public.job_preferences;
CREATE POLICY "Service role can read job preferences"
    ON public.job_preferences FOR SELECT
    USING (auth.uid() IS NULL);

-- Job behaviour table
DROP POLICY IF EXISTS "Service role can read job behaviour" ON public.job_behaviour;
CREATE POLICY "Service role can read job behaviour"
    ON public.job_behaviour FOR SELECT
    USING (auth.uid() IS NULL);

-- Matches table
DROP POLICY IF EXISTS "Service role can manage matches" ON public.matches;
CREATE POLICY "Service role can manage matches"
    ON public.matches FOR ALL
    USING (auth.uid() IS NULL)
    WITH CHECK (auth.uid() IS NULL);

