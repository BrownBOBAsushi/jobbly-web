// src/app/api/test-auth/route.ts
// Simple test endpoint to debug authentication

import { NextRequest, NextResponse } from 'next/server';
import { getServerUserWithRole } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll();
  
  return NextResponse.json({
    cookies_received: cookies.map(c => ({
      name: c.name,
      value_length: c.value.length,
      value_preview: c.value.substring(0, 50) + '...',
    })),
    cookie_count: cookies.length,
    supabase_cookies: cookies.filter(c => c.name.startsWith('sb-')).map(c => c.name),
    user: await getServerUserWithRole(request),
  });
}

