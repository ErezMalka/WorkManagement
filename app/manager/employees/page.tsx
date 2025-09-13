'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ManageEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    checkPermissions()
    fetchEmployees()
  }, [])

  const checkPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'manager' && profile?.role !== 'admin') {
      alert('אין לך הרשאה לדף זה')
      router.push('/')
      return
    }

    setCurrentUser(profile)
  }

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setEmployees(data)
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // יצירת משתמש עם האימייל והסיסמה שהמנהל קבע
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // יצירת פרופיל
        await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            role: 'employee',
            start_date: formData.startDate,
            active: true,
            notify_channel: 'email'
          })

        // יתרת חופשה
        const currentYear = new Date().getFullYear()
        await supabase
          .from('leave_balances')
          .insert({
            employee_id: authData.user.id,
            year: currentYear,
            annual_days_accrued: 21,
            annual_days_used: 0,
            sick_days_accrued: 30,
            sick_days_used: 0
          })

        // יצירת גיליון שעות לחודש הנוכחי
        const currentMonth = new Date().toISOString().slice(0, 7)
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        
        await supabase
          .from('timesheets')
          .insert({
            employee_id: authData.user.id,
            month: currentMonth,
            period_start: startOfMonth.toISOString().split('T')[0],
            period_end: endOfMonth.toISOString().split('T')[0],
            status: 'draft'
          })
      }

      alert(`העובד נוסף בהצלחה!\n\nפרטי התחברות:\nאימייל: ${formData.email}\nסיסמה: ${formData.password}`)
      
      setShowAddForm(false)
      fetchEmployees()
      
      // איפוס
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        startDate: new Date().toISOString().split('T')[0]
      })
    } catch (err: any) {
      alert('שגיאה: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      alert('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }

    setLoading(true)
    try {
      // זה דורש Service Role Key - נצטרך API Route
      alert('הסיסמה החדשה: ' + newPassword + '\n\n(שמור אותה - הפונקציה עדיין לא מחוברת לשרת)')
      
      // TODO: צור API Route לשינוי סיסמה
      // const response = await fetch('/api/admin/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, newPassword })
      // })
      
      setShowEditPassword(null)
      setNewPassword('')
    } catch (err: any) {
      alert('שגיאה: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleEmployeeStatus = async (userId: string, currentStatus: boolean) => {
    await supabase
      .from('profiles')
      .update({ active: !currentStatus })
      .eq('user_id', userId)
    
    fetchEmployees()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">ניהול עובדים</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              חזור
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + הוסף עובד
            </button>
          </div>
        </div>

        {/* טופס הוספת עובד */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">הוספת עובד חדש</h2>
              
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">שם מלא *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">אימייל (שם משתמש) *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="employee@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">סיסמה *</label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border rounded font-mono"
                    placeholder="לפחות 6 תווים"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    שמור את הסיסמה - תצטרך למסור אותה לעובד
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">טלפון</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">תאריך תחילת עבודה</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'יוצר...' : 'צור עובד'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 border rounded hover:bg-gray-50"
                  >
                    ביטול
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* רשימת עובדים */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שם</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">אימייל</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">טלפון</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">תפקיד</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{employee.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      employee.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      employee.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      employee.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.active ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEmployeeStatus(employee.user_id, employee.active)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        {employee.active ? 'השבת' : 'הפעל'}
                      </button>
                      
                      {employee.role !== 'admin' && (
                        <button
                          onClick={() => setShowEditPassword(employee.user_id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          שנה סיסמה
                        </button>
                      )}
                    </div>
                    
                    {/* טופס שינוי סיסמה */}
                    {showEditPassword === employee.user_id && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <input
                          type="text"
                          placeholder="סיסמה חדשה"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <button
                          onClick={() => handleChangePassword(employee.user_id)}
                          className="mr-2 px-2 py-1 bg-green-600 text-white rounded text-sm"
                        >
                          שמור
                        </button>
                        <button
                          onClick={() => {
                            setShowEditPassword(null)
                            setNewPassword('')
                          }}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          ביטול
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
