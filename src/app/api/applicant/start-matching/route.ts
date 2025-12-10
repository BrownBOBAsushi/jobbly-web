// src/app/api/applicant/start-matching/route.ts
// POST /api/applicant/start-matching - Trigger matching against all open jobs

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';
import { computeMatch, ApplicantData } from '@/lib/matching-engine';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUserWithRole(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'applicant') {
      return NextResponse.json({ error: 'Forbidden - Applicant access only' }, { status: 403 });
    }

    const supabase = createServiceRoleClient();
    const userId = user.id;

    console.log('🔍 Fetching applicant data for user:', userId);

    // Use RPC function to fetch all applicant data (bypasses RLS)
    const { data: applicantData, error: rpcError } = await supabase.rpc(
      'get_applicant_data',
      { p_user_id: userId }
    );

    let profileData: any;
    let preferencesData: any;
    let behaviourData: any;

    if (rpcError) {
      console.error('RPC fetch error:', rpcError);
      console.log('RPC function may not exist yet. Please run migration 002_fix_rls_policies.sql');
      return NextResponse.json(
        { error: 'Database function not found. Please run the SQL migration 002_fix_rls_policies.sql in Supabase.' },
        { status: 500 }
      );
    }

    // Parse RPC result
    if (!applicantData || !applicantData[0]) {
      return NextResponse.json(
        { error: 'Applicant data not found. Please complete your profile, preferences, and behaviour first.' },
        { status: 404 }
      );
    }

    const result = applicantData[0];
    if (!result.profile || !result.preferences || !result.behaviour) {
      return NextResponse.json(
        { error: 'Incomplete applicant data. Please complete all onboarding steps.' },
        { status: 404 }
      );
    }

    profileData = result.profile as any;
    preferencesData = result.preferences as any;
    behaviourData = result.behaviour as any;

    console.log('✅ All applicant data found');

    // Fetch all open jobs with their preferences and behaviour
    // Try RPC function first (bypasses RLS), fallback to direct query
    let jobs: any[] = [];
    let jobsError: any = null;

    const { data: jobsRpcData, error: rpcJobsError } = await supabase.rpc(
      'get_open_jobs_for_matching'
    );

    if (rpcJobsError) {
      console.warn('RPC fetch jobs error, trying direct query:', rpcJobsError);
      // Fallback to direct query
      const { data: jobsDirect, error: jobsDirectError } = await supabase
        .from('jobs')
        .select(`
          *,
          job_preferences (*),
          job_behaviour (*)
        `)
        .eq('status', 'open');

      if (jobsDirectError) {
        console.error('Error fetching jobs (both RPC and direct failed):', jobsDirectError);
        return NextResponse.json(
          { error: 'Failed to fetch jobs', details: jobsDirectError.message },
          { status: 500 }
        );
      }
      jobs = jobsDirect || [];
    } else {
      // Parse RPC result
      if (jobsRpcData && jobsRpcData.length > 0) {
        jobs = jobsRpcData.map((row: any) => ({
          ...row.job,
          job_preferences: row.job_preferences ? [row.job_preferences] : null,
          job_behaviour: row.job_behaviour ? [row.job_behaviour] : null,
        }));
      }
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No open jobs found to match against',
        matches_created: 0,
      });
    }

    console.log(`✅ Found ${jobs.length} open job(s) to match against`);

    // Prepare applicant data for matching
    const applicantDataForMatching: ApplicantData = {
      skills: profileData.skills || [],
      preferences: {
        target_job_title: preferencesData.target_job_title || undefined,
        role_level: preferencesData.role_level || undefined,
        salary_min: preferencesData.salary_min || undefined,
        salary_max: preferencesData.salary_max || undefined,
        mode_of_work: preferencesData.mode_of_work || undefined,
      },
      behaviour: {
        independent_vs_team: behaviourData.independent_vs_team || undefined,
        structured_vs_open: behaviourData.structured_vs_open || undefined,
        fast_vs_steady: behaviourData.fast_vs_steady || undefined,
        quick_vs_thorough: behaviourData.quick_vs_thorough || undefined,
        hands_on_vs_strategic: behaviourData.hands_on_vs_strategic || undefined,
        feedback_vs_autonomy: behaviourData.feedback_vs_autonomy || undefined,
        innovation_vs_process: behaviourData.innovation_vs_process || undefined,
        flexible_vs_schedule: behaviourData.flexible_vs_schedule || undefined,
      },
    };

    // Compute matches for each job
    let matchesCreated = 0;

    for (const job of jobs) {
      const jobPreferences = Array.isArray(job.job_preferences) 
        ? job.job_preferences[0] 
        : job.job_preferences;
      const jobBehaviour = Array.isArray(job.job_behaviour)
        ? job.job_behaviour[0]
        : job.job_behaviour;

      if (!jobPreferences || !jobBehaviour) {
        console.warn(`Skipping job ${job.id} - missing preferences or behaviour`);
        continue;
      }

      // Prepare job data for matching
      const jobData = {
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

      // Compute match scores
      const matchResult = await computeMatch(applicantDataForMatching, jobData);

      // Use RPC function to insert/update match (bypasses RLS)
      const { data: matchId, error: rpcError } = await supabase.rpc(
        'insert_or_update_match',
        {
          p_applicant_user_id: userId,
          p_job_id: job.id,
          p_overall_score: matchResult.overall_score,
          p_skills_score: matchResult.skills_score,
          p_behaviour_score: matchResult.behaviour_score,
          p_prefs_score: matchResult.prefs_score,
          p_ai_summary: matchResult.ai_summary || null,
          p_status: 'pending',
        }
      );

      if (rpcError) {
        console.error(`Error creating/updating match for job ${job.id}:`, rpcError);
        // Fallback: Try direct insert/update
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id')
          .eq('applicant_user_id', userId)
          .eq('job_id', job.id)
          .single();

        const matchData = {
          applicant_user_id: userId,
          job_id: job.id,
          overall_score: matchResult.overall_score,
          skills_score: matchResult.skills_score,
          behaviour_score: matchResult.behaviour_score,
          prefs_score: matchResult.prefs_score,
          ai_summary: matchResult.ai_summary || null,
          status: 'pending' as const,
        };

        if (existingMatch) {
          const { error: updateError } = await supabase
            .from('matches')
            .update(matchData)
            .eq('id', existingMatch.id);

          if (!updateError) {
            matchesCreated++;
          }
        } else {
          const { error: insertError } = await supabase
            .from('matches')
            .insert(matchData);

          if (!insertError) {
            matchesCreated++;
          }
        }
      } else {
        matchesCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Matching completed. ${matchesCreated} match(es) created/updated.`,
      matches_created: matchesCreated,
      total_jobs_matched: jobs.length,
    });
  } catch (error: any) {
    console.error('Start matching error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
