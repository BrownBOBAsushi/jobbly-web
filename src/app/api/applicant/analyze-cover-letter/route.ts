// src/app/api/applicant/analyze-cover-letter/route.ts
// POST /api/applicant/analyze-cover-letter - Analyze cover letter and extract preferences

import { NextRequest, NextResponse } from 'next/server';
import { getServerUserWithRole } from '@/lib/supabase-server';
import { extractPreferencesFromCoverLetter } from '@/lib/groq-client';
import { createServiceRoleClient } from '@/lib/supabase-server';

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

    const { coverLetterText } = await request.json();

    if (!coverLetterText || typeof coverLetterText !== 'string') {
      return NextResponse.json(
        { error: 'Cover letter text is required' },
        { status: 400 }
      );
    }

    // If cover letter text is not provided, try to fetch from profile
    let textToAnalyze = coverLetterText;
    
    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      // Try to fetch cover letter from user's profile
      const supabase = createServiceRoleClient();
      const { data: profile } = await supabase
        .from('applicant_profiles')
        .select('cover_letter_url')
        .eq('user_id', user.id)
        .single();

      if (profile?.cover_letter_url) {
        // For now, we can't extract text from PDF/URL directly
        // The frontend should extract text before sending
        return NextResponse.json(
          { error: 'Please provide cover letter text. PDF extraction not yet supported.' },
          { status: 400 }
        );
      }
    }

    // Extract preferences using Groq
    const preferences = await extractPreferencesFromCoverLetter(textToAnalyze);

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error: any) {
    console.error('Error analyzing cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to analyze cover letter', details: error.message },
      { status: 500 }
    );
  }
}

