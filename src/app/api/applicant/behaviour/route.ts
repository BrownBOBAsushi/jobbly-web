// src/app/api/applicant/behaviour/route.ts
// PATCH /api/applicant/behaviour - Save/update applicant behaviour answers

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUserWithRole(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'applicant') {
      return NextResponse.json({ error: 'Forbidden - Applicant access only' }, { status: 403 });
    }

    const body = await request.json();
    const {
      independent_vs_team,
      structured_vs_open,
      fast_vs_steady,
      quick_vs_thorough,
      hands_on_vs_strategic,
      feedback_vs_autonomy,
      innovation_vs_process,
      flexible_vs_schedule,
    } = body;

    // Validate that values are between 1 and 5
    const behaviourValues = [
      independent_vs_team,
      structured_vs_open,
      fast_vs_steady,
      quick_vs_thorough,
      hands_on_vs_strategic,
      feedback_vs_autonomy,
      innovation_vs_process,
      flexible_vs_schedule,
    ];

    for (const value of behaviourValues) {
      if (value !== undefined && (value < 1 || value > 5)) {
        return NextResponse.json(
          { error: 'All behaviour values must be between 1 and 5' },
          { status: 400 }
        );
      }
    }

    const supabase = createServiceRoleClient();
    const userId = user.id;

    // Build answers JSONB object
    const answers: Record<string, number> = {};
    if (independent_vs_team !== undefined) answers.independent_vs_team = independent_vs_team;
    if (structured_vs_open !== undefined) answers.structured_vs_open = structured_vs_open;
    if (fast_vs_steady !== undefined) answers.fast_vs_steady = fast_vs_steady;
    if (quick_vs_thorough !== undefined) answers.quick_vs_thorough = quick_vs_thorough;
    if (hands_on_vs_strategic !== undefined) answers.hands_on_vs_strategic = hands_on_vs_strategic;
    if (feedback_vs_autonomy !== undefined) answers.feedback_vs_autonomy = feedback_vs_autonomy;
    if (innovation_vs_process !== undefined) answers.innovation_vs_process = innovation_vs_process;
    if (flexible_vs_schedule !== undefined) answers.flexible_vs_schedule = flexible_vs_schedule;

    // Check if behaviour already exists
    const { data: existingBehaviour } = await supabase
      .from('applicant_behaviour')
      .select('id')
      .eq('user_id', userId)
      .single();

    const behaviourData: any = {
      answers: answers,
    };

    // Add individual columns if values are provided
    if (independent_vs_team !== undefined) behaviourData.independent_vs_team = independent_vs_team;
    if (structured_vs_open !== undefined) behaviourData.structured_vs_open = structured_vs_open;
    if (fast_vs_steady !== undefined) behaviourData.fast_vs_steady = fast_vs_steady;
    if (quick_vs_thorough !== undefined) behaviourData.quick_vs_thorough = quick_vs_thorough;
    if (hands_on_vs_strategic !== undefined) behaviourData.hands_on_vs_strategic = hands_on_vs_strategic;
    if (feedback_vs_autonomy !== undefined) behaviourData.feedback_vs_autonomy = feedback_vs_autonomy;
    if (innovation_vs_process !== undefined) behaviourData.innovation_vs_process = innovation_vs_process;
    if (flexible_vs_schedule !== undefined) behaviourData.flexible_vs_schedule = flexible_vs_schedule;

    // Use RPC function to bypass RLS
    const { data: behaviourId, error: rpcError } = await supabase.rpc(
      'insert_or_update_applicant_behaviour',
      {
        p_user_id: userId,
        p_answers: answers,
        p_independent_vs_team: behaviourData.independent_vs_team || null,
        p_structured_vs_open: behaviourData.structured_vs_open || null,
        p_fast_vs_steady: behaviourData.fast_vs_steady || null,
        p_quick_vs_thorough: behaviourData.quick_vs_thorough || null,
        p_hands_on_vs_strategic: behaviourData.hands_on_vs_strategic || null,
        p_feedback_vs_autonomy: behaviourData.feedback_vs_autonomy || null,
        p_innovation_vs_process: behaviourData.innovation_vs_process || null,
        p_flexible_vs_schedule: behaviourData.flexible_vs_schedule || null,
      }
    );

    if (rpcError) {
      console.error('RPC function error:', rpcError);
      
      // Fallback: Try direct insert/update
      if (existingBehaviour) {
        const { error: updateError } = await supabase
          .from('applicant_behaviour')
          .update(behaviourData)
          .eq('user_id', userId);

        if (updateError) {
          console.error('Behaviour update error:', updateError);
          return NextResponse.json(
            { error: 'Failed to update behaviour', details: updateError.message },
            { status: 500 }
          );
        }
      } else {
        const { error: insertError } = await supabase
          .from('applicant_behaviour')
          .insert({
            user_id: userId,
            ...behaviourData,
          });

        if (insertError) {
          console.error('Behaviour insert error:', insertError);
          return NextResponse.json(
            { error: 'Failed to create behaviour', details: insertError.message },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      behaviour: behaviourData,
    });
  } catch (error: any) {
    console.error('Behaviour update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

