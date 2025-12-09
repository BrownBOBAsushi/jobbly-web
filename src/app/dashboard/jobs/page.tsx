'use client'

import { useState } from 'react'
import { Brain, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react'

// 1. Define the shape of a "Job Application"
type JobStatus = 'idle' | 'processing' | 'interview' | 'rejected'

interface Job {
  id: string
  company: string
  role: string
  offer: number
  requirements: string[]
  status: JobStatus
  reason?: string // Why did we win or lose?
}

// Mock Data (This simulates what your Database/AI Agent returns initially)
const INITIAL_JOBS: Job[] = [
  { id: '1', company: 'Google', role: 'Frontend Dev', offer: 4000, requirements: ['React', 'TS'], status: 'idle' },
  { id: '2', company: 'StartUp Inc', role: 'Full Stack', offer: 5200, requirements: ['React', 'Node'], status: 'idle' },
  { id: '3', company: 'Amazon', role: 'Mobile Dev', offer: 6000, requirements: ['React Native'], status: 'idle' },
]

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS)
  const [isGlobalLoading, setIsGlobalLoading] = useState(false)

  // PHASE 2: THE EXECUTION (The "Magic" Button Logic)
  const handleAutoApply = async () => {
    setIsGlobalLoading(true)

    // We loop through jobs to simulate the Agent working one by one
    const newJobs = [...jobs]
    
    for (let i = 0; i < newJobs.length; i++) {
      // 1. Set individual card to "Processing"
      newJobs[i] = { ...newJobs[i], status: 'processing' }
      setJobs([...newJobs]) // Force render update

      // 2. Simulate AI "Thinking" time (Replace this with await api.apply(job.id))
      await new Promise(resolve => setTimeout(resolve, 1500))

      // PHASE 3: THE RESULT (The Value)
      // This logic mocks the AI's decision making based on your constraints
      if (newJobs[i].company === 'Google') {
        newJobs[i].status = 'rejected'
        newJobs[i].reason = '❌ Budget Mismatch: They offer $4k, you want $5k.'
      } else if (newJobs[i].company === 'StartUp Inc') {
        newJobs[i].status = 'interview'
        newJobs[i].reason = '✅ INTERVIEW SECURED: Skills match + Salary $5.2k agreed.'
      } else {
        newJobs[i].status = 'rejected'
        newJobs[i].reason = '❌ Missing Skill: Application requires React Native.'
      }
      
      setJobs([...newJobs]) // Update UI with final result
    }

    setIsGlobalLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header & Magic Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Agent Dashboard</h1>
          <p className="text-gray-500">Your AI is ready to negotiate.</p>
        </div>
        
        <button
          onClick={handleAutoApply}
          disabled={isGlobalLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all
            ${isGlobalLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 shadow-lg'}
          `}
        >
          {isGlobalLoading ? <Loader2 className="animate-spin" /> : <Zap fill="white" />}
          {isGlobalLoading ? 'Agent Working...' : '⚡ Auto-Apply to All'}
        </button>
      </div>

      {/* Job List */}
      <div className="grid gap-4">
        {jobs.map((job) => (
          <div 
            key={job.id} 
            className={`p-6 rounded-xl border-2 transition-all duration-500
              ${job.status === 'idle' ? 'border-gray-100 bg-white' : ''}
              ${job.status === 'processing' ? 'border-blue-200 bg-blue-50' : ''}
              ${job.status === 'interview' ? 'border-green-200 bg-green-50' : ''}
              ${job.status === 'rejected' ? 'border-red-100 bg-red-50 opacity-75' : ''}
            `}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{job.role} @ {job.company}</h3>
                <p className="text-gray-600 text-sm mt-1">Offer: ${job.offer}/mo • Stack: {job.requirements.join(', ')}</p>
                
                {/* Result Message */}
                {job.reason && (
                  <div className={`mt-3 text-sm font-semibold flex items-center gap-2
                    ${job.status === 'interview' ? 'text-green-700' : 'text-red-600'}
                  `}>
                    {job.status === 'interview' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {job.reason}
                  </div>
                )}
              </div>

              {/* Status Indicator Icon */}
              <div className="mt-2">
                {job.status === 'processing' && <Loader2 className="animate-spin text-blue-500" />}
                {job.status === 'idle' && <span className="text-xs text-gray-400 font-mono">WAITING</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}