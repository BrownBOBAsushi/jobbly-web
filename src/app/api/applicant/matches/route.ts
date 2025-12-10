// src/app/api/applicant/matches/route.ts
// GET /api/applicant/matches - Get matched jobs for applicant

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
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

    console.log('🔍 Fetching applicant profile for user:', userId);

    // Use RPC function to fetch applicant data (bypasses RLS)
    const { data: applicantData, error: rpcError } = await supabase.rpc(
      'get_applicant_data',
      { p_user_id: userId }
    );

    let profile: any = null;
    let preferences: any = null;
    let behaviour: any = null;

    if (rpcError) {
      console.error('RPC fetch error, trying direct query:', rpcError);
      // Fallback: Try direct query
      const { data: profileData, error: profileError } = await supabase
        .from('applicant_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError || !profileData) {
        console.warn('⚠️ Profile not found for user:', userId, '- returning empty matches');
        // Return empty matches instead of error (user might not have completed onboarding)
        return NextResponse.json({
          profile: null,
          matches: [],
        });
      }
      profile = profileData;
    } else {
      // Parse RPC result
      if (applicantData && applicantData[0]) {
        profile = applicantData[0].profile as any;
        preferences = applicantData[0].preferences as any;
        behaviour = applicantData[0].behaviour as any;
      }
      
      if (!profile) {
        console.warn('⚠️ No profile data in RPC result for user:', userId, '- returning empty matches');
        // Return empty matches instead of error
        return NextResponse.json({
          profile: null,
          matches: [],
        });
      }
    }

    console.log('✅ Profile found:', profile?.id || 'N/A');

    // Fetch matches with job details using RPC function (bypasses RLS)
    console.log('🔍 Fetching matches for user:', userId);
    const { data: matchesRpcData, error: matchesRpcError } = await supabase.rpc(
      'get_applicant_matches',
      { p_user_id: userId }
    );

    let matches: any[] = [];

    if (matchesRpcError) {
      console.error('❌ RPC fetch error, trying direct query:', matchesRpcError);
      // Fallback: Try direct query
      const { data: matchesDirect, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          jobs (
            id,
            title,
            jd_text,
            jd_url,
            status,
            job_preferences (
              role_level,
              salary_min,
              salary_max,
              mode_of_work
            )
          )
        `)
        .eq('applicant_user_id', userId)
        .order('overall_score', { ascending: false });

      if (matchesError) {
        console.error('❌ Direct query also failed:', matchesError);
        if (matchesError.code === '42501') {
          console.warn('⚠️ RLS permission error - matches table may need policy update');
          console.log('💡 Tip: Run migration 002_fix_rls_policies.sql to fix RLS policies');
        }
        // Return empty matches instead of error
        return NextResponse.json({
          profile: {
            resume_url: profile.resume_url,
            cover_letter_url: profile.cover_letter_url,
            photo_url: profile.photo_url,
            skills: profile.skills,
          },
          matches: [],
        });
      }
      matches = matchesDirect || [];
    } else {
      // Transform RPC result to match expected format
      matches = (matchesRpcData || []).map((row: any) => ({
        id: row.match_id,
        overall_score: row.overall_score,
        skills_score: row.skills_score,
        behaviour_score: row.behaviour_score,
        prefs_score: row.prefs_score,
        ai_summary: row.ai_summary,
        status: row.status,
        interview_scheduled_at: row.interview_scheduled_at,
        created_at: row.created_at,
        jobs: row.job,
        job_preferences: row.job_preferences ? [row.job_preferences] : null,
      }));
    }

    console.log(`✅ Found ${matches?.length || 0} match(es) for user`);
    if (matches && matches.length > 0) {
      console.log('📊 Match scores:', matches.map((m: any) => ({ 
        job: m.jobs?.title || m.job?.title || 'Unknown', 
        score: m.overall_score 
      })));
    }

    // Transform matches data
    const transformedMatches = (matches || []).map((match: any) => {
      const job = Array.isArray(match.jobs) ? match.jobs[0] : match.jobs;
      const jobPreferences = Array.isArray(job?.job_preferences)
        ? job.job_preferences[0]
        : job?.job_preferences;

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
        job: {
          id: job?.id,
          title: job?.title,
          jd_text: job?.jd_text,
          jd_url: job?.jd_url,
          status: job?.status,
          preferences: jobPreferences ? {
            role_level: jobPreferences.role_level,
            salary_min: jobPreferences.salary_min,
            salary_max: jobPreferences.salary_max,
            mode_of_work: jobPreferences.mode_of_work,
          } : null,
        },
      };
    });

    return NextResponse.json({
      profile: profile ? {
        resume_url: profile.resume_url,
        cover_letter_url: profile.cover_letter_url,
        photo_url: profile.photo_url,
        skills: profile.skills || [],
      } : null,
      matches: transformedMatches,
    });
  } catch (error: any) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

