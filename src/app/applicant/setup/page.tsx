'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Upload, Loader2, FileText, CheckCircle } from 'lucide-react'

// Replace with your Render/local FastAPI URL
const BACKEND_API_URL = "https://jobbly-brain.onrender.com/applicant/parse-resume"; 

export default function ApplicantSetupPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setParsedData(null)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    // 1. Get the current user session ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        setError("You must be logged in to upload a resume.");
        setLoading(false);
        return;
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_id', user.id) // Pass the User ID to the backend

    try {
        // 2. Call your FastAPI backend endpoint
        const response = await fetch(BACKEND_API_URL, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Backend parsing failed.");
        }

        const data = await response.json()
        setParsedData(data.data) // data.data contains the ParsedResume JSON
        
    } catch (err: any) {
        setError(err.message || 'An unknown error occurred during parsing.')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Applicant Profile Setup</h1>
        
        {/* Step 1: Upload Form */}
        {!parsedData && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold mb-3">1. Upload Resume (PDF or DOCX)</h2>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500 font-semibold">
                    {file ? `File Selected: ${file.name}` : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX (MAX 5MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} disabled={loading} />
              </label>
            </div>
            
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: loading ? '#4a5568' : '#3b82f6' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing with Groq...
                </span>
              ) : (
                'Analyze Resume with AI'
              )}
            </button>
          </form>
        )}

        {/* Step 2: Display Parsed Data */}
        {parsedData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-green-600 flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6" /> Resume Processed Successfully
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">Full Name</p>
                <p className="text-lg font-bold text-gray-900">{parsedData.full_name}</p>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">Suggested Salary Range</p>
                <p className="text-lg font-bold text-gray-900">${parsedData.suggested_salary_min} - ${parsedData.suggested_salary_max}</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">Skills</p>
                <div className="flex flex-wrap gap-2">
                    {parsedData.parsed_skills.map((skill: string) => (
                        <span key={skill} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{skill}</span>
                    ))}
                </div>
            </div>

            <div className="p-4 border rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">Experience Summary</p>
                <p className="text-gray-800">{parsedData.parsed_experience_summary}</p>
            </div>

            <button
              onClick={() => router.push('/applicant/quiz')} // Next Step
              className="w-full py-3 mt-6 px-4 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition-colors"
            >
              Continue to Behavioural Quiz (Part B)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}