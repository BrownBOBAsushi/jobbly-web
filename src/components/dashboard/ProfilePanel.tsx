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
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-8">
      
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-3 border-4 border-indigo-200">
          <User className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'Applicant'}</h2>
        <p className="text-sm text-gray-500">{user?.roleLevel || 'Role not specified'}</p>
      </div>

      <hr className="border-gray-100" />
      
      {/* Key Stats (Optional: Can display some behaviour scores here) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Target Salary:</span>
          <span className="font-medium text-gray-800">{preferences?.targetSalaryRange || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Preferred Mode:</span>
          <span className="font-medium text-gray-800">{preferences?.preferredMode.join(', ') || 'N/A'}</span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Navigation List */}
      <nav className="space-y-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavClick(item.route)}
            className="w-full flex items-center space-x-3 p-3 rounded-lg text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
          >
            <item.icon className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
      
    </div>
  );
}