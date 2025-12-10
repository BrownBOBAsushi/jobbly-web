// src/app/api/hr/preferences/route.ts
// PATCH /api/hr/preferences - Save/update job preferences

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUserWithRole(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden - HR access only' }, { status: 403 });
    }

    const body = await request.json();
    const { job_id, role_level, salary_min, salary_max, mode_of_work } = body;

    if (!job_id) {
      return NextResponse.json(
        { error: 'job_id is required' },
        { status: 400 }
      );
    }

    // Verify job belongs to this HR user using RPC function (bypasses RLS)
    const supabase = createServiceRoleClient();
    
    // Try RPC function first
    const { data: jobData, error: jobRpcError } = await supabase.rpc('get_job_by_id', {
      p_job_id: job_id,
    });

    let job: any = null;

    if (!jobRpcError && jobData) {
      // RPC function returned JSONB
      job = jobData as any;
      console.log('✅ Job fetched via RPC:', { jobId: job.id, hr_user_id: job.hr_user_id });
    } else {
      // Fallback: try direct query
      console.warn('⚠️ RPC function failed, trying direct query:', jobRpcError);
      const { data: directJob, error: jobError } = await supabase
        .from('jobs')
        .select('id, hr_user_id')
        .eq('id', job_id)
        .single();

      if (jobError || !directJob) {
        console.error('Error fetching job:', {
          job_id: job_id,
          rpcError: jobRpcError?.message,
          directError: jobError?.message,
        });
        return NextResponse.json(
          { error: 'Job not found', details: jobError?.message || jobRpcError?.message },
          { status: 404 }
        );
      }

      job = directJob;
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.hr_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Job does not belong to you' },
        { status: 403 }
      );
    }

    // Validate role_level if provided
    if (role_level && !['Intern', 'Junior', 'Senior', 'Lead'].includes(role_level)) {
      return NextResponse.json(
        { error: 'Invalid role_level. Must be one of: Intern, Junior, Senior, Lead' },
        { status: 400 }
      );
    }

    // Validate mode_of_work if provided
    if (mode_of_work && !['Work from Home', 'On site', 'Hybrid'].includes(mode_of_work)) {
      return NextResponse.json(
        { error: 'Invalid mode_of_work. Must be one of: Work from Home, On site, Hybrid' },
        { status: 400 }
      );
    }

    // Validate salary range
    if (salary_min !== undefined && salary_max !== undefined) {
      if (salary_min > salary_max) {
        return NextResponse.json(
          { error: 'salary_min cannot be greater than salary_max' },
          { status: 400 }
        );
      }
    }

    // Use RPC function to insert/update preferences (bypasses RLS)
    const { data: prefId, error: prefRpcError } = await supabase.rpc('insert_or_update_job_preferences', {
      p_job_id: job_id,
      p_role_level: role_level || null,
      p_salary_min: salary_min || null,
      p_salary_max: salary_max || null,
      p_mode_of_work: mode_of_work || null,
    });

    if (prefRpcError) {
      console.error('Job preferences RPC error:', prefRpcError);
      
      // Fallback: try direct insert/update
      const { data: existingPrefs } = await supabase
        .from('job_preferences')
        .select('id')
        .eq('job_id', job_id)
        .single();

      const preferencesData: any = {};
      if (role_level !== undefined) preferencesData.role_level = role_level;
      if (salary_min !== undefined) preferencesData.salary_min = salary_min;
      if (salary_max !== undefined) preferencesData.salary_max = salary_max;
      if (mode_of_work !== undefined) preferencesData.mode_of_work = mode_of_work;

      if (existingPrefs) {
        // Update existing preferences
        const { error: updateError } = await supabase
          .from('job_preferences')
          .update(preferencesData)
          .eq('job_id', job_id);

        if (updateError) {
          console.error('Job preferences update error (fallback):', updateError);
          return NextResponse.json(
            { error: 'Failed to update preferences', details: updateError.message },
            { status: 500 }
          );
        }
      } else {
        // Create new preferences
        const { error: insertError } = await supabase
          .from('job_preferences')
          .insert({
            job_id: job_id,
            ...preferencesData,
          });

        if (insertError) {
          console.error('Job preferences insert error (fallback):', insertError);
          return NextResponse.json(
            { error: 'Failed to create preferences', details: insertError.message },
            { status: 500 }
          );
        }
      }
    }

    const preferencesData: any = {};
    if (role_level !== undefined) preferencesData.role_level = role_level;
    if (salary_min !== undefined) preferencesData.salary_min = salary_min;
    if (salary_max !== undefined) preferencesData.salary_max = salary_max;
    if (mode_of_work !== undefined) preferencesData.mode_of_work = mode_of_work;

    return NextResponse.json({
      success: true,
      preferences: preferencesData,
    });
  } catch (error: any) {
    console.error('Job preferences update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

