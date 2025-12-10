import React from 'react';
import { Applicant, Job } from '@/lib/mock-data';
import { CheckCircle } from 'lucide-react';

interface Props {
  applicant: Applicant;
  jobTitle: string;
}

export default function ApplicantDetailView({ applicant, jobTitle }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{applicant.name}</h2>
        <p className="text-gray-500 font-medium mt-1">Applying for {jobTitle}</p>
      </div>

      {/* 1. Why you matched (Score Tiles) */}
      <div className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
          <span className="text-blue-500">⚡</span> Why you matched
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <ScoreTile label="Skills" score={applicant.scores.skills} />
          <ScoreTile label="Culture" score={applicant.scores.behavior} />
          <ScoreTile label="Prefs" score={applicant.scores.preferences} />
        </div>
      </div>

      {/* 2. Match Breakdown (Tags) */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-800">Match Breakdown</h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {applicant.matchScore}% Total
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {applicant.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 3. AI Summary */}
      <div className="mb-8 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <h3 className="text-blue-800 font-bold text-sm mb-2">AI Summary</h3>
        <p className="text-blue-900 text-sm leading-relaxed">
          {applicant.summary}
        </p>
      </div>

      {/* 4. Action Button */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <button className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
           <CheckCircle size={18} />
           Schedule Interview
        </button>
      </div>
    </div>
  );
}

// Small helper component for the score boxes
function ScoreTile({ label, score }: { label: string; score: number }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">{score}%</div>
    </div>
  );
}