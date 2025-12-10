// app/onboarding/layout.tsx
import { OnboardingProvider } from '../../components/onboarding/OnboardingContext';
import { ProgressSidebar } from '../../components/onboarding/ProgressSidebar';
import { ReactNode } from 'react';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  // Path resolving logic has been moved to ProgressSidebar (client component)
  return (
    <OnboardingProvider>
      <div className="flex h-screen bg-gray-50">
        
        {/* Left Sidebar (Desktop Fixed) */}
        <div className="hidden lg:block">
          <ProgressSidebar /> 
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </OnboardingProvider>
  );
}