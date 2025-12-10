// src/app/analysis/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

const LOADING_STEPS = [
  "Analysing your profile preferences...",
  "Scanning HR requirements...",
  "Calibrating behaviour metrics...",
  "Calculating match confidence scores..."
];

export default function AnalysisPage() {
  const router = useRouter();
  const { runMatchingAnalysis, isLoading } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Start the heavy lifting
    runMatchingAnalysis();

    // Cycle through messages every 800ms
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 800);

    return () => clearInterval(interval);
  }, [runMatchingAnalysis]);

  useEffect(() => {
    if (!isLoading) {
      router.replace('/dashboard');
    }
  }, [isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
      <div className="relative w-24 h-24 mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        {/* Spinning Ring */}
        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        {/* Brain/AI Icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
           <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-gray-900 mb-2 transition-all duration-500 min-h-[2rem] text-center">
        {LOADING_STEPS[currentStepIndex]}
      </h2>
      <p className="text-gray-500 text-sm">Powered by Groq AI</p>
    </div>
  );
}