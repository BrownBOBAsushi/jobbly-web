import React from 'react';
import { HrOnboardingProvider } from '@/components/hr-onboarding/HrOnboardingProvider';
import HrOnboardingSidebar from '@/components/hr-onboarding/HrOnboardingSidebar';

export default function HrOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HrOnboardingProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-white">
        {/* Left Sidebar */}
        <HrOnboardingSidebar />
        
        {/* Right Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </HrOnboardingProvider>
  );
}