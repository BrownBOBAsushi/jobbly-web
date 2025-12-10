import React from 'react';
import { Applicant } from '@/lib/mock-data';

interface Props {
  applicants: Applicant[];
  selectedApplicantId: string;
  onSelect: (id: string) => void;
}

export default function ApplicantList({ applicants, selectedApplicantId, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto h-full pr-2">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-gray-50 py-2 z-10">
        Matched Applicants ({applicants.length})
      </h3>
      
      {applicants.map((app) => {
        const isSelected = app.id === selectedApplicantId;
        return (
          <div
            key={app.id}
            onClick={() => onSelect(app.id)}
            className={`cursor-pointer rounded-xl border p-4 transition-all shadow-sm
              ${isSelected 
                ? 'bg-white border-blue-500 ring-1 ring-blue-500' 
                : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
          >
            {/* Name and Score */}
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-bold text-gray-900">{app.name}</h4>
              <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">
                {app.matchScore}% Match
              </span>
            </div>

            {/* The 3 Info Bubbles */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                {app.preferences.role}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                {app.preferences.salary}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                {app.preferences.mode}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}