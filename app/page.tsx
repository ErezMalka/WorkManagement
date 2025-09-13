'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    
    // הוסף listener לשינויים ב-auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        checkUser()
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Get user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
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

  // אם לא מחובר - הצג דף כניסה
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

  // אם מחובר - הצג את הדף הראשי
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

          {/* כרטיסים לאדמין בלבד */}
          {profile?.role === 'admin' && (
            <>
              <Link href="/admin/settings" className="block">
                <div className="border rounded-lg p-6 bg-purple-50 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-2">הגדרות מערכת</h3>
                  <p className="text-gray-600">נהל הגדרות גלובליות</p>
                </div>
              </Link>

              <Link href="/admin/reports" className="block">
                <div className="border rounded-lg p-6 bg-purple-50 hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-2">דוחות מתקדמים</h3>
                  <p className="text-gray-600">דוחות וניתוחים</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
