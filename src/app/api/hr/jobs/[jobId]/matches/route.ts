// src/app/api/hr/jobs/[jobId]/matches/route.ts
// GET /api/hr/jobs/[jobId]/matches - Get matched applicants for a job

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Check authentication
    const user = await getServerUserWithRole(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden - HR access only' }, { status: 403 });
    }

    // Await params (Next.js 15+)
    const { jobId } = await params;
    const supabase = createServiceRoleClient();

    // Verify job belongs to this HR user using RPC function (bypasses RLS)
    const { data: jobData, error: jobRpcError } = await supabase.rpc('get_job_by_id', {
      p_job_id: jobId,
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
        .select('id, hr_user_id, title, jd_text, jd_url, status')
        .eq('id', jobId)
        .single();

      if (jobError || !directJob) {
        console.error('Error fetching job:', {
          job_id: jobId,
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

    // Fetch job preferences and behaviour using RPC functions
    const { data: prefsData } = await supabase.rpc('get_job_preferences', {
      p_job_id: jobId,
    });

    const { data: behaviourData } = await supabase.rpc('get_job_behaviour', {
      p_job_id: jobId,
    });

    const jobPreferences = prefsData as any;
    const jobBehaviour = behaviourData as any;

    // Fetch matches using RPC function (bypasses RLS)
    const { data: matchesData, error: matchesRpcError } = await supabase.rpc('get_job_matches', {
      p_job_id: jobId,
    });

    let matches: any[] = [];

    if (!matchesRpcError && matchesData) {
      // RPC function returned JSONB array
      matches = matchesData as any[];
      console.log(`✅ Fetched ${matches.length} matches via RPC`);
    } else {
      // Fallback: try direct query
      console.warn('⚠️ RPC function failed, trying direct query:', matchesRpcError);
      const { data: directMatches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          users!matches_applicant_user_id_fkey (
            id,
            email,
            full_name
          ),
          applicant_profiles (
            resume_url,
            cover_letter_url,
            photo_url,
            skills
          ),
          applicant_preferences (
            target_job_title,
            role_level,
            salary_min,
            salary_max,
            mode_of_work
          )
        `)
        .eq('job_id', jobId)
        .order('overall_score', { ascending: false });

      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
        return NextResponse.json(
          { error: 'Failed to fetch matches', details: matchesError.message },
          { status: 500 }
        );
      }

      matches = directMatches || [];
    }

    // Transform matches data
    const transformedMatches = matches.map((match: any) => {
      // Handle RPC format (nested objects) vs direct query format (arrays)
      const applicantUser = match.applicant_user || (Array.isArray(match.users) ? match.users[0] : match.users);
      const profile = match.applicant_profile || (Array.isArray(match.applicant_profiles)
        ? match.applicant_profiles[0]
        : match.applicant_profiles);
      const preferences = match.applicant_preferences || (Array.isArray(match.applicant_preferences)
        ? match.applicant_preferences[0]
        : match.applicant_preferences);

      return {
        id: match.id,
        overall_score: match.overall_score,
        skills_score: match.skills_score,
        behaviour_score: match.behaviour_score,
        prefs_score: match.prefs_score,
        ai_summary: match.ai_summary,
        status: match.status,
        interview_scheduled_at: match.interview_scheduled_at,
        created_at: match.created_at,
        applicant: {
          user: {
            id: applicantUser?.id,
            email: applicantUser?.email,
            full_name: applicantUser?.full_name,
          },
          profile: profile ? {
            resume_url: profile.resume_url,
            cover_letter_url: profile.cover_letter_url,
            photo_url: profile.photo_url,
            skills: profile.skills,
          } : null,
          preferences: preferences ? {
            target_job_title: preferences.target_job_title,
            role_level: preferences.role_level,
            salary_min: preferences.salary_min,
            salary_max: preferences.salary_max,
            mode_of_work: preferences.mode_of_work,
          } : null,
        },
      };
    });


    return NextResponse.json({
      job: {
        id: job.id,
        title: job.title,
        jd_text: job.jd_text,
        jd_url: job.jd_url,
        status: job.status,
        preferences: jobPreferences ? {
          role_level: jobPreferences.role_level,
          salary_min: jobPreferences.salary_min,
          salary_max: jobPreferences.salary_max,
          mode_of_work: jobPreferences.mode_of_work,
        } : null,
        behaviour: jobBehaviour ? {
          work_style: jobBehaviour.work_style,
          task_structure: jobBehaviour.task_structure,
          environment_pace: jobBehaviour.environment_pace,
          decision_making: jobBehaviour.decision_making,
          role_focus: jobBehaviour.role_focus,
          feedback_style: jobBehaviour.feedback_style,
          innovation_style: jobBehaviour.innovation_style,
          schedule_type: jobBehaviour.schedule_type,
        } : null,
      },
      matches: transformedMatches,
    });
  } catch (error: any) {
    console.error('Get job matches error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

