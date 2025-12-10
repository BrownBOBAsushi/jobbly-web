// src/app/api/hr/jobs/[jobId]/route.ts
// DELETE /api/hr/jobs/[jobId] - Delete a job

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, getServerUserWithRole } from '@/lib/supabase-server';

export async function DELETE(
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

    if (jobRpcError || !jobData) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const job = jobData as any;

    if (job.hr_user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - Job does not belong to you' },
        { status: 403 }
      );
    }

    // Delete job using RPC function (bypasses RLS)
    const { data: deleted, error: rpcError } = await supabase.rpc('delete_job', {
      p_job_id: jobId,
      p_hr_user_id: user.id,
    });

    if (rpcError) {
      console.error('Error deleting job (RPC):', rpcError);
      // Fallback: try direct delete
      const { error: deleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (deleteError) {
        console.error('Error deleting job (fallback):', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete job', details: deleteError.message },
          { status: 500 }
        );
      }
    } else if (deleted === false) {
      return NextResponse.json(
        { error: 'Job not found or does not belong to you' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

