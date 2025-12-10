-- Diagnostic script to check database state
-- Run this FIRST to see what's wrong

-- Check if jobs table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'jobs'
) AS jobs_table_exists;

-- Check jobs table structure if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'jobs'
ORDER BY ordinal_position;

-- Check if there are any existing policies on jobs table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'jobs';

