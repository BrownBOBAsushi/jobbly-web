// src/app/api/applicant/preferences/route.ts
// PATCH /api/applicant/preferences - Save/update applicant preferences

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
      target_job_title,
      role_level,
      salary_min,
      salary_max,
      mode_of_work,
    } = body;

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

    const supabase = createServiceRoleClient();
    const userId = user.id;

    // Check if preferences already exist
    const { data: existingPrefs } = await supabase
      .from('applicant_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();

    const preferencesData: any = {};
    if (target_job_title !== undefined) preferencesData.target_job_title = target_job_title;
    if (role_level !== undefined) preferencesData.role_level = role_level;
    if (salary_min !== undefined) preferencesData.salary_min = salary_min;
    if (salary_max !== undefined) preferencesData.salary_max = salary_max;
    if (mode_of_work !== undefined) preferencesData.mode_of_work = mode_of_work;

    // Use RPC function to bypass RLS
    const { data: prefId, error: rpcError } = await supabase.rpc(
      'insert_or_update_applicant_preferences',
      {
        p_user_id: userId,
        p_target_job_title: preferencesData.target_job_title || null,
        p_role_level: preferencesData.role_level || null,
        p_salary_min: preferencesData.salary_min || null,
        p_salary_max: preferencesData.salary_max || null,
        p_mode_of_work: preferencesData.mode_of_work || null,
      }
    );

    if (rpcError) {
      console.error('RPC function error:', rpcError);
      
      // Fallback: Try direct insert/update
      if (existingPrefs) {
        const { error: updateError } = await supabase
          .from('applicant_preferences')
          .update(preferencesData)
          .eq('user_id', userId);

        if (updateError) {
          console.error('Preferences update error:', updateError);
          return NextResponse.json(
            { error: 'Failed to update preferences', details: updateError.message },
            { status: 500 }
          );
        }
      } else {
        const { error: insertError } = await supabase
          .from('applicant_preferences')
          .insert({
            user_id: userId,
            ...preferencesData,
          });

        if (insertError) {
          console.error('Preferences insert error:', insertError);
          return NextResponse.json(
            { error: 'Failed to create preferences', details: insertError.message },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      preferences: preferencesData,
    });
  } catch (error: any) {
    console.error('Preferences update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

