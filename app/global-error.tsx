'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
          direction: 'rtl'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              אירעה שגיאה קריטית במערכת
            </h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              מצטערים, משהו השתבש באופן חמור. צוות הפיתוח קיבל התראה.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                marginLeft: '0.5rem'
              }}
            >
              נסה שוב
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              חזור לדף הבית
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
