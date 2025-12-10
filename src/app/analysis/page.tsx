// src/app/analysis/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AnalysisPage() {
  const router = useRouter();
  const { isLoading, runMatchingAnalysis } = useApp();

  useEffect(() => {
    // 1. Start the analysis immediately when the page loads
    runMatchingAnalysis();
  }, [runMatchingAnalysis]);

  useEffect(() => {
    // 2. Once loading is done, redirect to the dashboard
    if (!isLoading) {
      router.replace('/dashboard');
    }
  }, [isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      {/* Visual reference to the "AI Brain" / analysis */}
      <svg className="w-16 h-16 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {/* Placeholder for a brain or complex circuit icon (Groq AI Brain) */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <h1 className="mt-6 text-2xl font-semibold text-gray-800">
        Analysing your profile with Groq AI...
      </h1>
      <p className="mt-2 text-gray-500">
        Matching your preferences and behaviour against HR's needs.
      </p>
    </div>
  );
}