// src/components/dashboard/JobCard.tsx
import React from 'react';
import { JobMatch } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface JobCardProps {
  job: JobMatch;
  isSelected: boolean;
  onSelect: (jobId: string) => void;
}

export default function JobCard({ job, isSelected, onSelect }: JobCardProps) {
  const badgeVariant = job.matchConfidence >= 95 ? 'primary' : 'info';
  
  // Use a Tailwind ring and border for the selected state to mimic Pic2's highlight
  const cardClasses = `
    p-4 border rounded-xl cursor-pointer transition-all mb-3
    ${isSelected 
      ? 'bg-indigo-50 border-indigo-400 shadow-md ring-2 ring-indigo-300' 
      : 'bg-white border-gray-200 hover:shadow-sm hover:border-indigo-300'
    }
  `;

  return (
    <div className={cardClasses} onClick={() => onSelect(job.id)}>
      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{job.company} - {job.location}</p>
      
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {/* Confidence Badge - Made Bigger */}
        <Badge variant={badgeVariant} className="text-base font-bold px-3 py-1.5">
          {job.matchConfidence}% Match
        </Badge>
        
        {/* Employment Type / Mode of Work */}
        <Badge variant="default">{job.employmentType}</Badge>
        <Badge variant="default">{job.modeOfWork}</Badge>

        {/* Other key tags */}
        {job.tags.slice(0, 1).map((tag) => (
          <Badge key={tag} variant="default">{tag}</Badge>
        ))}
      </div>
    </div>
  );
}