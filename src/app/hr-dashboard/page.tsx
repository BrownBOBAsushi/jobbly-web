'use client';

import React, { useState, useMemo } from 'react';
// The import paths should reference your components folder correctly
import { JOBS, APPLICANTS } from '@/lib/mock-data';
import JobSelector from '@/components/hr-dashboard/JobSelector';
import JobInfoPanel from '@/components/hr-dashboard/JobInfoPanel';
import ApplicantList from '@/components/hr-dashboard/ApplicantList';
import ApplicantDetailView from '@/components/hr-dashboard/ApplicantDetailView';

export default function HrDashboardPage() {
  // --- STATE ---
  // 1. Which job is selected? (Default to first job, 'job-1')
  const [selectedJobId, setSelectedJobId] = useState(JOBS[0].id);
  
  // 2. Which applicant is selected? (We will set default in the logic below)
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

  // --- LOGIC ---

  // A. Find the full Job object based on ID
  const selectedJob = JOBS.find((j) => j.id === selectedJobId) || JOBS[0];

  // B. Filter applicants for this job & sort by score (Highest first)
  const filteredApplicants = useMemo(() => {
    // 1. Filter: Only applicants for the currently selected job
    // 2. Sort: Use the matchScore property to sort in descending order (highest score first)
    return APPLICANTS
      .filter((app) => app.jobId === selectedJobId)
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [selectedJobId]);

  // C. Determine which applicant to show in the Right Column
  // If the user hasn't clicked one, default to the ID of the top match (index 0).
  const activeApplicantId = selectedApplicantId || filteredApplicants[0]?.id;
  const activeApplicant = filteredApplicants.find((a) => a.id === activeApplicantId);

  // D. Handler: When user switches Job, reset selected applicant state
  const handleJobSwitch = (newJobId: string) => {
    setSelectedJobId(newJobId);
    setSelectedApplicantId(null); // This makes the Right Column default to the top match of the new job
  };

  return (
    // The main container sets the background and defines the flex column layout
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col h-screen overflow-hidden">
      
      {/* HEADER ROW (Top Bar) */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
        <div className="text-sm text-gray-500">SwiftJob Inc.</div>
      </div>

      {/* MAIN CONTENT GRID (3 Columns) */}
      <div className="grid grid-cols-12 gap-6 flex-1 h-full min-h-0">
        
        {/* COLUMN 1: Job Details (3/12 width) */}
        <div className="col-span-3 bg-white rounded-2xl p-6 border border-gray-200 overflow-y-auto">
          <JobSelector 
            jobs={JOBS} 
            selectedJobId={selectedJobId} 
            onSelect={handleJobSwitch} 
          />
          <JobInfoPanel job={selectedJob} />
        </div>

        {/* COLUMN 2: Applicant List (3/12 width) */}
        <div className="col-span-3 flex flex-col min-h-0">
          <ApplicantList 
            applicants={filteredApplicants}
            selectedApplicantId={activeApplicantId}
            onSelect={setSelectedApplicantId}
          />
        </div>

        {/* COLUMN 3: Detail View (6/12 width) */}
        <div className="col-span-6 flex flex-col min-h-0">
          {activeApplicant ? (
            <ApplicantDetailView 
              applicant={activeApplicant} 
              jobTitle={selectedJob.title}
            />
          ) : (
            // Fallback UI if no applicants are found for a job
            <div className="h-full flex items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-200">
              No applicants found for this job.
            </div>
          )}
        </div>

      </div>
    </main>
  );
}