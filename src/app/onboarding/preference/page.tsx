// app/onboarding/preference/page.tsx
'use client';

import { useOnboarding } from '../../../components/onboarding/OnboardingContext';
import { PreferenceState } from '../../../components/onboarding/types';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

type RoleType = PreferenceState['role'];
type WorkModeType = PreferenceState['modeOfWork'];

const ROLE_OPTIONS: NonNullable<RoleType>[] = ['Intern', 'Junior', 'Senior'];
const WORK_MODE_OPTIONS: NonNullable<WorkModeType>[] = ['Work from Home', 'On site', 'Hybrid'];

const SelectablePill: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      px-6 py-2 text-sm font-medium rounded-full transition-all duration-150
      ${isActive
        ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
        : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
      }
    `}
  >
    {label}
  </button>
);

export default function PreferencePage() {
  const router = useRouter();
  const { data, updatePreference, markStepComplete } = useOnboarding(); 
  const { preference } = data;
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasCoverLetter, setHasCoverLetter] = useState(false);

  // Validation: Check Job Title, Role, and Work Mode
  const isStepComplete = preference.jobTitle.trim().length > 0 && preference.role && preference.modeOfWork;

  const handleNext = async () => {
    if (!isStepComplete) {
      alert("Please fill in all fields to proceed.");
      return;
    }

    setSaving(true);
    try {
      // Map frontend values to backend format
      const modeOfWorkMap: Record<string, string> = {
        'Work from Home': 'Work from Home',
        'On site': 'On site',
        'Hybrid': 'Hybrid',
      };

      const response = await fetch('/api/applicant/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          target_job_title: preference.jobTitle,
          role_level: preference.role,
          salary_min: preference.salaryMin,
          salary_max: preference.salaryMax,
          mode_of_work: preference.modeOfWork ? modeOfWorkMap[preference.modeOfWork] : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save preferences');
      }

      markStepComplete(2);
      router.push('/onboarding/behaviour');
    } catch (error: any) {
      console.error('Preferences save error:', error);
      alert('Error saving preferences: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/profile');
  };
  
  const handleRoleChange = (role: RoleType) => updatePreference({ role });
  const handleWorkModeChange = (modeOfWork: WorkModeType) => updatePreference({ modeOfWork });
  const handleSalaryChange = (salaryMin: number, salaryMax: number) => 
    updatePreference({ salaryMin, salaryMax });
  
  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePreference({ jobTitle: e.target.value });
  };

  // Check if user has uploaded a cover letter
  useEffect(() => {
    const checkCoverLetter = async () => {
      try {
        const response = await fetch('/api/applicant/profile', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setHasCoverLetter(!!data.profile?.cover_letter_url);
        }
      } catch (error) {
        console.error('Error checking cover letter:', error);
      }
    };
    checkCoverLetter();
  }, []);

  const handleAutoFillFromCoverLetter = async () => {
    setAnalyzing(true);
    try {
      // Get cover letter text from profile
      const profileResponse = await fetch('/api/applicant/profile', {
        method: 'GET',
        credentials: 'include',
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profileData = await profileResponse.json();
      const coverLetterUrl = profileData.profile?.cover_letter_url;

      if (!coverLetterUrl) {
        alert('No cover letter found. Please upload a cover letter first.');
        setAnalyzing(false);
        return;
      }

      // For now, we'll need the user to paste the cover letter text
      // In the future, we can extract text from PDF
      const coverLetterText = prompt(
        'Please paste your cover letter text here (or we\'ll extract it from your uploaded file):'
      );

      if (!coverLetterText || coverLetterText.trim().length === 0) {
        setAnalyzing(false);
        return;
      }

      // Call API to analyze cover letter
      const analyzeResponse = await fetch('/api/applicant/analyze-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ coverLetterText }),
      });

      if (!analyzeResponse.ok) {
        const error = await analyzeResponse.json();
        throw new Error(error.error || 'Failed to analyze cover letter');
      }

      const { preferences } = await analyzeResponse.json();

      console.log('📋 Received preferences from API:', preferences);

      // Auto-fill form with extracted preferences
      let updates: Partial<PreferenceState> = {};
      
      // Extract job title and role level
      let jobTitle = preferences.job_title || '';
      let roleLevel = preferences.role_level;
      
      // Fallback: If job title contains role level but role_level wasn't extracted, extract it
      if (jobTitle && !roleLevel) {
        const titleLower = jobTitle.toLowerCase();
        if (titleLower.includes('senior')) {
          roleLevel = 'Senior';
          jobTitle = jobTitle.replace(/senior\s+/i, '').trim();
        } else if (titleLower.includes('junior')) {
          roleLevel = 'Junior';
          jobTitle = jobTitle.replace(/junior\s+/i, '').trim();
        } else if (titleLower.includes('lead')) {
          roleLevel = 'Lead';
          jobTitle = jobTitle.replace(/lead\s+/i, '').trim();
        } else if (titleLower.includes('intern')) {
          roleLevel = 'Intern';
          jobTitle = jobTitle.replace(/intern\s+/i, '').trim();
        }
      }
      
      // If we have a job title, set it
      if (jobTitle) {
        updates.jobTitle = jobTitle;
        console.log('✅ Setting job title:', jobTitle);
      }
      
      // If we have a role level, map and set it
      if (roleLevel) {
        // Map backend format to frontend format
        const roleMap: Record<string, PreferenceState['role']> = {
          'Intern': 'Intern',
          'Junior': 'Junior',
          'Senior': 'Senior',
          'Lead': 'Senior', // Map Lead to Senior for applicant
        };
        const mappedRole = roleMap[roleLevel];
        if (mappedRole) {
          updates.role = mappedRole;
          console.log('✅ Setting role level:', roleLevel, '→', mappedRole);
        }
      }
      
      if (preferences.salary_min) {
        updates.salaryMin = preferences.salary_min;
        console.log('✅ Setting salary min:', preferences.salary_min);
      }
      
      if (preferences.salary_max) {
        updates.salaryMax = preferences.salary_max;
        console.log('✅ Setting salary max:', preferences.salary_max);
      }
      
      if (preferences.mode_of_work) {
        // Map backend format to frontend format
        const workModeMap: Record<string, PreferenceState['modeOfWork']> = {
          'Work from Home': 'Work from Home',
          'On site': 'On site',
          'Hybrid': 'Hybrid',
        };
        const mappedWorkMode = workModeMap[preferences.mode_of_work];
        if (mappedWorkMode) {
          updates.modeOfWork = mappedWorkMode;
          console.log('✅ Setting work mode:', preferences.mode_of_work, '→', mappedWorkMode);
        }
      }
      
      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        updatePreference(updates);
        console.log('✅ Applied updates:', updates);
      } else {
        console.warn('⚠️ No preferences extracted from cover letter');
      }
      if (preferences.salary_min) {
        updatePreference({ salaryMin: preferences.salary_min });
      }
      if (preferences.salary_max) {
        updatePreference({ salaryMax: preferences.salary_max });
      }
      if (preferences.mode_of_work) {
        // Map backend format to frontend format
        const workModeMap: Record<string, PreferenceState['modeOfWork']> = {
          'Work from Home': 'Work from Home',
          'On site': 'On site',
          'Hybrid': 'Hybrid',
        };
        if (workModeMap[preferences.mode_of_work]) {
          updatePreference({ modeOfWork: workModeMap[preferences.mode_of_work] });
        }
      }

      alert('Preferences auto-filled from your cover letter! Please review and adjust as needed.');
    } catch (error: any) {
      console.error('Error auto-filling from cover letter:', error);
      alert('Error analyzing cover letter: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
      
      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900">Preference</h2>
        <p className="text-lg text-gray-500 mt-1">Tell us what you’re looking for</p>
      </header>

      <div className="space-y-10">

        {/* 1) Job Title Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            {hasCoverLetter && (
              <button
                type="button"
                onClick={handleAutoFillFromCoverLetter}
                disabled={analyzing}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                style={{
                  background: analyzing ? '#E5E7EB' : 'rgba(124, 58, 237, 0.1)',
                  color: analyzing ? '#9CA3AF' : '#7C3AED',
                }}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Auto-fill from Cover Letter
                  </>
                )}
              </button>
            )}
          </div>
          <input
            type="text"
            id="jobTitle"
            placeholder="e.g. Frontend Engineer"
            value={preference.jobTitle}
            onChange={handleJobTitleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
          />
        </div>

        {/* 2) Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Indicate Role</label>
          <div className="flex flex-wrap gap-4">
            {ROLE_OPTIONS.map((role) => (
              <SelectablePill
                key={role}
                label={role}
                isActive={preference.role === role}
                onClick={() => handleRoleChange(role)}
              />
            ))}
          </div>
        </div>

        {/* 3) Salary Range Inputs (Same as HR) */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Expected Salary Range (Per Month)
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="number"
                placeholder="$ Min"
                value={preference.salaryMin || ''}
                onChange={(e) => updatePreference({ salaryMin: Number(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 text-center"
                min="0"
                step="100"
              />
            </div>
            <div className="text-gray-700 font-medium">—</div>
            <div className="flex-1">
              <input
                type="number"
                placeholder="$ Max"
                value={preference.salaryMax || ''}
                onChange={(e) => updatePreference({ salaryMax: Number(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 text-center"
                min="0"
                step="100"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Enter the monthly base salary range.
          </p>
        </div>
        
        {/* 4) Mode of Work */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Mode of work</label>
          <div className="flex flex-wrap gap-4">
            {WORK_MODE_OPTIONS.map((mode) => (
              <SelectablePill
                key={mode}
                label={mode}
                isActive={preference.modeOfWork === mode}
                onClick={() => handleWorkModeChange(mode)}
              />
            ))}
          </div>
        </div>

      </div>

      <footer className="mt-10 pt-6 border-t flex justify-between">
        <button
          onClick={handleBack}
          type="button"
          className="px-6 py-3 text-lg font-semibold rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isStepComplete || saving}
          className={`
            px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200
            ${isStepComplete && !saving
              ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {saving ? 'Saving...' : 'Next'}
        </button>
      </footer>
    </div>
  );
}