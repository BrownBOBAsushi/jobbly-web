// src/components/dashboard/ProfilePanel.tsx
import React from 'react';
import { useRouter } from 'next/navigation';
import { User, ClipboardList, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const navItems = [
  { name: 'Profile', route: '/onboarding/profile', icon: User },
  { name: 'Preference', route: '/onboarding/preference', icon: ClipboardList },
  { name: 'Behaviour', route: '/onboarding/behaviour', icon: Zap },
];

export default function ProfilePanel() {
  const { user, preferences } = useApp();
  const router = useRouter();

  const handleNavClick = (route: string) => {
    // In a real app, this would open a side panel or navigate
    console.log(`Navigating to ${route} for update...`);
    router.push(route); // Simulating navigation back to onboarding
  };

  return (
    <div className="bg-white rounded-3xl p-6 space-y-8" style={{ 
      boxShadow: '0 2px 12px rgba(124, 58, 237, 0.06)',
      border: '1px solid rgba(124, 58, 237, 0.1)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif"
    }}>
      
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3" style={{ 
          background: 'rgba(124, 58, 237, 0.15)',
          border: '4px solid rgba(124, 58, 237, 0.2)'
        }}>
          <User className="w-10 h-10" style={{ color: '#7C3AED' }} />
        </div>
        <h2 className="text-xl font-semibold mb-1" style={{ color: '#1F2937' }}>{user?.name || 'Applicant'}</h2>
        <p className="text-sm" style={{ color: '#6B7280' }}>{user?.roleLevel || 'Role not specified'}</p>
      </div>

      <hr style={{ borderColor: 'rgba(124, 58, 237, 0.1)' }} />
      
      {/* Key Stats */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span style={{ color: '#6B7280' }}>Target Salary:</span>
          <span className="font-medium" style={{ color: '#1F2937' }}>{preferences?.targetSalaryRange || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span style={{ color: '#6B7280' }}>Preferred Mode:</span>
          <span className="font-medium" style={{ color: '#1F2937' }}>{preferences?.preferredMode.join(', ') || 'N/A'}</span>
        </div>
      </div>

      <hr style={{ borderColor: 'rgba(124, 58, 237, 0.1)' }} />

      {/* Navigation List */}
      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavClick(item.route)}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
            style={{ color: '#1F2937' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)';
              e.currentTarget.style.color = '#7C3AED';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#1F2937';
            }}
          >
            <item.icon className="w-5 h-5" style={{ color: 'inherit' }} />
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
      
    </div>
  );
}