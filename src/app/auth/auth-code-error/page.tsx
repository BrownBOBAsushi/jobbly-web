// src/app/auth/auth-code-error/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-700 mb-2">Authentication Failed</h1>
        <p className="text-gray-700 mb-4">
          There was a problem signing you in.
        </p>
        <code className="block bg-white p-3 rounded border border-gray-200 text-sm text-red-600 mb-4">
          Error: {error || 'Unknown error during code exchange'}
        </code>
        <a href="/" className="text-blue-600 hover:underline">
          Return to Login
        </a>
      </div>
    </div>
  )
}