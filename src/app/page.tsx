'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Briefcase, User, Loader2, Lock } from 'lucide-react'

export default function LandingPage() {
  const [role, setRole] = useState<'applicant' | 'hr' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('') // New Password Field
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // STRATEGY: Try to Sign Up first (to ensure Profile is created with Role)
      // If user exists, this will fail, and we catch it to perform Sign In.
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: role }, // PASS ROLE METADATA HERE
        },
      })

      if (signUpError) {
        // If error is "User already registered", try logging in
        if (signUpError.message.includes("already registered") || signUpError.status === 400) {
           const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (signInError) throw signInError
          
          // Login Success
          setMessage('Welcome back! Redirecting...')
          router.refresh() // Sync server cookies
          router.push('/dashboard')
          return
        } else {
          throw signUpError
        }
      }

      // Signup Success
      setMessage('Account created! Redirecting...')
      router.refresh()
      router.push('/dashboard')

    } catch (err: any) {
      setMessage('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
          JOBBLY <span className="text-red-500 text-sm align-top">DEV_MODE</span>
        </h1>
        <p className="text-gray-400">Agentic Negotiation Platform (Backdoor Access)</p>
      </div>

      {/* Card Container */}
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        
        {/* STATE 1: ROLE SELECTION */}
        {!role ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-white">
              Select Role
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRole('applicant')}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-700 rounded-xl hover:border-blue-500 hover:bg-gray-700 transition-all group"
              >
                <User className="w-8 h-8 text-gray-500 group-hover:text-blue-500 mb-3" />
                <span className="font-medium text-gray-300 group-hover:text-white">Applicant</span>
              </button>

              <button
                onClick={() => setRole('hr')}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-700 rounded-xl hover:border-pink-500 hover:bg-gray-700 transition-all group"
              >
                <Briefcase className="w-8 h-8 text-gray-500 group-hover:text-pink-500 mb-3" />
                <span className="font-medium text-gray-300 group-hover:text-white">HR / Hirer</span>
              </button>
            </div>
          </div>
        ) : (
          /* STATE 2: PASSWORD LOGIN FORM */
          <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {role === 'applicant' ? 'Applicant' : 'HR'} Access
              </h2>
              <button onClick={() => setRole(null)} className="text-sm text-gray-500 hover:text-gray-300">
                Change
              </button>
            </div>

            <form onSubmit={handleDevLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="dev@jobbly.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  role === 'applicant' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                  </span>
                ) : (
                  'Enter Dev Mode'
                )}
              </button>
            </form>

            {message && (
              <div className={`p-3 rounded-lg text-sm text-center ${message.includes('Error') ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}