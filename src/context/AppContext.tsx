// src/context/AppContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AppState, JobMatch, ApplicantProfile } from '@/types';
import { MOCK_USER, MOCK_JOBS, MOCK_PREFS, MOCK_BEHAVIOUR } from '@/services/MockData';

interface AppContextType extends AppState {
  setSelectedJobId: (id: string) => void;
  runMatchingAnalysis: () => Promise<void>; // Triggers the "AI" loading
  refreshMatches: () => Promise<void>; // Refresh matches from API
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [user, setUser] = useState(MOCK_USER);
  const [preferences, setPreferences] = useState(MOCK_PREFS);
  const [behaviour] = useState(MOCK_BEHAVIOUR);
  const [matchedJobs, setMatchedJobs] = useState<JobMatch[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<'applicant' | 'hr' | null>(null);

  // Check user role and fetch user data on mount
  useEffect(() => {
    const checkUserRoleAndFetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          // Try to get role from user metadata or check email pattern
          const roleFromMetadata = authUser.user_metadata?.role;
          const email = authUser.email?.toLowerCase() || '';
          const inferredRole = roleFromMetadata || 
            (email.includes('hr@') || email.includes('hiring@') || email.includes('recruiter@') ? 'hr' : 'applicant');
          setUserRole(inferredRole as 'applicant' | 'hr');
          
          // Fetch real user data if applicant
          if (inferredRole === 'applicant') {
            try {
              const response = await fetch('/api/applicant/user', {
                credentials: 'include',
              });
              if (response.ok) {
                const data = await response.json();
                if (data.user) {
                  setUser({
                    id: data.user.id,
                    name: data.user.name,
                    roleLevel: data.user.roleLevel,
                    avatarUrl: '/avatars/default.png',
                    bio: '',
                  });
                }
                if (data.preferences) {
                  setPreferences({
                    targetSalaryRange: data.preferences.targetSalaryRange,
                    preferredMode: data.preferences.preferredMode,
                    locations: [],
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              // Keep using mock data as fallback
            }
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };
    checkUserRoleAndFetchData();
  }, []);

  // Fetch matches from API (only for applicants)
  const refreshMatches = async () => {
    // Skip if user is HR or role is not determined yet
    if (userRole === 'hr') {
      console.log('⏭️ Skipping applicant matches fetch - user is HR');
      return;
    }
    
    if (userRole === null) {
      console.log('⏭️ Skipping applicant matches fetch - role not determined yet');
      return;
    }
    try {
      setIsLoading(true);
      console.log('🔄 Fetching matches from API...');
      const response = await fetch('/api/applicant/matches', {
        credentials: 'include',
      });

      if (!response.ok) {
        // If 404, it might mean profile doesn't exist yet (user hasn't completed onboarding)
        if (response.status === 404) {
          console.warn('⚠️ Profile not found - user may not have completed onboarding');
          setMatchedJobs([]);
          setIsLoading(false);
          return;
        }
        const errorText = await response.text();
        console.error('❌ API response error:', response.status, errorText);
        throw new Error(`Failed to fetch matches: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle case where profile doesn't exist yet
      if (!data.profile && (!data.matches || data.matches.length === 0)) {
        console.warn('⚠️ No profile or matches found - user may need to complete onboarding');
        setMatchedJobs([]);
        setIsLoading(false);
        return;
      }
      console.log('✅ API response received:', {
        matchesCount: data.matches?.length || 0,
        matches: data.matches?.map((m: any) => ({ 
          job: m.job?.title, 
          score: m.overall_score 
        })) || []
      });
      
      // Transform API response to JobMatch format
      const allMatches = (data.matches || []);
      console.log(`📊 Total matches before filtering: ${allMatches.length}`);
      
      const transformedMatches: JobMatch[] = allMatches
        .filter((match: any) => {
          // Show matches >= 0 for now (can filter to >= 90 later for production)
          // For showcase, we want to show at least the top matches
          const passes = match.overall_score >= 0;
          if (!passes) {
            console.log(`⏭️ Filtered out match (score ${match.overall_score} < 0):`, match.job?.title);
          }
          return passes;
        })
        .map((match: any) => {
          const job = match.job || {};
          const preferences = job.preferences || {};
          const skills = job.skills || match.jobDetails?.skills || [];
          
          // Map mode_of_work to ModeOfWork type
          const modeOfWorkMap: Record<string, 'Remote' | 'On-site' | 'Hybrid'> = {
            'Work from Home': 'Remote',
            'On site': 'On-site',
            'Hybrid': 'Hybrid',
          };
          
          const modeOfWork = preferences.mode_of_work 
            ? (modeOfWorkMap[preferences.mode_of_work] || 'Hybrid')
            : 'Hybrid';
          
          // Format salary range
          const salaryRange = preferences.salary_min && preferences.salary_max
            ? `$${preferences.salary_min} - $${preferences.salary_max}`
            : 'Not specified';
          
          return {
            id: job.id || match.id,
            title: job.title || 'Unknown Job',
            company: 'Company', // TODO: Add company field to jobs table
            location: 'Location TBD', // TODO: Add location field to jobs table
            modeOfWork: modeOfWork,
            employmentType: 'Full-time' as const, // TODO: Add employment type to jobs table
            salaryRange: salaryRange,
            tags: Array.isArray(skills) ? skills : (typeof skills === 'string' ? [skills] : []),
            description: job.jd_text || job.description || '',
            postedDate: match.created_at || new Date().toISOString(),
            logoUrl: undefined,
            matchConfidence: match.overall_score,
            matchDetails: {
              skillMatch: match.skills_score || 0,
              cultureMatch: match.behaviour_score || 0,
              preferenceMatch: match.prefs_score || 0,
              reason: match.ai_summary || `Skills: ${match.skills_score}%, Behaviour: ${match.behaviour_score}%, Preferences: ${match.prefs_score}%`,
            },
            status: match.status || 'pending',
            interviewScheduledAt: match.interview_scheduled_at || null,
          };
        })
        .sort((a: JobMatch, b: JobMatch) => b.matchConfidence - a.matchConfidence);

      console.log(`✅ Matches after filtering (>=90%): ${transformedMatches.length}`);
      setMatchedJobs(transformedMatches);
      
      // Default select the first job
      if (transformedMatches.length > 0) {
        setSelectedJobId(transformedMatches[0].id);
      }
    } catch (error) {
      console.error('❌ Error fetching matches:', error);
      // Fallback to empty array on error
      setMatchedJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load matches on mount (only for applicants and on applicant routes)
  useEffect(() => {
    // Only fetch if:
    // 1. User role is 'applicant' (or null/not determined yet - will retry)
    // 2. We're on an applicant-related route (dashboard, onboarding, etc.)
    const isApplicantRoute = pathname?.startsWith('/dashboard') || 
                             pathname?.startsWith('/onboarding') ||
                             pathname === '/';
    
    if (isApplicantRoute && userRole !== 'hr') {
      refreshMatches();
    }
  }, [userRole, pathname]);

  // Simulates the Groq AI analysis (kept for backward compatibility)
  const runMatchingAnalysis = async () => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Use API instead of mock data
    await refreshMatches();
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
      runMatchingAnalysis,
      refreshMatches
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