// src/lib/mock-data.ts

export interface Job {
    id: string;
    title: string;
    description: string;
  }
  
  export interface Applicant {
    id: string;
    jobId: string;
    name: string;
    matchScore: number;
    scores: {
      skills: number;
      behavior: number;
      preferences: number;
    };
    // NEW: The 3 bubbles for the Middle Column
    preferences: {
      role: string;   // e.g. "Senior PM"
      salary: string; // e.g. "$8k"
      mode: string;   // e.g. "Remote"
    };
    summary: string;
    tags: string[];
    status: 'new' | 'interview_scheduled';
  }
  
  export const JOBS: Job[] = [
    {
      id: 'job-1',
      title: 'Product Manager (Apps)',
      description: 'We are partnered with a robotics team building the Uber for robots. We need a PM who is process-oriented but adaptable to chaos. You will work closely with engineering and design to ship features fast.',
    },
    {
      id: 'job-2',
      title: 'Frontend Engineer',
      description: 'We are looking for a React expert to build our new HR dashboard. You must love clean code, component architecture, and have a good eye for UX design.',
    },
  ];
  
  export const APPLICANTS: Applicant[] = [
    // Job 1 Applicants
    {
      id: 'app-1',
      jobId: 'job-1',
      name: 'Alice Chen',
      matchScore: 97,
      scores: { skills: 85, behavior: 95, preferences: 95 },
      preferences: { role: 'Product Manager', salary: '$6k-$9k', mode: 'Remote' },
      summary: 'Alice is a top match. Her background in logistics aligns perfectly with our robotics focus, and she scores high on autonomy.',
      tags: ['Community', 'Logistics', 'Innovator'],
      status: 'new',
    },
    {
      id: 'app-2',
      jobId: 'job-1',
      name: 'Bob Smith',
      matchScore: 94,
      scores: { skills: 90, behavior: 88, preferences: 92 },
      preferences: { role: 'Senior PM', salary: '$8k+', mode: 'Hybrid' },
      summary: 'Bob has strong technical skills but prefers a slightly more structured environment.',
      tags: ['Strategy', 'Mobile', 'Structured'],
      status: 'new',
    },
    // Job 2 Applicants
    {
      id: 'app-3',
      jobId: 'job-2',
      name: 'Diana Prince',
      matchScore: 98,
      scores: { skills: 99, behavior: 95, preferences: 98 },
      preferences: { role: 'Frontend Lead', salary: '$10k', mode: 'Remote' },
      summary: 'Diana is a React architect. She has built similar dashboards before.',
      tags: ['React', 'TypeScript', 'Tailwind'],
      status: 'new',
    },
  ];