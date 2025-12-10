// src/app/api/hr/jobs/route.ts
// GET /api/hr/jobs - Get all jobs for HR user

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUserWithRole(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden - HR access only' }, { status: 403 });
    }

    const supabase = createServiceRoleClient();
    const userId = user.id;

    // Fetch jobs using RPC function (bypasses RLS)
    const { data: jobsData, error: jobsRpcError } = await supabase.rpc('get_hr_jobs', {
      p_hr_user_id: userId,
    });

    let jobs: any[] = [];

    if (!jobsRpcError && jobsData) {
      // RPC function returned JSONB array
      jobs = jobsData as any[];
      console.log(`✅ Fetched ${jobs.length} jobs via RPC`);
    } else {
      // Fallback: try direct query
      console.warn('⚠️ RPC function failed, trying direct query:', jobsRpcError);
      const { data: directJobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          job_preferences (*),
          matches (id)
        `)
        .eq('hr_user_id', userId)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        return NextResponse.json(
          { error: 'Failed to fetch jobs', details: jobsError.message },
          { status: 500 }
        );
      }

      jobs = directJobs || [];
    }

    // Fetch preferences for each job separately (using RPC)
    const transformedJobs = await Promise.all(
      jobs.map(async (job: any) => {
        // Fetch preferences using RPC
        const { data: prefsData } = await supabase.rpc('get_job_preferences', {
          p_job_id: job.id,
        });

        const jobPreferences = prefsData as any;

        return {
          id: job.id,
          title: job.title,
          jd_text: job.jd_text,
          jd_url: job.jd_url,
          status: job.status,
          created_at: job.created_at,
          updated_at: job.updated_at,
          preferences: jobPreferences ? {
            role_level: jobPreferences.role_level,
            salary_min: jobPreferences.salary_min,
            salary_max: jobPreferences.salary_max,
            mode_of_work: jobPreferences.mode_of_work,
          } : null,
          match_count: job.match_count || 0,
        };
      })
    );

    return NextResponse.json({
      jobs: transformedJobs,
    });
  } catch (error: any) {
    console.error('Get HR jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

