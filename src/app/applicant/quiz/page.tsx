'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Brain, DollarSign, Clock, Zap, CheckCircle } from 'lucide-react'

export default function QuizPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // State for priorities
  const [priority, setPriority] = useState<'salary' | 'wlb' | 'growth'>('salary')
  const [riskTolerance, setRiskTolerance] = useState<'safe' | 'balanced' | 'aggressive'>('balanced')

  const handleSubmit = async () => {
    setLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Save preferences to Supabase (We update the profile directly here for speed)
    const { error } = await supabase
      .from('profiles')
      .update({
        negotiation_priority: priority,
        risk_tolerance: riskTolerance,
        // We mark setup as complete
        is_onboarded: true 
      })
      .eq('id', user.id)

    if (!error) {
      router.push('/dashboard') // Back to dashboard, which will now look different
    } else {
      alert("Error saving preferences")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-8 text-white text-center">
          <Brain className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Calibrate Your Agent</h1>
          <p className="opacity-90">Teach your AI how to negotiate on your behalf.</p>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Question 1: Priority */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. What is your absolute top priority?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setPriority('salary')}
                className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  priority === 'salary' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-8 h-8" />
                <span className="font-semibold">Max Salary</span>
              </button>

              <button
                onClick={() => setPriority('wlb')}
                className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  priority === 'wlb' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Clock className="w-8 h-8" />
                <span className="font-semibold">Work-Life Balance</span>
              </button>

              <button
                onClick={() => setPriority('growth')}
                className={`p-4 border-2 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  priority === 'growth' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Zap className="w-8 h-8" />
                <span className="font-semibold">Career Growth</span>
              </button>
            </div>
          </div>

          {/* Question 2: Risk Tolerance */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. How aggressive should the Agent be?</h2>
            <div className="space-y-3">
              <div 
                onClick={() => setRiskTolerance('safe')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  riskTolerance === 'safe' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border ${riskTolerance === 'safe' ? 'bg-green-500 border-green-500' : 'border-gray-400'}`} />
                  <div>
                    <span className="font-bold block text-gray-900">Safe Player</span>
                    <span className="text-sm text-gray-500">Accept the first fair offer. Don't risk losing the deal.</span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setRiskTolerance('balanced')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  riskTolerance === 'balanced' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border ${riskTolerance === 'balanced' ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`} />
                  <div>
                    <span className="font-bold block text-gray-900">Balanced Strategist</span>
                    <span className="text-sm text-gray-500">Push for 10-15% more, but know when to fold.</span>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setRiskTolerance('aggressive')}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  riskTolerance === 'aggressive' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border ${riskTolerance === 'aggressive' ? 'bg-red-500 border-red-500' : 'border-gray-400'}`} />
                  <div>
                    <span className="font-bold block text-gray-900">Wolf of Wall Street</span>
                    <span className="text-sm text-gray-500">Reject lowballs immediately. Counter-offer everything. Max risk.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Activating Agent...' : 'Activate My Agent'}
            {!loading && <CheckCircle className="w-5 h-5" />}
          </button>

        </div>
      </div>
    </div>
  )
}