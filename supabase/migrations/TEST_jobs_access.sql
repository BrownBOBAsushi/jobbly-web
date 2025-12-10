-- TEST: Check if service role can read jobs
-- Run this first to verify the fix works

-- First, let's see what policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('jobs', 'job_preferences', 'job_behaviour', 'matches')
ORDER BY tablename, policyname;

-- Then try to read jobs (this should work after running 003_quick_fix_jobs_rls.sql)
-- Note: This query will only work if you're using the service role key
-- In Supabase SQL Editor, you're already using service role, so it should work

