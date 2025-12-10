// app/onboarding/preference/page.tsx
'use client';

import { useOnboarding } from '../../../components/onboarding/OnboardingContext';
import { PreferenceState } from '../../../components/onboarding/types';
import { useRouter } from 'next/navigation';
import { SalaryRangeSlider } from '../../../components/onboarding/SalaryRangeSlider';

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

  // Validation: Check Job Title, Role, and Work Mode
  const isStepComplete = preference.jobTitle.trim().length > 0 && preference.role && preference.modeOfWork;

  const handleNext = () => {
    if (isStepComplete) {
      markStepComplete(2);
      router.push('/onboarding/behaviour');
    } else {
      alert("Please fill in all fields to proceed.");
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

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
      
      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900">Preference</h2>
        <p className="text-lg text-gray-500 mt-1">Tell us what you’re looking for</p>
      </header>

      <div className="space-y-10">

        {/* 1) Job Title Input (NEW) */}
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title
          </label>
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

        {/* 3) Salary Range Slider */}
        <SalaryRangeSlider
          min={1000}
          max={10000}
          step={500}
          initialMin={preference.salaryMin}
          initialMax={preference.salaryMax}
          onChange={handleSalaryChange}
        />
        
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
          disabled={!isStepComplete}
          className={`
            px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200
            ${isStepComplete
              ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Next
        </button>
      </footer>
    </div>
  );
}