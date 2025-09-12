import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    time: new Date().toISOString(),
    service: 'payroll-system',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  })
}
