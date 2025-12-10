// src/app/api/hr/jobs/[jobId]/schedule-interview/route.ts
// POST /api/hr/jobs/[jobId]/schedule-interview - Schedule interview for a match

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';

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
    const body = await request.json();
    const { match_id, interview_scheduled_at } = body;

    if (!match_id) {
      return NextResponse.json(
        { error: 'match_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Verify job belongs to this HR user
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, hr_user_id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
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

    // Verify match belongs to this job
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id, job_id')
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    if (match.job_id !== jobId) {
      return NextResponse.json(
        { error: 'Match does not belong to this job' },
        { status: 400 }
      );
    }

    // Update match status
    const updateData: any = {
      status: 'interview_scheduled',
    };

    if (interview_scheduled_at) {
      updateData.interview_scheduled_at = interview_scheduled_at;
    } else {
      updateData.interview_scheduled_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', match_id);

    if (updateError) {
      console.error('Error updating match:', updateError);
      return NextResponse.json(
        { error: 'Failed to schedule interview', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Interview scheduled successfully',
      match: {
        id: match_id,
        status: 'interview_scheduled',
        interview_scheduled_at: updateData.interview_scheduled_at,
      },
    });
  } catch (error: any) {
    console.error('Schedule interview error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

