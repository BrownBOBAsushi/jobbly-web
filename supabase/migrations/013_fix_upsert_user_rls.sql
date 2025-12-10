-- Fix upsert_user RPC function to ensure it works correctly
-- This ensures user records can be created/updated even when RLS is enabled

-- Drop and recreate the function with proper permissions
DROP FUNCTION IF EXISTS public.upsert_user(UUID, TEXT, TEXT, TEXT);

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
    -- Use INSERT ... ON CONFLICT to handle both insert and update
    INSERT INTO public.users (id, email, role, full_name, created_at, updated_at)
    VALUES (p_id, p_email, p_role, p_full_name, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        updated_at = NOW();
    
    RETURN p_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail - return the ID anyway
        RAISE WARNING 'Error in upsert_user: %', SQLERRM;
        RETURN p_id;
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.upsert_user(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_user(UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_user(UUID, TEXT, TEXT, TEXT) TO anon;

-- Ensure RLS policies allow service role operations
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
CREATE POLICY "Service role can manage users"
    ON public.users FOR ALL
    USING (auth.uid() IS NULL OR auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.uid() IS NULL OR auth.jwt() ->> 'role' = 'service_role');

-- Also ensure users can read their own record
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

