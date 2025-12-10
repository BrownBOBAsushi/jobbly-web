// src/components/dashboard/MatchedJobsList.tsx
'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function MatchedJobsList() {
  const { matchedJobs, selectedJobId, setSelectedJobId } = useApp();

  if (matchedJobs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-full flex items-center justify-center">
        <p className="text-gray-500 text-center">
          No matched jobs yet. Run the analysis to find matches.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Matched Jobs ({matchedJobs.length})
      </h2>
      <div className="space-y-3">
        {matchedJobs.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelectedJobId(job.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedJobId === job.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company}</p>
              </div>
              <div className="ml-2 text-right">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                  {job.matchConfidence}%
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {job.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {job.location} • {job.salaryRange}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

