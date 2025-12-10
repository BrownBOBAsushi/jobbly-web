import React from 'react';
import { Job } from '@/lib/mock-data';
import { Settings, Zap, ChevronRight } from 'lucide-react';

interface Props {
  job: Job;
}

export default function JobInfoPanel({ job }: Props) {
  return (
    <div className="space-y-8">
      {/* 1. Job Description Section */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
          Job Description
        </h3>
        <p className="text-gray-700 leading-relaxed text-sm">
          {job.description}
        </p>
      </div>

      <hr className="border-gray-200" />

      {/* 2. Stacked Edit Links (Preference & Behaviour) */}
      <div className="space-y-3">
        {/* Preference Link */}
        <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-md">
              <Settings size={18} />
            </div>
            <span className="font-medium text-gray-700">Preference</span>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500" />
        </button>

        {/* Behaviour Link */}
        <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-md">
              <Zap size={18} />
            </div>
            <span className="font-medium text-gray-700">Behaviour</span>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-500" />
        </button>
      </div>
    </div>
  );
}