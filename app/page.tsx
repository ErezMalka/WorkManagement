import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar, FileText, Users, BarChart3, Bell } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">מערכת ניהול שעות ושכר</h1>
        <p className="text-xl text-muted-foreground">
          פתרון מקיף לניהול שעות עבודה, חופשות ותלושי שכר
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <Clock className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>דיווח שעות</CardTitle>
            <CardDescription>
              דיווח שעות עבודה בקלות ומעקב אחר שעות נוספות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employee/timesheets">דווח שעות</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Calendar className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>ניהול חופשות</CardTitle>
            <CardDescription>
              בקשת חופשה ומעקב אחר יתרות ימי חופשה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employee/leave">בקש חופשה</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>תלושי שכר</CardTitle>
            <CardDescription>
              צפייה והורדה של תלושי שכר היסטוריים
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employee/payslips">צפה בתלושים</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>ניהול צוות</CardTitle>
            <CardDescription>
              אישור שעות ובקשות חופשה של העובדים
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/manager/approvals">ניהול אישורים</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>דוחות ומדיניות</CardTitle>
            <CardDescription>
              הגדרת מדיניות תעריפים וצפייה בדוחות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/payroll/policies">ניהול שכר</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Bell className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>התראות</CardTitle>
            <CardDescription>
              הגדרת העדפות קבלת התראות ותזכורות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/employee/settings">הגדרות התראות</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <div className="inline-flex gap-4">
          <Button asChild size="lg">
            <Link href="/login">כניסה למערכת</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">הרשמה</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
