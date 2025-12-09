'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react' // <--- IMPORT THIS

// 1. Create a separate component for the logic
function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
      <p className="mt-4 text-gray-600">
        {error || "An unknown error occurred during authentication."}
      </p>
    </div>
  )
}

// 2. Export the Main Page wrapping the content in Suspense
export default function AuthErrorPage() {
  return (
    // This "fallback" is what shows for a split second while loading params
    <Suspense fallback={<div>Loading error details...</div>}>
      <ErrorContent />
    </Suspense>
  )
}