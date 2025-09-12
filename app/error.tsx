'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <svg 
            className="mx-auto h-12 w-12 text-red-500"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">אופס! משהו השתבש</h2>
        <p className="text-gray-600 mb-6">
          מצטערים, אירעה שגיאה בלתי צפויה. אנא נסה שוב.
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={reset}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            נסה שוב
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            חזור לדף הבית
          </button>
        </div>
      </div>
    </div>
  )
}
