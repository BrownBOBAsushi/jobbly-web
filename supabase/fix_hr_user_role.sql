-- Fix HR user role in public.users table
-- Run this SQL in Supabase SQL Editor to fix existing HR users

-- Update hr@demo.com to have role='hr'
UPDATE public.users 
SET role = 'hr', updated_at = NOW()
WHERE email = 'hr@demo.com';

-- If the user doesn't exist in public.users, insert it
-- Replace USER_ID_HERE with the actual user ID from auth.users
-- You can find it by running: SELECT id FROM auth.users WHERE email = 'hr@demo.com';
INSERT INTO public.users (id, email, role, full_name, created_at, updated_at)
SELECT 
    id,
    email,
    'hr' as role,
    NULL as full_name,
    created_at,
    NOW() as updated_at
FROM auth.users
WHERE email = 'hr@demo.com'
ON CONFLICT (id) DO UPDATE
SET role = 'hr', updated_at = NOW();

-- Verify the fix
SELECT id, email, role, created_at, updated_at 
FROM public.users 
WHERE email = 'hr@demo.com';

