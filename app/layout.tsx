import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const heebo = Heebo({ 
  subsets: ['hebrew'],
  display: 'swap',
  variable: '--font-heebo'
})

export const metadata: Metadata = {
  title: 'מערכת ניהול שעות ושכר',
  description: 'מערכת מתקדמת לניהול שעות עבודה, חופשות ותלושי שכר',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className={`${heebo.className} antialiased bg-background text-foreground min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
