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
      <body className={`${heebo.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
