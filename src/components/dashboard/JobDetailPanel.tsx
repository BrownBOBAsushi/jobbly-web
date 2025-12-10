// src/components/dashboard/JobDetailPanel.tsx
'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function JobDetailPanel() {
  const { matchedJobs, selectedJobId } = useApp();

  const selectedJob = matchedJobs.find((job) => job.id === selectedJobId);

  if (!selectedJob) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-full flex items-center justify-center">
        <p className="text-gray-500 text-center">
          Select a job from the list to view details.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedJob.title}
            </h1>
            <p className="text-lg text-gray-700">{selectedJob.company}</p>
          </div>
          <div className="text-right">
            <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">
              {selectedJob.matchConfidence}% Match
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div>
            <span className="font-semibold">Location:</span> {selectedJob.location}
          </div>
          <div>
            <span className="font-semibold">Mode:</span> {selectedJob.modeOfWork}
          </div>
          <div>
            <span className="font-semibold">Type:</span> {selectedJob.employmentType}
          </div>
          <div>
            <span className="font-semibold">Salary:</span> {selectedJob.salaryRange}
          </div>
          <div>
            <span className="font-semibold">Posted:</span> {selectedJob.postedDate}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {selectedJob.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {selectedJob.matchReasoning && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Match Reasoning:</span>{' '}
              {selectedJob.matchReasoning}
            </p>
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 font-sans">
            {selectedJob.description}
          </pre>
        </div>
      </div>
    </div>
  );
}

