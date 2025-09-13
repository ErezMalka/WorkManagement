'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function TimesheetsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentTimesheet, setCurrentTimesheet] = useState<any>(null)
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadUserAndTimesheet()
  }, [selectedMonth])

  const loadUserAndTimesheet = async () => {
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

    setCurrentUser(profile)

    // טען או צור גיליון שעות לחודש
    let { data: timesheet } = await supabase
      .from('timesheets')
      .select('*')
      .eq('employee_id', user.id)
      .eq('month', selectedMonth)
      .single()

    if (!timesheet) {
      // צור גיליון חדש
      const startOfMonth = new Date(selectedMonth + '-01')
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0)
      
      const { data: newTimesheet } = await supabase
        .from('timesheets')
        .insert({
          employee_id: user.id,
          month: selectedMonth,
          period_start: startOfMonth.toISOString().split('T')[0],
          period_end: endOfMonth.toISOString().split('T')[0],
          status: 'draft'
        })
        .select()
        .single()

      timesheet = newTimesheet
    }

    setCurrentTimesheet(timesheet)

    // טען רשומות זמן
    if (timesheet) {
      const { data: entries } = await supabase
        .from('time_entries')
        .select('*')
        .eq('timesheet_id', timesheet.id)
        .order('date', { ascending: true })

      setTimeEntries(entries || [])
    }
  }

  const handleAddEntry = async (date: string) => {
    if (!currentTimesheet) return

    const entry = {
      timesheet_id: currentTimesheet.id,
      date,
      start_time: '09:00',
      end_time: '18:00',
      break_minutes: 30,
      regular_hours: 8.5,
      ot1_hours: 0,
      ot2_hours: 0,
      night_hours: 0,
      holiday_hours: 0
    }

    const { data } = await supabase
      .from('time_entries')
      .insert(entry)
      .select()
      .single()

    if (data) {
      setTimeEntries([...timeEntries, data])
    }
  }

  const handleUpdateEntry = async (entryId: string, field: string, value: any) => {
    await supabase
      .from('time_entries')
      .update({ [field]: value })
      .eq('id', entryId)

    // רענן את הרשימה
    loadUserAndTimesheet()
  }

  const handleDeleteEntry = async (entryId: string) => {
    await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId)

    setTimeEntries(timeEntries.filter(e => e.id !== entryId))
  }

  const handleSubmitTimesheet = async () => {
    if (!currentTimesheet) return

    await supabase
      .from('timesheets')
      .update({ 
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .eq('id', currentTimesheet.id)

    alert('הגיליון נשלח לאישור בהצלחה!')
    loadUserAndTimesheet()
  }

  const getDaysInMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const date = new Date(year, month - 1, 1)
    const days = []
    
    while (date.getMonth() === month - 1) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    
    return days
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 5 || day === 6 // שישי או שבת
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">דיווח שעות</h1>
          <div className="flex gap-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border rounded"
              max={new Date().toISOString().slice(0, 7)}
            />
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              חזור
            </button>
          </div>
        </div>

        {currentTimesheet && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">סטטוס גיליון:</p>
                <span className={`px-2 py-1 text-sm rounded ${
                  currentTimesheet.status === 'draft' ? 'bg-gray-100' :
                  currentTimesheet.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                  currentTimesheet.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentTimesheet.status === 'draft' ? 'טיוטה' :
                   currentTimesheet.status === 'submitted' ? 'נשלח לאישור' :
                   currentTimesheet.status === 'approved' ? 'מאושר' : 'נדחה'}
                </span>
              </div>
              
              {currentTimesheet.status === 'draft' && timeEntries.length > 0 && (
                <button
                  onClick={handleSubmitTimesheet}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  שלח לאישור
                </button>
              )}
            </div>
          </div>
        )}

        {/* טבלת ימים בחודש */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">תאריך</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">יום</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">כניסה</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">יציאה</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">הפסקה (דק׳)</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">סה״כ שעות</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getDaysInMonth().map(date => {
                const dateStr = date.toISOString().split('T')[0]
                const entry = timeEntries.find(e => e.date === dateStr)
                const dayName = date.toLocaleDateString('he-IL', { weekday: 'long' })
                const isWeekendDay = isWeekend(date)
                
                return (
                  <tr key={dateStr} className={isWeekendDay ? 'bg-gray-50' : ''}>
                    <td className="px-4 py-2 text-sm">
                      {date.toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-4 py-2 text-sm">{dayName}</td>
                    
                    {entry ? (
                      <>
                        <td className="px-4 py-2">
                          <input
                            type="time"
                            value={entry.start_time}
                            onChange={(e) => handleUpdateEntry(entry.id, 'start_time', e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                            disabled={currentTimesheet?.status !== 'draft'}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="time"
                            value={entry.end_time}
                            onChange={(e) => handleUpdateEntry(entry.id, 'end_time', e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                            disabled={currentTimesheet?.status !== 'draft'}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={entry.break_minutes}
                            onChange={(e) => handleUpdateEntry(entry.id, 'break_minutes', parseInt(e.target.value))}
                            className="px-2 py-1 border rounded text-sm w-16"
                            disabled={currentTimesheet?.status !== 'draft'}
                          />
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          {entry.regular_hours}
                        </td>
                        <td className="px-4 py-2">
                          {currentTimesheet?.status === 'draft' && (
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              מחק
                            </button>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td colSpan={4} className="px-4 py-2 text-center text-gray-400">
                          {isWeekendDay ? 'סוף שבוע' : 'לא דווח'}
                        </td>
                        <td className="px-4 py-2"></td>
                        <td className="px-4 py-2">
                          {!isWeekendDay && currentTimesheet?.status === 'draft' && (
                            <button
                              onClick={() => handleAddEntry(dateStr)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + הוסף
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan={5} className="px-4 py-2 text-right">סה״כ שעות בחודש:</td>
                <td className="px-4 py-2">
                  {timeEntries.reduce((sum, e) => sum + (e.regular_hours || 0), 0)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
