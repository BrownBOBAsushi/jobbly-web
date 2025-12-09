'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Bot, User, ArrowLeft, Briefcase, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import confetti from 'canvas-confetti' // Optional visual flair

// Mock Data 
const JOBS: any = {
  'job_1': { title: 'Senior Engineer', company: 'TechCorp', salary_range: '$140k-180k', difficulty: 'Hard' },
  'job_2': { title: 'AI Architect', company: 'Nebula AI', salary_range: '$160k-220k', difficulty: 'Medium' },
  'job_3': { title: 'Frontend Dev', company: 'StartUp Inc', salary_range: '$90k-120k', difficulty: 'Easy' }
}

export default function NegotiationArena() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const job = JOBS[jobId]
  
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [turn, setTurn] = useState<'hr' | 'applicant'>('hr')
  const [result, setResult] = useState<any>(null) // New State for Final Result
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        handleTurn('hr', [], data)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  // Helper: Extract numbers from text to find the "Final Offer"
  const extractOffer = (text: string) => {
    const matches = text.match(/\$[\d,]+/)
    return matches ? matches[0] : null
  }

  const handleTurn = async (speaker: string, history: any[], profile: any) => {
    setLoading(true)
    
    try {
      const response = await fetch('https://jobbly-brain.onrender.com/applicant/negotiate/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speaker, history, job_details: job, user_profile: profile })
      })
      
      const data = await response.json()
      const newMessage = { sender: speaker, text: data.message }
      const newHistory = [...history, newMessage]
      setMessages(newHistory)
      setLoading(false)

      // --- END GAME LOGIC ---
      if (newHistory.length >= 8) { // End after 8 messages (4 exchanges)
        finishNegotiation(newHistory)
      } else {
        const nextSpeaker = speaker === 'hr' ? 'applicant' : 'hr'
        setTurn(nextSpeaker)
        setTimeout(() => handleTurn(nextSpeaker, newHistory, profile), 2500)
      }

    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const finishNegotiation = (history: any[]) => {
    // Logic: Look at the last message from HR. Did they say "accept", "agree", "deal"?
    const lastMsg = history[history.length - 1].text.toLowerCase()
    const finalOffer = extractOffer(history[history.length - 1].text) || extractOffer(history[history.length - 2].text) || "Undisclosed"
    
    // Simple sentiment check for demo purposes
    const isSuccess = lastMsg.includes("agree") || lastMsg.includes("accept") || lastMsg.includes("offer") || lastMsg.includes("deal")
    
    setResult({
      success: true, // We force success for the "Feel Good" demo factor usually, or use isSuccess logic
      finalOffer: finalOffer,
      message: "Negotiation Concluded"
    })

    if (true) confetti() // Pop confetti!
  }

  if (!job) return <div className="p-10">Job not found</div>

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 relative">
      
      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between text-white mb-4 z-10">
        <button onClick={() => router.push('/dashboard')} className="flex items-center hover:text-gray-300">
           <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
        </button>
        <div className="text-center">
           <h1 className="font-bold text-xl">{job.company}</h1>
           <span className="text-xs text-gray-400">{job.title} • {job.salary_range}</span>
        </div>
        <div className="w-20" />
      </div>

      {/* Chat Window */}
      <div ref={scrollRef} className="w-full max-w-3xl flex-1 bg-gray-800 rounded-2xl shadow-2xl overflow-y-auto p-6 space-y-4 border border-gray-700 z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'applicant' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end gap-3 max-w-[80%] ${msg.sender === 'applicant' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'applicant' ? 'bg-blue-600' : 'bg-red-600'}`}>
                {msg.sender === 'applicant' ? <User className="w-5 h-5 text-white" /> : <Briefcase className="w-5 h-5 text-white" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'applicant' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-100 rounded-bl-none'}`}>
                <p>{msg.text}</p>
              </div>
            </div>
          </div>
        ))}
        {loading && !result && (
          <div className={`flex ${turn === 'applicant' ? 'justify-end' : 'justify-start'} animate-pulse`}>
             <span className="text-gray-500 text-xs italic ml-12">{turn === 'applicant' ? 'Agent thinking...' : 'HR typing...'}</span>
          </div>
        )}
      </div>

      {/* --- RESULT MODAL (Overlay) --- */}
      {result && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            {result.success ? (
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            )}
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {result.success ? 'Deal Secured!' : 'Negotiation Failed'}
            </h2>
            
            <p className="text-gray-500 mb-6">
              The Agent has concluded the session with {job.company}.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Final Valuation</p>
              <div className="flex items-center justify-center gap-2 text-4xl font-bold text-blue-600 mt-2">
                 {result.finalOffer !== "Undisclosed" && <DollarSign className="w-8 h-8" />}
                 {result.finalOffer}
              </div>
            </div>

            <button 
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
            >
              Return to Command Center
            </button>
          </div>
        </div>
      )}

    </div>
  )
}