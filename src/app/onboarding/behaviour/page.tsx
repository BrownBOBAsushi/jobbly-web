'use client';

import { useOnboarding } from '../../../components/onboarding/OnboardingContext';
import { useRouter } from 'next/navigation';
import { BehaviourChoice } from '../../../components/onboarding/BehaviourChoice'; // <--- NEW IMPORT
import { BehaviourState } from '../../../components/onboarding/types';

export default function BehaviourPage() {
  const router = useRouter();
  const { data, updateBehaviour, markStepComplete, finalSubmit } = useOnboarding();
  const { behaviour } = data;

  const handleBack = () => {
    router.push('/onboarding/preference');
  };

  const handleFinish = () => {
    markStepComplete(3);
    finalSubmit(); // Triggers the console log & alert
    // In a real app, you might redirect to a dashboard here:
    // router.push('/dashboard'); 
  };

  // Helper to update specific fields
  const setVal = (key: keyof BehaviourState) => (val: number) => {
    updateBehaviour({ [key]: val });
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
      
      <header className="mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900">Behaviour</h2>
        <p className="text-lg text-gray-500 mt-1">Select the option that best describes how you want your agent to operate.</p>
      </header>

      <div className="space-y-4"> {/* Increased spacing for better separation */}
        
        <BehaviourChoice
          label="Collaboration Style"
          leftText="Works Independently"
          rightText="Prefers Team Work"
          value={behaviour.independentVsTeam}
          onChange={setVal('independentVsTeam')}
        />
        <BehaviourChoice
          label="Task Approach"
          leftText="Highly Structured"
          rightText="Open-ended & Flexible"
          value={behaviour.structuredVsOpen}
          onChange={setVal('structuredVsOpen')}
        />
        <BehaviourChoice
          label="Environment Pace"
          leftText="Steady & Detailed"
          rightText="Fast-paced & Urgent"
          value={behaviour.fastVsSteady}
          onChange={setVal('fastVsSteady')}
        />
        <BehaviourChoice
          label="Decision Making"
          leftText="Thorough & Slow"
          rightText="Quick & Decisive"
          value={behaviour.quickVsThorough}
          onChange={setVal('quickVsThorough')}
        />
        <BehaviourChoice
          label="Work Focus"
          leftText="Hands-on Execution"
          rightText="Strategic Oversight"
          value={behaviour.handsOnVsStrategic}
          onChange={setVal('handsOnVsStrategic')}
        />
        <BehaviourChoice
          label="Supervision"
          leftText="Frequent Feedback Needed"
          rightText="High Autonomy Preferred"
          value={behaviour.feedbackVsAutonomy}
          onChange={setVal('feedbackVsAutonomy')}
        />
         <BehaviourChoice
          label="Process Orientation"
          leftText="Follows Strict Processes"
          rightText="Prioritizes Innovation"
          value={behaviour.innovationVsProcess}
          onChange={setVal('innovationVsProcess')}
        />
         <BehaviourChoice
          label="Schedule"
          leftText="Adheres to Set Schedule"
          rightText="Requires High Flexibility"
          value={behaviour.flexibleVsSchedule}
          onChange={setVal('flexibleVsSchedule')}
        />
      </div>

      <footer className="mt-8 pt-6 border-t flex justify-between">
        <button
          onClick={handleBack}
          type="button"
          className="px-6 py-3 text-lg font-semibold rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleFinish}
          className="px-8 py-3 text-lg font-semibold rounded-lg bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-all"
        >
          Save & Finish
        </button>
      </footer>
    </div>
  );
}