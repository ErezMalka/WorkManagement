import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">מערכת ניהול שעות ושכר</h1>
        <p className="text-xl text-gray-600">
          פתרון מקיף לניהול שעות עבודה, חופשות ותלושי שכר
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-2">דיווח שעות</h3>
          <p className="text-gray-600 mb-4">
            דיווח שעות עבודה בקלות ומעקב אחר שעות נוספות
          </p>
          <Link href="/employee/timesheets" className="text-blue-600 hover:underline">
            דווח שעות →
          </Link>
        </div>

        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-2">ניהול חופשות</h3>
          <p className="text-gray-600 mb-4">
            בקשת חופשה ומעקב אחר יתרות ימי חופשה
          </p>
          <Link href="/employee/leave" className="text-blue-600 hover:underline">
            בקש חופשה →
          </Link>
        </div>

        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-2">תלושי שכר</h3>
          <p className="text-gray-600 mb-4">
            צפייה והורדה של תלושי שכר היסטוריים
          </p>
          <Link href="/employee/payslips" className="text-blue-600 hover:underline">
            צפה בתלושים →
          </Link>
        </div>

        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-2">ניהול צוות</h3>
          <p className="text-gray-600 mb-4">
            אישור שעות ובקשות חופשה של העובדים
          </p>
          <Link href="/manager/approvals" className="text-blue-600 hover:underline">
            ניהול אישורים →
          </Link>
        </div>

        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-2">דוחות ומדיניות</h3>
          <p className="text-gray-600 mb-4">
            הגדרת מדיניות תעריפים וצפייה בדוחות
          </p>
          <Link href="/payroll/policies" className="text-blue-600 hover:underline">
            ניהול שכר →
          </Link>
        </div>

        <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-bold mb-2">התראות</h3>
          <p className="text-gray-600 mb-4">
            הגדרת העדפות קבלת התראות ותזכורות
          </p>
          <Link href="/employee/settings" className="text-blue-600 hover:underline">
            הגדרות התראות →
          </Link>
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex gap-4">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            כניסה למערכת
          </Link>
          <Link 
            href="/register" 
            className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            הרשמה
          </Link>
        </div>
      </div>
    </div>
  )
}
