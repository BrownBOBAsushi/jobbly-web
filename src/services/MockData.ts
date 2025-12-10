// src/services/MockData.ts
import { JobMatch, ApplicantProfile, ApplicantPreferences, ApplicantBehaviour } from '@/types';

export const MOCK_USER: ApplicantProfile = {
  id: 'u1',
  name: 'Alex Johnson',
  roleLevel: 'Senior',
  avatarUrl: '/avatars/alex.png', // We will use a placeholder in UI
  bio: 'Product Designer with 5 years of experience in Fintech.'
};

export const MOCK_PREFS: ApplicantPreferences = {
  targetSalaryRange: '$6,000 - $9,000',
  preferredMode: ['Remote', 'Hybrid'],
  locations: ['Singapore', 'Remote']
};

export const MOCK_BEHAVIOUR: ApplicantBehaviour = {
  riskTolerance: 75,
  autonomyLevel: 90,
  processOrientation: 40
};

export const MOCK_JOBS: JobMatch[] = [
  {
    id: 'j1',
    title: 'Senior Vibe Engineer (Blockchain)',
    company: 'DeGate Home DAO',
    location: 'Singapore (Remote)',
    modeOfWork: 'Remote',
    employmentType: 'Full-time',
    salaryRange: '$8k - $12k',
    tags: ['Web3', 'Product', 'DAO'],
    matchConfidence: 96,
    matchDetails: {
      skillMatch: 98,
      cultureMatch: 92,
      preferenceMatch: 100,
      reason: "Your risk tolerance aligns perfectly with their DAO structure, and your salary expectations are within budget."
    },
    postedDate: '3d ago',
    description: `
      ### About Us
      DeGate is a multi-chain platform that lets users buy any token...
      
      ### The Role
      We are looking for a Senior Vibe Engineer to manage community sentiment...
    `
  },
  {
    id: 'j2',
    title: 'Product Manager (Apps)',
    company: 'Hyphen Connect',
    location: 'Singapore',
    modeOfWork: 'Hybrid',
    employmentType: 'Full-time',
    salaryRange: '$7k - $10k',
    tags: ['Robotics', 'Consumer Apps'],
    matchConfidence: 92,
    matchDetails: { // <-- FIX: Added missing details
      skillMatch: 85,
      cultureMatch: 95,
      preferenceMatch: 95,
      reason: "High score on process orientation aligns with their robotics-based operations."
    },
    postedDate: '5d ago',
    description: `We are partnered with a robotics team building the Uber for robots...`
  },
  {
    id: 'j3',
    title: 'Frontend Lead',
    company: 'SwiftJob Inc',
    location: 'Remote',
    modeOfWork: 'Remote',
    employmentType: 'Contract',
    salaryRange: '$10k - $15k',
    tags: ['React', 'Next.js', 'Tailwind'],
    matchConfidence: 88, // This one is below 90%, will be filtered out
    matchDetails: { // <-- FIX: Added missing details
      skillMatch: 99,
      cultureMatch: 80,
      preferenceMatch: 90,
      reason: "Excellent skill match, but high autonomy preference conflicts with their strict processes."
    },
    postedDate: '1d ago',
    description: `Leading the frontend architecture for a new hiring platform...`
  }
];