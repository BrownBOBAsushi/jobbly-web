// src/app/api/hr/jobs/[jobId]/start-matching/route.ts
// POST /api/hr/jobs/[jobId]/start-matching - Trigger matching for a job against all applicants

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';
import { computeMatch, JobData } from '@/lib/matching-engine';

export async function POST(
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

    // Fetch job using RPC function (bypasses RLS)
    const { data: fetchedJobData, error: jobRpcError } = await supabase.rpc('get_job_by_id', {
      p_job_id: jobId,
    });

    let job: any = null;

    if (!jobRpcError && fetchedJobData) {
      // RPC function returned JSONB
      job = fetchedJobData as any;
      console.log('✅ Job fetched via RPC:', { jobId: job.id, hr_user_id: job.hr_user_id });
    } else {
      // Fallback: try direct query
      console.warn('⚠️ RPC function failed, trying direct query:', jobRpcError);
      const { data: directJob, error: jobError } = await supabase
        .from('jobs')
        .select('id, hr_user_id, title, jd_text, status')
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

    // Verify job belongs to this HR user
    if (job.hr_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Job does not belong to you' },
        { status: 403 }
      );
    }

    // Fetch job preferences and behaviour using RPC functions (bypasses RLS)
    const { data: prefsData, error: prefsRpcError } = await supabase.rpc('get_job_preferences', {
      p_job_id: jobId,
    });

    const { data: behaviourData, error: behaviourRpcError } = await supabase.rpc('get_job_behaviour', {
      p_job_id: jobId,
    });

    let jobPreferences: any = null;
    let jobBehaviour: any = null;

    if (!prefsRpcError && prefsData) {
      jobPreferences = prefsData as any;
      console.log('✅ Job preferences fetched via RPC');
    } else {
      console.warn('⚠️ RPC function failed for preferences, trying direct query:', prefsRpcError);
      const { data: directPrefs, error: prefsError } = await supabase
        .from('job_preferences')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (prefsError || !directPrefs) {
        console.error('Error fetching job preferences:', prefsError || prefsRpcError);
        return NextResponse.json(
          { error: 'Job preferences not found. Please complete job preferences first.' },
          { status: 400 }
        );
      }

      jobPreferences = directPrefs;
    }

    if (!behaviourRpcError && behaviourData) {
      jobBehaviour = behaviourData as any;
      console.log('✅ Job behaviour fetched via RPC');
    } else {
      console.warn('⚠️ RPC function failed for behaviour, trying direct query:', behaviourRpcError);
      const { data: directBehaviour, error: behaviourError } = await supabase
        .from('job_behaviour')
        .select('*')
        .eq('job_id', jobId)
        .single();

      if (behaviourError || !directBehaviour) {
        console.error('Error fetching job behaviour:', behaviourError || behaviourRpcError);
        return NextResponse.json(
          { error: 'Job behaviour not found. Please complete job behaviour setup first.' },
          { status: 400 }
        );
      }

      jobBehaviour = directBehaviour;
    }

    if (!jobPreferences) {
      return NextResponse.json(
        { error: 'Job preferences not found. Please complete job preferences first.' },
        { status: 400 }
      );
    }

    if (!jobBehaviour) {
      return NextResponse.json(
        { error: 'Job behaviour not found. Please complete job behaviour setup first.' },
        { status: 400 }
      );
    }

    // Fetch all applicants with their profiles, preferences, and behaviour using RPC function (bypasses RLS)
    const { data: applicantsData, error: applicantsRpcError } = await supabase.rpc('get_applicants_for_matching');

    let applicants: any[] = [];

    if (!applicantsRpcError && applicantsData) {
      // RPC function returned JSONB array
      applicants = applicantsData as any[];
      console.log(`✅ Fetched ${applicants.length} applicants via RPC`);
    } else {
      // Fallback: try direct query
      console.warn('⚠️ RPC function failed for applicants, trying direct query:', applicantsRpcError);
      const { data: directApplicants, error: applicantsError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          applicant_profiles (*),
          applicant_preferences (*),
          applicant_behaviour (*)
        `)
        .eq('role', 'applicant');

      if (applicantsError) {
        console.error('Error fetching applicants:', applicantsError);
        return NextResponse.json(
          { error: 'Failed to fetch applicants', details: applicantsError.message },
          { status: 500 }
        );
      }

      applicants = directApplicants || [];
    }

    if (!applicants || applicants.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No applicants found to match against',
        matches_created: 0,
      });
    }

    // Prepare job data for matching
    const jobData: JobData = {
      title: job.title,
      jd_text: job.jd_text || undefined,
      preferences: {
        role_level: jobPreferences.role_level || undefined,
        salary_min: jobPreferences.salary_min || undefined,
        salary_max: jobPreferences.salary_max || undefined,
        mode_of_work: jobPreferences.mode_of_work || undefined,
      },
      behaviour: {
        work_style: jobBehaviour.work_style || undefined,
        task_structure: jobBehaviour.task_structure || undefined,
        environment_pace: jobBehaviour.environment_pace || undefined,
        decision_making: jobBehaviour.decision_making || undefined,
        role_focus: jobBehaviour.role_focus || undefined,
        feedback_style: jobBehaviour.feedback_style || undefined,
        innovation_style: jobBehaviour.innovation_style || undefined,
        schedule_type: jobBehaviour.schedule_type || undefined,
      },
    };

    // Compute matches for each applicant
    let matchesCreated = 0;

    for (const applicant of applicants) {
      // Handle both RPC format (arrays) and direct query format (single objects or arrays)
      const profile = Array.isArray(applicant.applicant_profiles)
        ? (applicant.applicant_profiles.length > 0 ? applicant.applicant_profiles[0] : null)
        : applicant.applicant_profiles;
      const preferences = Array.isArray(applicant.applicant_preferences)
        ? (applicant.applicant_preferences.length > 0 ? applicant.applicant_preferences[0] : null)
        : applicant.applicant_preferences;
      const behaviour = Array.isArray(applicant.applicant_behaviour)
        ? (applicant.applicant_behaviour.length > 0 ? applicant.applicant_behaviour[0] : null)
        : applicant.applicant_behaviour;

      // Skip applicants without complete data
      if (!profile || !preferences || !behaviour) {
        console.warn(`Skipping applicant ${applicant.id} - missing profile, preferences, or behaviour`);
        continue;
      }

      // Prepare applicant data for matching
      const applicantData = {
        skills: profile.skills || [],
        preferences: {
          target_job_title: preferences.target_job_title || undefined,
          role_level: preferences.role_level || undefined,
          salary_min: preferences.salary_min || undefined,
          salary_max: preferences.salary_max || undefined,
          mode_of_work: preferences.mode_of_work || undefined,
        },
        behaviour: {
          independent_vs_team: behaviour.independent_vs_team || undefined,
          structured_vs_open: behaviour.structured_vs_open || undefined,
          fast_vs_steady: behaviour.fast_vs_steady || undefined,
          quick_vs_thorough: behaviour.quick_vs_thorough || undefined,
          hands_on_vs_strategic: behaviour.hands_on_vs_strategic || undefined,
          feedback_vs_autonomy: behaviour.feedback_vs_autonomy || undefined,
          innovation_vs_process: behaviour.innovation_vs_process || undefined,
          flexible_vs_schedule: behaviour.flexible_vs_schedule || undefined,
        },
      };

      // Compute match scores
      const matchResult = await computeMatch(applicantData, jobData);

      // Insert or update match using RPC function (bypasses RLS)
      const { data: matchId, error: rpcError } = await supabase.rpc(
        'insert_or_update_match',
        {
          p_applicant_user_id: applicant.id,
          p_job_id: jobId,
          p_overall_score: matchResult.overall_score,
          p_skills_score: matchResult.skills_score,
          p_behaviour_score: matchResult.behaviour_score,
          p_prefs_score: matchResult.prefs_score,
          p_ai_summary: matchResult.ai_summary || null,
          p_status: 'pending',
        }
      );

      if (!rpcError && matchId) {
        matchesCreated++;
      } else {
        console.error(`Error creating/updating match for applicant ${applicant.id}:`, rpcError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Matching completed. ${matchesCreated} match(es) created/updated.`,
      matches_created: matchesCreated,
      total_applicants_matched: applicants.length,
    });
  } catch (error: any) {
    console.error('HR start matching error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

