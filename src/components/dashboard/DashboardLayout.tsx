// src/components/dashboard/DashboardLayout.tsx
'use client';

import React from 'react';
import DashboardHeader from './DashboardHeader';
import ProfilePanel from './ProfilePanel';
import MatchedJobsList from './MatchedJobsList';
import JobDetailPanel from './JobDetailPanel';

interface DashboardLayoutProps {
  // We don't need props since all data comes from useApp()
}

export default function DashboardLayout({}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 1. Header: Fixed at the top */}
      <DashboardHeader />
      
      {/* 2. Main Content: Grid layout below header */}
      <div className="flex-1 overflow-hidden p-4" role="main">
        <div className="h-full grid grid-cols-12 gap-4">
          
          {/* Left Column: Applicant Panel (Fixed width, Scrollable inside) */}
          <div className="col-span-12 md:col-span-3 lg:col-span-3 h-full overflow-y-auto">
            <ProfilePanel />
          </div>
          
          {/* Middle Column: Matched Jobs List (Scrollable) */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3 h-full overflow-y-auto">
            <MatchedJobsList />
          </div>
          
          {/* Right Column: Job Detail Panel (Scrollable) */}
          {/* Hidden on small screens to enforce a better Master-Detail flow, if implemented */}
          <div className="col-span-12 md:col-span-5 lg:col-span-6 h-full overflow-y-auto">
            <JobDetailPanel />
          </div>
        </div>
      </div>
      
      {/* FUTURE: Consideration for mobile: We will need conditional rendering to stack or show only one pane at a time on small screens. For now, we will stick to the basic stacking model with responsive classes. */}
    </div>
  );
}