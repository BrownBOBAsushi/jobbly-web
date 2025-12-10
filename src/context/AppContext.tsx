// src/context/AppContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, JobMatch, ApplicantProfile } from '@/types';
import { MOCK_USER, MOCK_JOBS, MOCK_PREFS, MOCK_BEHAVIOUR } from '@/services/MockData';

interface AppContextType extends AppState {
  setSelectedJobId: (id: string) => void;
  runMatchingAnalysis: () => Promise<void>; // Triggers the "AI" loading
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user] = useState(MOCK_USER);
  const [preferences] = useState(MOCK_PREFS);
  const [behaviour] = useState(MOCK_BEHAVIOUR);
  const [matchedJobs, setMatchedJobs] = useState<JobMatch[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulates the Groq AI analysis
  const runMatchingAnalysis = async () => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Filter jobs >= 90% confidence & Sort by highest confidence
    const highConfidenceJobs = MOCK_JOBS
      .filter(job => job.matchConfidence >= 90)
      .sort((a, b) => b.matchConfidence - a.matchConfidence);

    setMatchedJobs(highConfidenceJobs);
    
    // Default select the first job
    if (highConfidenceJobs.length > 0) {
      setSelectedJobId(highConfidenceJobs[0].id);
    }
    
    setIsLoading(false);
  };

  return (
    <AppContext.Provider value={{
      user,
      preferences,
      behaviour,
      matchedJobs,
      selectedJobId,
      isLoading,
      setSelectedJobId,
      runMatchingAnalysis
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};