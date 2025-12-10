// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function DashboardHeader() {
  const { user } = useApp();
  const userName = user?.name || 'Applicant';

  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm px-6 lg:px-8 h-16 flex items-center justify-between" style={{
      borderColor: 'rgba(124, 58, 237, 0.1)',
      boxShadow: '0 1px 2px rgba(124, 58, 237, 0.05)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif"
    }}>
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
          transform: 'rotate(45deg)'
        }}>
          <div className="w-4 h-4 border-2 border-white rounded" style={{ transform: 'rotate(-45deg)' }}></div>
        </div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: '#1F2937' }}>
          SwiftJobs
        </h1>
      </div>
      
      {/* Center Greeting */}
      <span className="hidden md:block font-medium text-sm" style={{ color: '#6B7280' }}>
        Good morning, {userName}
      </span>

      {/* Far Right Icons */}
      <div className="flex items-center gap-3">
        {/* Messages Icon */}
        <button 
          className="p-2 rounded-xl transition-all hover:transform hover:-translate-y-0.5"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)';
            e.currentTarget.style.color = '#7C3AED';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        {/* Notifications Icon */}
        <button 
          className="p-2 rounded-xl transition-all relative hover:transform hover:-translate-y-0.5"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)';
            e.currentTarget.style.color = '#7C3AED';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full ring-2 ring-white" style={{ background: '#EF4444' }} />
        </button>
      </div>
    </header>
  );
}