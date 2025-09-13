'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [clockStatus, setClockStatus] = useState<'clocked_in' | 'clocked_out'>('clocked_out')
  const [todayLog, setTodayLog] = useState<any>(null)
  const [clockTime, setClockTime] = useState<Date | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        checkUser()
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    // עדכן שעון כל שנייה
    const interval = setInterval(() => {
      setClockTime(new Date())
    }, 1000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setProfile(profileData)
        
        // בדוק סטטוס נוכחות להיום
        await checkAttendanceStatus(user.id)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAttendanceStatus = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0]
    
    const { data } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('employee_id', userId)
      .eq('date', today)
      .single()
    
    if (data) {
      setTodayLog(data)
      setClockStatus(data.status)
    }
  }

  const handleClockIn = async () => {
    if (!user) return
    
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('attendance_logs')
      .upsert({
        employee_id: user.id,
        date: today,
        clock_in: now.toISOString(),
        status: 'clocked_in'
      }, {
        onConflict: 'employee_id,date'
      })
      .select()
      .single()
    
    if (!error && data) {
      setTodayLog(data)
      setClockStatus('clocked_in')
      alert('כניסה נרשמה בהצלחה!')
    }
  }

  const handleClockOut = async () => {
    if (!user || !todayLog) return
    
    const now = new Date()
    const clockIn = new Date(todayLog.clock_in)
    const totalHours = (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
    
    const { data, error } = await supabase
      .from('attendance_logs')
      .update({
        clock_out: now.toISOString(),
        status: 'clocked_out',
        total_hours: Math.round(totalHours * 100) / 100
      })
      .eq('id', todayLog.id)
      .select()
      .single()
    
    if (!error && data) {
      setTodayLog(data)
      setClockStatus('clocked_out')
      alert(`יציאה נרשמה בהצלחה! סה"כ ${Math.round(totalHours * 100) / 100} שעות`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">טוען...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">מערכת ניהול שעות ושכר</h1>
          <p className="text-xl text-gray-600">
            פתרון מקיף לניהול שעות עבודה, חופשות ותלושי שכר
          </p>
        </div>
        
        <div className="text-center">
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            כניסה למערכת
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">מערכת ניהול שעות ושכר</h1>
              <p className="text-sm text-gray-600">
                שלום, {profile?.full_name || user.email} ({profile?.role || 'טוען...'})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
            >
              יציאה
            </button>
          </div>
        </div>
      </nav>

      {/* אזור שעון נוכחות */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {clockTime?.toLocaleTimeString('he-IL')}
              </div>
              <div className="text-gray-600">
                {clockTime?.toLocaleDateString('he-IL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              {todayLog?.clock_in && (
                <div className="text-sm text-gray-500 mt-1">
                  שעת כניסה: {new Date(todayLog.clock_in).toLocaleTimeString('he-IL')}
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              {clockStatus === 'clocked_out' ? (
                <button
                  onClick={handleClockIn}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-lg font-semibold"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  כניסה
                </button>
              ) : (
                <button
                  onClick={handleClockOut}
                  className="px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-lg font-semibold"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                  </svg>
                  יציאה
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* כרטיסים לכולם */}
          <Link href="/employee/timesheets" className="block">
            <div className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2">דיווח שעות</h3>
              <p className="text-gray-600">דווח את שעות העבודה שלך</p>
            </div>
          </Link>

          <Link href="/employee/leave" className="block">
            <div className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2">חופשות</h3>
              <p className="text-gray-600">בקש חופשה וצפה ביתרות</p>
            </div>
          </Link>

          <Link href="/employee/payslips" className="block">
            <div className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2">תלושי שכר</h3>
              <p className="text-gray-600">צפה והורד תלושים</p>
            </div>
          </Link>

          <Link href="/employee/reports" className="block">
            <div className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2">דוחות</h3>
              <p className="text-gray-600">צפה בדוחות וסיכומים</p>
            </div>
          </Link>

          {/* כרטיסים למנהלים ומעלה */}
          {(profile?.role === 'manager' || profile?.role === 'admin') && (
            <>
              <Link href="/manager/employees" className="block">
                <div className="border rounded-lg p-6 bg-blue-50 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-2">ניהול עובדים</h3>
                  <p className="text-gray-600">הוסף וערוך עובדים</p>
                </div>
              </Link>

              <Link href="/manager/approvals" className="block">
                <div className="border rounded-lg p-6 bg-blue-50 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-2">אישורים</h3>
                  <p className="text-gray-600">אשר שעות וחופשות</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
