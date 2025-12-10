// src/components/dashboard/MatchedJobsList.tsx
import React from 'react';
import { useApp } from '@/context/AppContext';
import JobCard from './JobCard';

export default function MatchedJobsList() {
  const { matchedJobs, selectedJobId, setSelectedJobId, isLoading } = useApp();

  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
  };

  const isListEmpty = matchedJobs.length === 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full flex flex-col p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Matched Roles ({matchedJobs.length})</h2>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <p>Analysis in progress...</p>
        </div>
      )}

      {!isLoading && isListEmpty && (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg h-full">
          <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-5 0h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          <p className="text-center">No matched jobs found above 90% confidence.</p>
          <p className="text-sm mt-1">Try updating your preferences or behaviour.</p>
        </div>
      )}

      {!isLoading && !isListEmpty && (
        <div className="flex-1 overflow-y-auto pr-2">
          {matchedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSelected={job.id === selectedJobId}
              onSelect={handleSelectJob}
            />
          ))}
        </div>
      )}
    </div>
  );
}