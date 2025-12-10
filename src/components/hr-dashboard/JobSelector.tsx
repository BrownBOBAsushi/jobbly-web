import React from 'react';
import { Job } from '@/lib/mock-data';
import { ChevronDown } from 'lucide-react';

interface Props {
  jobs: Job[];
  selectedJobId: string;
  onSelect: (id: string) => void;
}

export default function JobSelector({ jobs, selectedJobId, onSelect }: Props) {
  // Find the selected job object to show its title
  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  return (
    <div className="relative mb-6">
      <label className="block text-sm font-medium text-gray-500 mb-1">
        Select Job
      </label>
      <div className="relative">
        <select
          className="w-full appearance-none bg-white border border-gray-300 text-gray-900 font-semibold rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          value={selectedJobId}
          onChange={(e) => onSelect(e.target.value)}
        >
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        {/* Custom Arrow Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
}