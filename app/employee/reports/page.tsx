'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ReportsPage() {
  const [timesheets, setTimesheets] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    loadReports()
  }, [selectedYear])

  const loadReports = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // טען גיליונות שעות לשנה
    const { data: timesheetsData } = await supabase
      .from('timesheets')
      .select(`
        *,
        time_entries (*)
      `)
      .eq('employee_id', user.id)
      .gte('month', `${selectedYear}-01`)
      .lte('month', `${selectedYear}-12`)
      .order('month', { ascending: true })

    setTimesheets(timesheetsData || [])

    // חשב סיכום שנתי
    if (timesheetsData) {
      const yearSummary = {
        totalHours: 0,
        totalOT1: 0,
        totalOT2: 0,
        totalNight: 0,
        monthlyData: [] as any[]
      }

      timesheetsData.forEach(timesheet => {
        const monthTotal = timesheet.time_entries?.reduce((sum: number, entry: any) => 
          sum + (entry.regular_hours || 0), 0) || 0
        
        yearSummary.totalHours += monthTotal
        yearSummary.monthlyData.push({
          month: timesheet.month,
          hours: monthTotal,
          status: timesheet.status
        })
      })

      setSummary(yearSummary)
    }
  }

  const formatMonth = (month: string) => {
    const [year, m] = month.split('-')
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ]
    return months[parseInt(m) - 1]
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">דוחות</h1>
          <div className="flex gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border rounded"
            >
              {[2024, 2023, 2022].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              חזור
            </button>
          </div>
        </div>

        {/* סיכום שנתי */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-600 mb-2">סה״כ שעות בשנה</h3>
              <p className="text-3xl font-bold">{summary.totalHours}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-600 mb-2">ממוצע חודשי</h3>
              <p className="text-3xl font-bold">
                {Math.round(summary.totalHours / summary.monthlyData.length) || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm text-gray-600 mb-2">חודשים מאושרים</h3>
              <p className="text-3xl font-bold">
                {summary.monthlyData.filter((m: any) => m.status === 'approved').length}
                <span className="text-lg text-gray-500"> / {summary.monthlyData.length}</span>
              </p>
            </div>
          </div>
        )}

        {/* טבלת חודשים */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">חודש</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שעות רגילות</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">שעות נוספות</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timesheets.map((timesheet) => {
                const totalHours = timesheet.time_entries?.reduce((sum: number, entry: any) => 
                  sum + (entry.regular_hours || 0), 0) || 0
                const totalOT = timesheet.time_entries?.reduce((sum: number, entry: any) => 
                  sum + (entry.ot1_hours || 0) + (entry.ot2_hours || 0), 0) || 0
                
                return (
                  <tr key={timesheet.id}>
                    <td className="px-6 py-4 font-semibold">
                      {formatMonth(timesheet.month)} {selectedYear}
                    </td>
                    <td className="px-6 py-4">{totalHours}</td>
                    <td className="px-6 py-4">{totalOT || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(timesheet.status)}`}>
                        {timesheet.status === 'draft' ? 'טיוטה' :
                         timesheet.status === 'submitted' ? 'ממתין לאישור' :
                         timesheet.status === 'approved' ? 'מאושר' :
                         timesheet.status === 'rejected' ? 'נדחה' : 'שולם'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/employee/timesheets?month=${timesheet.month}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        צפה בפרטים
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
