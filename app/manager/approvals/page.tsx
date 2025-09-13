'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ApprovalsPage() {
  const [pendingTimesheets, setPendingTimesheets] = useState<any[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'timesheets' | 'leaves'>('timesheets')
  const router = useRouter()

  useEffect(() => {
    checkPermissions()
    loadPendingItems()
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
  }

  const loadPendingItems = async () => {
    setLoading(true)

    // טען גיליונות שעות ממתינים
    const { data: timesheets } = await supabase
      .from('timesheets')
      .select(`
        *,
        employee:profiles!timesheets_employee_id_fkey(
          user_id,
          full_name,
          email
        ),
        time_entries(*)
      `)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false })

    setPendingTimesheets(timesheets || [])

    // טען בקשות חופשה ממתינות
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:profiles!leave_requests_employee_id_fkey(
          user_id,
          full_name,
          email
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    setPendingLeaves(leaves || [])
    setLoading(false)
  }

  const handleApproveTimesheet = async (timesheetId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase
      .from('timesheets')
      .update({
        status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', timesheetId)

    alert('הגיליון אושר בהצלחה')
    loadPendingItems()
  }

  const handleRejectTimesheet = async (timesheetId: string) => {
    const reason = prompt('סיבת הדחייה:')
    if (!reason) return

    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase
      .from('timesheets')
      .update({
        status: 'rejected',
        rejected_by: user?.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', timesheetId)

    alert('הגיליון נדחה')
    loadPendingItems()
  }

  const handleApproveLeave = async (leaveId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase
      .from('leave_requests')
      .update({
        status: 'approved',
        decided_by: user?.id,
        decided_at: new Date().toISOString()
      })
      .eq('id', leaveId)

    alert('הבקשה אושרה בהצלחה')
    loadPendingItems()
  }

  const handleRejectLeave = async (leaveId: string) => {
    const reason = prompt('סיבת הדחייה:')
    if (!reason) return

    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase
      .from('leave_requests')
      .update({
        status: 'rejected',
        decided_by: user?.id,
        decided_at: new Date().toISOString(),
        decision_comment: reason
      })
      .eq('id', leaveId)

    alert('הבקשה נדחתה')
    loadPendingItems()
  }

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-')
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ]
    return `${months[parseInt(m) - 1]} ${year}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">אישורים ממתינים</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            חזור
          </button>
        </div>

        {/* טאבים */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('timesheets')}
            className={`px-4 py-2 rounded ${
              activeTab === 'timesheets' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border hover:bg-gray-50'
            }`}
          >
            גיליונות שעות ({pendingTimesheets.length})
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-2 rounded ${
              activeTab === 'leaves' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border hover:bg-gray-50'
            }`}
          >
            בקשות חופשה ({pendingLeaves.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">טוען...</div>
        ) : (
          <>
            {/* גיליונות שעות */}
            {activeTab === 'timesheets' && (
              <div className="space-y-4">
                {pendingTimesheets.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    אין גיליונות שעות ממתינים לאישור
                  </div>
                ) : (
                  pendingTimesheets.map((timesheet: any) => {
                    const totalHours = timesheet.time_entries?.reduce((sum: number, entry: any) => 
                      sum + (entry.regular_hours || 0), 0) || 0
                    
                    return (
                      <div key={timesheet.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {timesheet.employee?.full_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {timesheet.employee?.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatMonth(timesheet.month)}</p>
                            <p className="text-sm text-gray-600">
                              נשלח: {new Date(timesheet.submitted_at).toLocaleDateString('he-IL')}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm text-gray-600">סה״כ שעות</p>
                            <p className="text-xl font-bold">{totalHours}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">ימי עבודה</p>
                            <p className="text-xl font-bold">{timesheet.time_entries?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">שעות נוספות</p>
                            <p className="text-xl font-bold">
                              {timesheet.total_ot1_hours + timesheet.total_ot2_hours || 0}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => handleApproveTimesheet(timesheet.id)}
                            className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            אשר גיליון
                          </button>
                          <button
                            onClick={() => handleRejectTimesheet(timesheet.id)}
                            className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            דחה גיליון
                          </button>
                          <button
                            onClick={() => router.push(`/employee/timesheets?month=${timesheet.month}&view=${timesheet.employee_id}`)}
                            className="flex-1 py-2 border rounded hover:bg-gray-50"
                          >
                            צפה בפרטים
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* בקשות חופשה */}
            {activeTab === 'leaves' && (
              <div className="space-y-4">
                {pendingLeaves.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    אין בקשות חופשה ממתינות לאישור
                  </div>
                ) : (
                  pendingLeaves.map((leave: any) => (
                    <div key={leave.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {leave.employee?.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {leave.employee?.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {leave.type === 'annual' ? 'חופשה שנתית' :
                             leave.type === 'sick' ? 'מחלה' :
                             leave.type === 'unpaid' ? 'חופשה ללא תשלום' : 'אחר'}
                          </p>
                          <p className="text-sm text-gray-600">
                            נשלח: {new Date(leave.created_at).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 p-4 bg-gray-50 rounded">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">מתאריך</p>
                            <p className="font-semibold">
                              {new Date(leave.start_date).toLocaleDateString('he-IL')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">עד תאריך</p>
                            <p className="font-semibold">
                              {new Date(leave.end_date).toLocaleDateString('he-IL')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">סה״כ ימים</p>
                            <p className="font-semibold">{leave.days_requested}</p>
                          </div>
                        </div>
                        {leave.reason && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">סיבה:</p>
                            <p>{leave.reason}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => handleApproveLeave(leave.id)}
                          className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          אשר בקשה
                        </button>
                        <button
                          onClick={() => handleRejectLeave(leave.id)}
                          className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          דחה בקשה
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
