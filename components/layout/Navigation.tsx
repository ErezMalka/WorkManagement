'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setProfile(profileData)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // אל תציג ניווט בדף הלוגין
  if (pathname === '/login' || !user) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* חלק שמאל - ניווט */}
          <div className="flex items-center gap-4">
            {/* כפתור חזור */}
            {pathname !== '/' && (
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="חזור"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}

            {/* כפתור בית */}
            <Link
              href="/"
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                pathname === '/' ? 'bg-gray-100' : ''
              }`}
              title="דף הבית"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>

            {/* קישורים מהירים */}
            <div className="hidden md:flex items-center gap-2 mr-4 border-r pr-4">
              <Link
                href="/employee/timesheets"
                className={`px-3 py-1 rounded hover:bg-gray-100 text-sm ${
                  pathname.includes('/employee/timesheets') ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                דיווח שעות
              </Link>
              <Link
                href="/employee/leave"
                className={`px-3 py-1 rounded hover:bg-gray-100 text-sm ${
                  pathname.includes('/employee/leave') ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                חופשות
              </Link>
              <Link
                href="/employee/payslips"
                className={`px-3 py-1 rounded hover:bg-gray-100 text-sm ${
                  pathname.includes('/employee/payslips') ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                תלושים
              </Link>
              
              {(profile?.role === 'manager' || profile?.role === 'admin') && (
                <>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <Link
                    href="/manager/employees"
                    className={`px-3 py-1 rounded hover:bg-gray-100 text-sm ${
                      pathname.includes('/manager/employees') ? 'bg-gray-100 font-semibold' : ''
                    }`}
                  >
                    עובדים
                  </Link>
                  <Link
                    href="/manager/approvals"
                    className={`px-3 py-1 rounded hover:bg-gray-100 text-sm ${
                      pathname.includes('/manager/approvals') ? 'bg-gray-100 font-semibold' : ''
                    }`}
                  >
                    אישורים
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* חלק ימין - פרטי משתמש */}
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
              <p className="text-xs text-gray-500">{profile?.role || 'עובד'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm"
            >
              יציאה
            </button>
          </div>
        </div>

        {/* ניווט מובייל */}
        <div className="md:hidden border-t py-2 flex gap-2 overflow-x-auto">
          <Link
            href="/employee/timesheets"
            className={`px-3 py-1 rounded hover:bg-gray-100 text-sm whitespace-nowrap ${
              pathname.includes('/employee/timesheets') ? 'bg-gray-100 font-semibold' : ''
            }`}
          >
            שעות
          </Link>
          <Link
            href="/employee/leave"
            className={`px-3 py-1 rounded hover:bg-gray-100 text-sm whitespace-nowrap ${
              pathname.includes('/employee/leave') ? 'bg-gray-100 font-semibold' : ''
            }`}
          >
            חופשות
          </Link>
          <Link
            href="/employee/payslips"
            className={`px-3 py-1 rounded hover:bg-gray-100 text-sm whitespace-nowrap ${
              pathname.includes('/employee/payslips') ? 'bg-gray-100 font-semibold' : ''
            }`}
          >
            תלושים
          </Link>
          {(profile?.role === 'manager' || profile?.role === 'admin') && (
            <>
              <Link
                href="/manager/employees"
                className={`px-3 py-1 rounded hover:bg-gray-100 text-sm whitespace-nowrap ${
                  pathname.includes('/manager/employees') ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                עובדים
              </Link>
              <Link
                href="/manager/approvals"
                className={`px-3 py-1 rounded hover:bg-gray-100 text-sm whitespace-nowrap ${
                  pathname.includes('/manager/approvals') ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                אישורים
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
