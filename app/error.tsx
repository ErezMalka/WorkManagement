'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">אופס! משהו השתבש</h2>
        <p className="text-muted-foreground mb-4">
          מצטערים, אירעה שגיאה בלתי צפויה. אנא נסה שוב.
        </p>
        {error.message && (
          <div className="bg-muted p-3 rounded-md mb-4 max-w-md mx-auto">
            <code className="text-sm">{error.message}</code>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>נסה שוב</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            חזור לדף הבית
          </Button>
        </div>
      </div>
    </div>
  )
}
