// src/lib/supabase-server.ts
// Server-side Supabase client for API routes
// Uses service role key for admin operations (bypasses RLS when needed)

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Service role client (for admin operations, bypasses RLS)
// Use this when you need to perform operations that require elevated privileges
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Verify we're using service role key (should start with 'eyJ' for JWT)
  if (!supabaseServiceRoleKey.startsWith('eyJ')) {
    console.warn('⚠️ Service role key format looks incorrect. Should be a JWT token starting with "eyJ"');
  }

  const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
      },
    },
  });

  return client;
}

// Server client with user session (respects RLS)
// Use this for operations that should respect Row Level Security policies
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch (error) {
          // Ignore cookie errors in server components
        }
      },
    },
  });
}

// Helper to get current user from server-side request
export async function getServerUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('❌ getServerUser - Auth error:', error.message);
    return null;
  }

  if (!user) {
    console.warn('⚠️ getServerUser - No user found');
    return null;
  }

  console.log('✅ getServerUser - User found:', user.email);
  return user;
}

// Helper to create Supabase client from NextRequest (for API routes)
export function createServerSupabaseClientFromRequest(
  request: NextRequest,
  response?: NextResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        if (response) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      },
    },
  });
}

// Helper to get user with role from users table
export async function getServerUserWithRole(
  request?: NextRequest,
  response?: NextResponse
) {
  // If request is provided, use it (for API routes)
  // Otherwise, use cookies() (for Server Components)
  const supabase = request 
    ? createServerSupabaseClientFromRequest(request, response)
    : await createServerSupabaseClient();
    
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    if (authError) {
      console.error('❌ getServerUserWithRole - Auth error:', authError.message);
    } else {
      console.warn('⚠️ getServerUserWithRole - No user found');
    }
    return null;
  }

  console.log('✅ getServerUserWithRole - User found:', user.email);
  console.log('🔍 getServerUserWithRole - User metadata:', user.user_metadata);

  // Fetch user role from public.users table using service role client
  // (bypasses RLS to ensure we can always read user records)
  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // If user record exists, return it
  if (data && !error) {
    console.log('✅ getServerUserWithRole - Found in public.users table:', {
      role: data.role,
      full_name: data.full_name,
    });
    return {
      ...user,
      role: data.role,
      full_name: data.full_name,
    };
  }

  // If user record doesn't exist, try to infer role from email or create with default
  // Check if email suggests HR role (common patterns)
  const emailLower = user.email?.toLowerCase() || '';
  const isLikelyHr = emailLower.includes('hr@') || 
                     emailLower.includes('hiring@') || 
                     emailLower.includes('recruiter@') ||
                     emailLower.includes('hr@demo.com');
  
  const roleFromMetadata = (user.user_metadata?.role as string);
  const inferredRole = roleFromMetadata || (isLikelyHr ? 'hr' : 'applicant');
  
  console.warn(`⚠️ User ${user.id} not found in public.users, attempting to create/update with role: ${inferredRole}`, {
    email: user.email,
    metadata_role: roleFromMetadata,
    inferred_from_email: isLikelyHr,
  });
  
  // Upsert user record using RPC function (bypasses RLS)
  const { data: upsertUserId, error: rpcError } = await serviceClient.rpc('upsert_user', {
    p_id: user.id,
    p_email: user.email,
    p_role: inferredRole,
    p_full_name: user.user_metadata?.full_name || null,
  });

  // If RPC succeeds, fetch the user record
  let upsertData = null;
  let upsertError = rpcError;
  
  if (!rpcError && upsertUserId) {
    const { data: fetchedUser, error: fetchError } = await serviceClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!fetchError && fetchedUser) {
      upsertData = fetchedUser;
    } else {
      upsertError = fetchError;
    }
  }

  // Fallback: try direct upsert if RPC function doesn't exist or fails
  if (rpcError) {
    console.warn('⚠️ RPC function upsert_user failed, trying direct upsert with service role', {
      error: rpcError.message,
      code: rpcError.code,
    });
    const now = new Date().toISOString();
    const { data: directUpsertData, error: directUpsertError } = await serviceClient
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        role: inferredRole,
        full_name: user.user_metadata?.full_name || null,
        created_at: now,
        updated_at: now,
      }, {
        onConflict: 'id',
      })
      .select()
      .single();
    
    if (!directUpsertError && directUpsertData) {
      upsertData = directUpsertData;
      upsertError = null; // Clear error if direct upsert succeeded
    } else {
      upsertError = directUpsertError || rpcError; // Keep original error if both fail
    }
  }

  if (upsertError) {
    console.error('❌ getServerUserWithRole - Upsert error:', {
      error: upsertError.message,
      code: upsertError.code,
      details: upsertError.details,
      hint: upsertError.hint,
      email: user.email,
      inferredRole,
    });
  }

  if (upsertData && !upsertError) {
    console.log('✅ getServerUserWithRole - Created/updated user record:', {
      role: upsertData.role,
      email: user.email,
    });
    return {
      ...user,
      role: upsertData.role,
      full_name: upsertData.full_name,
    };
  }

  // Final fallback: use inferred role (even if upsert failed, we can still use inferred role)
  console.warn(`⚠️ Could not create/update user record, using inferred role: ${inferredRole}`, {
    email: user.email,
    inferredRole,
    upsertError: upsertError ? {
      message: upsertError.message,
      code: upsertError.code,
    } : null,
  });
  
  // Return with inferred role - this allows the API to work even if the upsert fails
  return {
    ...user,
    role: inferredRole,
    full_name: user.user_metadata?.full_name || null,
  };
}

