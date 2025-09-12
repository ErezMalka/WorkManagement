import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

const timesheetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected', 'paid']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection unavailable' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')

    let query = supabase
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

    if (month) {
      query = query.eq('month', month)
    }

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query.order('month', { ascending: false })

    if (error) {
