import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/layout/Navigation'

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
        <Navigation />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  )
}
