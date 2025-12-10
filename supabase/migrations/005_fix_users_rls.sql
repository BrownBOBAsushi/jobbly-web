-- Fix RLS for users table to allow service role inserts/updates
-- Create RPC function for user upsert (bypasses RLS)

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.upsert_user(
    p_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_full_name TEXT
);

-- Create function to upsert users (bypasses RLS)
CREATE OR REPLACE FUNCTION public.upsert_user(
    p_id UUID,
    p_email TEXT,
    p_role TEXT,
    p_full_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, role, full_name, created_at, updated_at)
    VALUES (p_id, p_email, p_role, p_full_name, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        updated_at = NOW();
    
    RETURN p_id;
END;
$$;

-- Also add policies to allow service role (backup)
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
CREATE POLICY "Service role can manage users"
    ON public.users FOR ALL
    USING (auth.uid() IS NULL)
    WITH CHECK (auth.uid() IS NULL);

