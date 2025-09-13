import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, phone, role, startDate } = body

    // צור Supabase client עם service role
    const supabase = await createServiceSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      )
    }

    // 1. צור משתמש ב-Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // 2. צור פרופיל
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email,
        full_name: fullName,
        phone,
        role: role || 'employee',
        start_date: startDate,
        active: true,
        notify_channel: 'email'
      })

    if (profileError) {
      // אם יצירת הפרופיל נכשלה, מחק את המשתמש
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    // 3. צור יתרת חופשה
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

    // 4. צור גיליון שעות לחודש הנוכחי
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

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        fullName
      }
    })

  } catch (error: any) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
