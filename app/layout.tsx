import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'

const heebo = Heebo({ 
  subsets: ['hebrew'],
  display: 'swap',
  variable: '--font-heebo'
})

export const metadata: Metadata = {
  title: 'מערכת ניהול שעות ושכר',
  description: 'מערכת מתקדמת לניהול שעות עבודה, חופשות ותלושי שכר',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className={`${heebo.className} antialiased bg-gray-50 min-h-screen`}>
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">מערכת ניהול שעות ושכר</h1>
              <div className="text-sm text-gray-600">
                גרסה 1.0.0
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
            © 2024 כל הזכויות שמורות
          </div>
        </footer>
      </body>
    </html>
  )
}
