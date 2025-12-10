// src/app/dashboard/page.tsx
'use client';

import { useApp } from '@/context/AppContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, isLoading } = useApp();
  const router = useRouter();
  
  // Guard against direct access before analysis is run (e.g. if state is not loaded)
  if (!user && !isLoading) {
    // If user somehow lands here without state, redirect to analysis (or landing)
    // For now, we just redirect back to the loading screen to reload state
    // In a real app, we'd check for a session/cookie
    router.replace('/analysis'); 
    return null;
  }
  
  // A simple loading placeholder if the state is still initializing
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <DashboardLayout />;
}