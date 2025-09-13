'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadPayslips()
  }, [])

  const loadPayslips = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('payslips')
      .select('*')
      .eq('employee_id', user.id)
      .order('period', { ascending: false })

    setPayslips(data || [])
    setLoading(false)
  }

  const handleDownload = async (payslip: any) => {
    // בשלב זה רק מדמה הורדה
    alert(`הורדת תלוש לתקופה: ${payslip.period}\n\n(הפונקציה עדיין לא מחוברת לקבצים אמיתיים)`)
    
    // TODO: יצירת Signed URL והורדה אמיתית
    // const { data } = await supabase.storage
    //   .from('payslips')
    //   .createSignedUrl(payslip.file_url, 60)
    
    // if (data?.signedUrl) {
    //   window.open(data.signedUrl, '_blank')
    // }

    // עדכן את מספר ההורדות
    await supabase
      .from('payslips')
      .update({ 
        download_count: (payslip.download_count || 0) + 1,
        read_receipt_ts: new Date().toISOString()
      })
      .eq('id', payslip.id)
  }

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-')
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ]
    return `${months[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">תלושי שכר</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            חזור
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">טוען...</div>
        ) : payslips.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">אין תלושי שכר זמינים</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">תקופה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">תאריך העלאה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">הורדות</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td className="px-6 py-4">
                      <span className="font-semibold">{formatPeriod(payslip.period)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payslip.uploaded_at).toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">
                        {payslip.download_count || 0} פעמים
                      </span>
                      {payslip.read_receipt_ts && (
                        <div className="text-xs text-gray-500">
                          נצפה לאחרונה: {new Date(payslip.read_receipt_ts).toLocaleDateString('he-IL')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDownload(payslip)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        📥 הורד PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
