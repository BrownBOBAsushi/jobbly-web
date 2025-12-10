'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Briefcase, User, Loader2, Lock } from 'lucide-react'

export default function LandingPage() {
  const [role, setRole] = useState<'applicant' | 'hr' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: role },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.status === 400 || signUpError.status === 422) {
          console.log('User exists, attempting sign-in...');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (signInError) {
            console.error('Sign-in error:', signInError);
            throw signInError
          }
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !session) {
            console.error('Session error:', sessionError);
            throw new Error('Failed to create session. Please try again.');
          }
          
          console.log('Sign-in successful, session created');
          setMessage('Welcome back! Redirecting...')
          await new Promise(resolve => setTimeout(resolve, 500))
          router.refresh()
          if (role === 'applicant') {
            router.push('/onboarding/profile')
          } else {
            router.push('/hr/onboarding')
          }
          return
        } else {
          throw signUpError
        }
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('Session error after signup:', sessionError);
        throw new Error('Account created but session failed. Please try logging in.');
      }
      
      console.log('Signup successful, session created');
      setMessage('Account created! Redirecting...')
      await new Promise(resolve => setTimeout(resolve, 500))
      router.refresh()
      if (role === 'applicant') {
        router.push('/onboarding/profile')
      } else {
        router.push('/hr/onboarding')
      }

    } catch (err: any) {
      setMessage('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ 
      background: 'linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif"
    }}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-16">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
          transform: 'rotate(45deg)'
        }}>
          <div className="w-6 h-6 border-2 border-white rounded" style={{ transform: 'rotate(-45deg)' }}></div>
        </div>
        <span className="text-2xl font-bold" style={{ color: '#1F2937' }}>SwiftJobs</span>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-16 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1.1',
          letterSpacing: '-0.02em'
        }}>
          Find Your Perfect Match
        </h1>
        <p className="text-xl" style={{ color: '#6B7280', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
          Connect talented professionals with opportunities that truly fit. Powered by AI matching.
        </p>
      </div>

      {/* User Type Cards */}
      {!role ? (
        <div className="flex flex-col md:flex-row gap-8 max-w-4xl w-full">
          <button
            onClick={() => setRole('applicant')}
            className="flex-1 max-w-md bg-white rounded-3xl p-12 text-center transition-all hover:transform hover:-translate-y-1"
            style={{
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(124, 58, 237, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.1)';
            }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(124, 58, 237, 0.15)' }}>
              <User className="w-10 h-10" style={{ color: '#7C3AED' }} />
            </div>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1F2937' }}>Job Seeker</h2>
            <p className="text-base" style={{ color: '#6B7280', lineHeight: '1.6' }}>
              Discover opportunities that match your skills, culture, and preferences
            </p>
          </button>

          <button
            onClick={() => setRole('hr')}
            className="flex-1 max-w-md bg-white rounded-3xl p-12 text-center transition-all hover:transform hover:-translate-y-1"
            style={{
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(124, 58, 237, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 58, 237, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.1)';
            }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
              <Briefcase className="w-10 h-10" style={{ color: '#EC4899' }} />
            </div>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#1F2937' }}>Hiring Manager</h2>
            <p className="text-base" style={{ color: '#6B7280', lineHeight: '1.6' }}>
              Find the perfect candidates who align with your team culture and requirements
            </p>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 w-full max-w-md transition-all" style={{
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.1)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: '#5B21B6' }}>
              {role === 'applicant' ? 'Job Seeker' : 'Hiring Manager'} Access
            </h2>
            <button 
              onClick={() => setRole(null)} 
              className="text-sm font-medium transition-colors"
              style={{ color: '#6B7280' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#7C3AED'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              Change
            </button>
          </div>

          <form onSubmit={handleDevLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1F2937' }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                style={{
                  background: '#FFFFFF',
                  borderColor: 'rgba(124, 58, 237, 0.2)',
                  color: '#1F2937'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#7C3AED';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(124, 58, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="dev@swiftjobs.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1F2937' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#9CA3AF' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                  style={{
                    background: '#FFFFFF',
                    borderColor: 'rgba(124, 58, 237, 0.2)',
                    color: '#1F2937'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#7C3AED';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(124, 58, 237, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.25)';
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                </span>
              ) : (
                'Enter Dev Mode'
              )}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-xl text-sm text-center ${
              message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}
        </div>
      )}

      {/* Dev Mode Badge */}
      <div className="mt-8">
        <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
          DEV_MODE
        </span>
      </div>
    </div>
  )
}
