import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Timesheets API is working',
    data: []
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({
    message: 'Timesheet created',
    data: body
  })
}
