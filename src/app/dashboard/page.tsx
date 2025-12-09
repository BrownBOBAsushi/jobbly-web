'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Briefcase, 
  Zap, 
  Shield, 
  TrendingUp, 
  Search, 
  Loader2 
} from 'lucide-react'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) setProfile(data)
      setLoading(false)
    }
    getProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Helper to map risk tolerance to colors/labels
  const getRiskBadge = (risk: string) => {
    switch(risk) {
      case 'aggressive': return { color: 'bg-red-100 text-red-800', label: 'Wolf of Wall Street', icon: Zap }
      case 'safe': return { color: 'bg-green-100 text-green-800', label: 'Safe Player', icon: Shield }
      default: return { color: 'bg-blue-100 text-blue-800', label: 'Balanced Strategist', icon: TrendingUp }
    }
  }

  const riskInfo = profile?.risk_tolerance ? getRiskBadge(profile.risk_tolerance) : getRiskBadge('balanced')
  const RiskIcon = riskInfo.icon

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agent Command Center</h1>
            <p className="text-gray-500">Welcome back, {profile?.full_name || 'Applicant'}</p>
          </div>
          <div className="flex items-center gap-3">
             <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Agent Active
             </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Agent Persona */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Negotiation Strategy</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${riskInfo.color}`}>
              <RiskIcon className="w-5 h-5" />
              <span className="font-bold">{riskInfo.label}</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Calibrated based on your quiz results.
            </p>
          </div>

          {/* Card 2: Target Valuation */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="text-sm font-medium text-gray-500 mb-2">Target Market Value</h3>
             <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  ${(profile?.desired_salary_min || 0).toLocaleString()}
                </span>
                <span className="text-gray-400">-</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${(profile?.desired_salary_max || 0).toLocaleString()}
                </span>
             </div>
             <p className="text-xs text-green-600 mt-2 font-medium">
                + Based on AI Analysis of your skills
             </p>
          </div>

          {/* Card 3: Priority */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Primary Goal</h3>
            <div className="flex items-center gap-2">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  {profile?.negotiation_priority === 'wlb' ? <Briefcase className="w-5 h-5"/> : <TrendingUp className="w-5 h-5"/>}
               </div>
               <span className="text-lg font-bold capitalize text-gray-900">
                 {profile?.negotiation_priority === 'wlb' ? 'Work-Life Balance' : profile?.negotiation_priority || 'Salary'}
               </span>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
           <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">Ready to Deploy?</h2>
              <p className="text-blue-100 mb-8 text-lg">
                Your Agent is trained and ready. The next step is to find job listings and let the Agent simulate interviews against the "Referee Agent."
              </p>
              
              <button className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg">
                 <Search className="w-5 h-5" />
                 Find Jobs & Start Simulations
              </button>

              <button 
                onClick={() => router.push('/dashboard/jobs')} // <--- ADD THIS
                className="bg-white text-blue-700 ... (keep existing classes)"
                >
                <Search className="w-5 h-5" />
                Find Jobs & Start Simulations
              </button>
           </div>
        </div>

      </div>
    </div>
  )
}