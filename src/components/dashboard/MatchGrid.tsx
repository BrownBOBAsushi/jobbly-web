import React from 'react';

// 1. Define the props for the TagBox to fix the "implicit any" error
interface TagBoxProps {
  label: string;
  isMatch: boolean;
}

// 2. Data Setup (The specific Skills & Behaviours)
const jobData = {
  skills: [
    { label: "Community", match: true },
    { label: "Discord", match: true },
    { label: "Content", match: true },
    { label: "Web3", match: true } 
  ],
  behaviours: [
    { label: "Autonomous", match: true },
    { label: "Fast-Paced", match: true },
    { label: "Open-Ended", match: true },
    { label: "Innovator", match: false } // Greyed out to show a "miss"
  ]
};

const MatchGrid = () => {
  return (
    <div className="w-full bg-white rounded-lg p-4 border border-gray-100 mt-4 mb-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Match Breakdown</h3>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          96% Total
        </span>
      </div>

      {/* Row 1: Skills */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">
          Required Skills
        </p>
        <div className="grid grid-cols-4 gap-2">
          {jobData.skills.map((item, index) => (
            <TagBox key={index} label={item.label} isMatch={item.match} />
          ))}
        </div>
      </div>

      {/* Row 2: Behaviours */}
      <div>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-2">
          Target Behaviour
        </p>
        <div className="grid grid-cols-4 gap-2">
          {jobData.behaviours.map((item, index) => (
            <TagBox key={index} label={item.label} isMatch={item.match} />
          ))}
        </div>
      </div>

    </div>
  );
};

// 3. The Sub-component with the Type Definition added
const TagBox = ({ label, isMatch }: TagBoxProps) => { 
  return (
    <div 
      className={`
        flex items-center justify-center 
        h-8 text-[10px] sm:text-xs font-medium text-center rounded-md border transition-all
        ${isMatch 
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-gray-50 border-gray-200 text-gray-400"
        }
      `}
    >
      {label}
    </div>
  );
};

export default MatchGrid;