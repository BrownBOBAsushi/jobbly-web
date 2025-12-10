// src/app/api/hr/behaviour/route.ts
// PATCH /api/hr/behaviour - Save/update job behaviour profile

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
    const {
      job_id,
      work_style,
      task_structure,
      environment_pace,
      decision_making,
      role_focus,
      feedback_style,
      innovation_style,
      schedule_type,
    } = body;

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

    // Use RPC function to insert/update behaviour (bypasses RLS)
    const { data: behaviourId, error: behaviourRpcError } = await supabase.rpc('insert_or_update_job_behaviour', {
      p_job_id: job_id,
      p_work_style: work_style || null,
      p_task_structure: task_structure || null,
      p_environment_pace: environment_pace || null,
      p_decision_making: decision_making || null,
      p_role_focus: role_focus || null,
      p_feedback_style: feedback_style || null,
      p_innovation_style: innovation_style || null,
      p_schedule_type: schedule_type || null,
    });

    if (behaviourRpcError) {
      console.error('Job behaviour RPC error:', behaviourRpcError);
      
      // Fallback: try direct insert/update
      // Build answers JSONB object
      const answers: Record<string, string> = {};
      if (work_style) answers.work_style = work_style;
      if (task_structure) answers.task_structure = task_structure;
      if (environment_pace) answers.environment_pace = environment_pace;
      if (decision_making) answers.decision_making = decision_making;
      if (role_focus) answers.role_focus = role_focus;
      if (feedback_style) answers.feedback_style = feedback_style;
      if (innovation_style) answers.innovation_style = innovation_style;
      if (schedule_type) answers.schedule_type = schedule_type;

      const { data: existingBehaviour } = await supabase
        .from('job_behaviour')
        .select('id')
        .eq('job_id', job_id)
        .single();

      const behaviourData: any = {
        answers: answers,
      };

      // Add individual columns if values are provided
      if (work_style !== undefined) behaviourData.work_style = work_style;
      if (task_structure !== undefined) behaviourData.task_structure = task_structure;
      if (environment_pace !== undefined) behaviourData.environment_pace = environment_pace;
      if (decision_making !== undefined) behaviourData.decision_making = decision_making;
      if (role_focus !== undefined) behaviourData.role_focus = role_focus;
      if (feedback_style !== undefined) behaviourData.feedback_style = feedback_style;
      if (innovation_style !== undefined) behaviourData.innovation_style = innovation_style;
      if (schedule_type !== undefined) behaviourData.schedule_type = schedule_type;

      if (existingBehaviour) {
        // Update existing behaviour
        const { error: updateError } = await supabase
          .from('job_behaviour')
          .update(behaviourData)
          .eq('job_id', job_id);

        if (updateError) {
          console.error('Job behaviour update error (fallback):', updateError);
          return NextResponse.json(
            { error: 'Failed to update behaviour', details: updateError.message },
            { status: 500 }
          );
        }
      } else {
        // Create new behaviour
        const { error: insertError } = await supabase
          .from('job_behaviour')
          .insert({
            job_id: job_id,
            ...behaviourData,
          });

        if (insertError) {
          console.error('Job behaviour insert error (fallback):', insertError);
          return NextResponse.json(
            { error: 'Failed to create behaviour', details: insertError.message },
            { status: 500 }
          );
        }
      }
    }

    // Build response data
    const behaviourData: any = {};
    if (work_style !== undefined) behaviourData.work_style = work_style;
    if (task_structure !== undefined) behaviourData.task_structure = task_structure;
    if (environment_pace !== undefined) behaviourData.environment_pace = environment_pace;
    if (decision_making !== undefined) behaviourData.decision_making = decision_making;
    if (role_focus !== undefined) behaviourData.role_focus = role_focus;
    if (feedback_style !== undefined) behaviourData.feedback_style = feedback_style;
    if (innovation_style !== undefined) behaviourData.innovation_style = innovation_style;
    if (schedule_type !== undefined) behaviourData.schedule_type = schedule_type;

    return NextResponse.json({
      success: true,
      behaviour: behaviourData,
    });
  } catch (error: any) {
    console.error('Job behaviour update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

