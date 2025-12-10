// src/app/api/hr/profile/route.ts
// POST /api/hr/profile - Create job posting and upload JD file

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getServerUserWithRole(request);
    if (!user) {
      console.error('❌ HR Profile API - No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 HR Profile API - User role check:', {
      email: user.email,
      role: user.role,
      user_metadata: user.user_metadata,
    });

    if (user.role !== 'hr') {
      console.error('❌ HR Profile API - Role mismatch:', {
        expected: 'hr',
        actual: user.role,
        user_metadata_role: user.user_metadata?.role,
      });
      return NextResponse.json({ error: 'Forbidden - HR access only' }, { status: 403 });
    }

    const formData = await request.formData();
    const jobTitle = formData.get('jobTitle') as string;
    const file = formData.get('file') as File | null;
    const jdText = formData.get('jdText') as string | null; // Optional text JD

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    // At least one of file or jdText should be provided
    if (!file && !jdText) {
      return NextResponse.json(
        { error: 'Either JD file or JD text is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const userId = user.id;

    let jdUrl: string | null = null;

    // Upload JD file if provided
    if (file) {
      const fileName = `${userId}-${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('resumes') // Using same bucket for JD files
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('JD file upload error:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload JD file', details: uploadError.message },
          { status: 500 }
        );
      }

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);
      jdUrl = publicUrl;
    }

    // Create job record using RPC function (bypasses RLS)
    const { data: jobData, error: rpcError } = await supabase.rpc('insert_job', {
      p_hr_user_id: userId,
      p_title: jobTitle,
      p_jd_text: jdText || null,
      p_jd_url: jdUrl,
      p_status: 'open',
    });

    if (rpcError) {
      console.error('Job creation RPC error:', rpcError);
      // Fallback: try direct insert
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          hr_user_id: userId,
          title: jobTitle,
          jd_text: jdText || null,
          jd_url: jdUrl,
          status: 'open',
        })
        .select()
        .single();

      if (jobError) {
        console.error('Job creation error (fallback):', jobError);
        return NextResponse.json(
          { error: 'Failed to create job', details: jobError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        job: {
          id: job.id,
          title: job.title,
          jd_text: job.jd_text,
          jd_url: job.jd_url,
          status: job.status,
        },
      });
    }

    // Handle RPC response - it might return UUID string or JSONB object
    let jobId: string | null = null;
    let job: any = null;

    if (!jobData) {
      return NextResponse.json(
        { error: 'Job created but no data returned' },
        { status: 500 }
      );
    }

    // Check if jobData is a UUID string (old function) or JSONB object (new function)
    if (typeof jobData === 'string') {
      // Old function returns UUID string - use it directly
      jobId = jobData;
      console.log('✅ Job created (UUID returned):', jobId);
      
      // Return job data with the ID and the data we already have
      // No need to fetch - we have all the info we need
      return NextResponse.json({
        success: true,
        job: {
          id: jobId,
          title: jobTitle,
          jd_text: jdText || null,
          jd_url: jdUrl || null,
          status: 'open',
        },
      });
    } else {
      // New function returns JSONB object
      job = jobData as any;
      jobId = job.id;
      console.log('✅ Job created (JSONB returned):', {
        jobId: job.id,
        title: job.title,
      });
    }

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job created but ID not found in response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: jobId,
        title: job.title || jobTitle,
        jd_text: job.jd_text || jdText || null,
        jd_url: job.jd_url || jdUrl || null,
        status: job.status || 'open',
      },
    });
  } catch (error: any) {
    console.error('HR profile creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
