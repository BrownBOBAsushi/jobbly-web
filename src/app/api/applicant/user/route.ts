// src/app/api/applicant/user/route.ts
// GET /api/applicant/user - Get applicant user profile and preferences

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUserWithRole(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'applicant') {
      return NextResponse.json({ error: 'Forbidden - Applicant access only' }, { status: 403 });
    }

    const supabase = createServiceRoleClient();
    
    // Fetch user data and preferences using RPC
    const { data: applicantData, error: rpcError } = await supabase.rpc(
      'get_applicant_data',
      { p_user_id: user.id }
    );

    if (rpcError || !applicantData || !applicantData[0]) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const data = applicantData[0];
    const profile = data.profile as any;
    const preferences = data.preferences as any;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.full_name || user.email?.split('@')[0] || 'Applicant',
        email: user.email,
        roleLevel: preferences?.role_level || 'Not specified',
      },
      preferences: {
        targetSalaryRange: preferences?.salary_min && preferences?.salary_max
          ? `$${preferences.salary_min} - $${preferences.salary_max}`
          : 'Not specified',
        preferredMode: preferences?.mode_of_work 
          ? [preferences.mode_of_work === 'Work from Home' ? 'Remote' : preferences.mode_of_work === 'On site' ? 'On-site' : 'Hybrid']
          : [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
}

