'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Zap, 
  ChevronRight, 
  ArrowLeft 
} from 'lucide-react'

// --- MOCK DATA: The Scenarios ---
const MOCK_JOBS = [
  {
    id: 'job_1',
    title: 'Senior Full Stack Engineer',
    company: 'TechCorp Solutions',
    location: 'San Francisco (Remote)',
    salary_range: '$140k - $180k',
    type: 'Full-time',
    posted: '2 days ago',
    difficulty: 'Hard', // Hard negotiation
    description: 'We are looking for a rockstar developer. We offer competitive equity but lower base salary initially.',
    logo_color: 'bg-blue-600'
  },
  {
    id: 'job_2',
    title: 'AI Systems Architect',
    company: 'Nebula AI',
    location: 'New York, NY',
    salary_range: '$160k - $220k',
    type: 'Contract',
    posted: '5 hours ago',
    difficulty: 'Medium',
    description: 'Join the next unicorn. Heavy focus on Python and LLM orchestration.',
    logo_color: 'bg-purple-600'
  },
  {
    id: 'job_3',
    title: 'Frontend Developer',
    company: 'StartUp Inc',
    location: 'Austin, TX',
    salary_range: '$90k - $120k',
    type: 'Full-time',
    posted: '1 week ago',
    difficulty: 'Easy', // They are desperate
    description: 'Rapidly growing startup needs a UI wizard. We move fast and break things.',
    logo_color: 'bg-pink-600'
  }
]

export default function JobFeedPage() {
  const router = useRouter()
  const [deploying, setDeploying] = useState<string | null>(null)

  const handleDeploy = (jobId: string) => {
    setDeploying(jobId)
    // Simulate "Agent Connecting" delay
    setTimeout(() => {
      // We will create this negotiation page next
      router.push(`/dashboard/negotiation/${jobId}`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Command Center
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Detected Opportunities</h1>
          <p className="text-gray-500 mt-2">
            Your Agent has scraped 3 high-relevance matches based on your profile.
          </p>
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {MOCK_JOBS.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Job Info */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${job.logo_color} flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                    {job.company[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <Building2 className="w-4 h-4" />
                      <span>{job.company}</span>
                      <span className="text-gray-300">•</span>
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <DollarSign className="w-3 h-3" />
                        {job.salary_range}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <Clock className="w-3 h-3" />
                        {job.type}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.difficulty === 'Hard' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        <Zap className="w-3 h-3" />
                        Negotiation: {job.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleDeploy(job.id)}
                  disabled={!!deploying}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all min-w-[180px] ${
                    deploying === job.id 
                      ? 'bg-gray-800 cursor-wait' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'
                  }`}
                >
                  {deploying === job.id ? (
                    <>Connecting...</>
                  ) : (
                    <>
                      Deploy Agent
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}