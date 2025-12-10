// src/components/dashboard/DashboardLayout.tsx
import React from 'react';
import { useApp } from '@/context/AppContext'; // Import context
import DashboardHeader from './DashboardHeader';
import ProfilePanel from './ProfilePanel';
import MatchedJobsList from './MatchedJobsList';
import JobDetailPanel from './JobDetailPanel';

export default function DashboardLayout() {
  const { selectedJobId } = useApp(); // Get state

  return (
    <div className="min-h-screen flex flex-col" style={{ 
      background: '#FAF5FF',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif"
    }}>
      <DashboardHeader />
      
      <main className="flex-1 overflow-hidden p-6 relative">
        <div className="h-full grid grid-cols-12 gap-6">
          
          {/* LEFT: Profile (Hidden on small mobile if viewing a job, optional tweak) */}
          <div className="hidden lg:block lg:col-span-3 h-full overflow-y-auto">
            <ProfilePanel />
          </div>
          
          {/* MIDDLE: Job List */}
          {/* Logic: Hidden on mobile IF a job is selected. Visible on desktop always. */}
          <div className={`
            h-full overflow-y-auto
            col-span-12 md:col-span-4 lg:col-span-3
            ${selectedJobId ? 'hidden md:block' : 'block'} 
          `}>
            <MatchedJobsList />
          </div>
          
          {/* RIGHT: Job Detail */}
          {/* Logic: Visible on mobile IF a job is selected. Visible on desktop always. */}
          <div className={`
             h-full overflow-y-auto
             col-span-12 md:col-span-8 lg:col-span-6
             ${selectedJobId ? 'block' : 'hidden md:block'}
          `}>
             <JobDetailPanel />
          </div>

        </div>
      </main>
    </div>
  );
}