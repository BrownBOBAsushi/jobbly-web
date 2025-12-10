// src/components/dashboard/DashboardHeader.tsx
import React from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function DashboardHeader() {
  const { user } = useApp();
  const userName = user?.name || 'Applicant';

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      {/* Logo */}
      <h1 className="text-xl font-bold text-gray-900 tracking-tight">
        <span className="text-indigo-600">Swift</span>Job
      </h1>
      
      {/* Center Greeting */}
      <span className="hidden md:block text-gray-600 font-medium text-sm">
        Good morning, {userName}
      </span>

      {/* Far Right Icons */}
      <div className="flex items-center space-x-3">
        {/* Messages Icon */}
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
          <MessageSquare className="w-5 h-5" />
        </button>
        {/* Notifications Icon */}
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-4 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400" />
        </button>
      </div>
    </header>
  );
}