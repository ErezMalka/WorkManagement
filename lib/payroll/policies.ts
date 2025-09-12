import { format, parse, differenceInMinutes, isWeekend, isWithinInterval } from 'date-fns'

export interface RatePolicy {
  regularHoursPerDay: number
  ot1Multiplier: number  // 8-10 hours
  ot2Multiplier: number  // 10+ hours
  nightMultiplier: number
  weekendMultiplier: number
  holidayMultiplier: number
  nightStartHour: number  // 22
  nightEndHour: number    // 6
}

export interface TimeEntry {
  date: string
  startTime: string
  endTime: string
  breakMinutes: number
  isHoliday?: boolean
}

export interface CalculatedHours {
  regularHours: number
  ot1Hours: number
  ot2Hours: number
  nightHours: number
  holidayHours: number
  weekendHours: number
  totalHours: number
  totalPay: number
}

// Default policy - can be overridden
export const defaultRatePolicy: RatePolicy = {
  regularHoursPerDay: 8,
  ot1Multiplier: 1.25,
  ot2Multiplier: 1.5,
  nightMultiplier: 1.25,
  weekendMultiplier: 1.5,
  holidayMultiplier: 2.0,
  nightStartHour: 22,
  nightEndHour: 6
}

// Calculate hours for a single entry
export function calculateEntry(
  entry: TimeEntry,
  policy: RatePolicy = defaultRatePolicy,
  hourlyRate: number = 100
): CalculatedHours {
  const date = parse(entry.date, 'yyyy-MM-dd', new Date())
  const startDateTime = parse(`${entry.date} ${entry.startTime}`, 'yyyy-MM-dd HH:mm', new Date())
  const endDateTime = parse(`${entry.date} ${entry.endTime}`, 'yyyy-MM-dd HH:mm', new Date())
  
  // Handle overnight shifts
  let adjustedEndDateTime = endDateTime
  if (endDateTime <= startDateTime) {
    adjustedEndDateTime = new Date(endDateTime)
    adjustedEndDateTime.setDate(adjustedEndDateTime.getDate() + 1)
  }
  
  // Calculate total work minutes
  const totalMinutes = differenceInMinutes(adjustedEndDateTime, startDateTime) - entry.breakMinutes
  const totalHours = totalMinutes / 60
  
  // Initialize hour buckets
  let regularHours = 0
  let ot1Hours = 0
  let ot2Hours = 0
  let nightHours = 0
  let weekendHours = 0
  let holidayHours = 0
  
  // Check if it's a holiday
  if (entry.isHoliday) {
    holidayHours = totalHours
  } 
  // Check if it's a weekend
  else if (isWeekend(date)) {
    weekendHours = totalHours
  } 
  // Regular day calculations
  else {
    // Calculate regular vs overtime
    if (totalHours <= policy.regularHoursPerDay) {
      regularHours = totalHours
    } else if (totalHours <= 10) {
      regularHours = policy.regularHoursPerDay
      ot1Hours = totalHours - policy.regularHoursPerDay
    } else {
      regularHours = policy.regularHoursPerDay
      ot1Hours = 2 // 8-10 hours
      ot2Hours = totalHours - 10
    }
    
    // Calculate night hours
    nightHours = calculateNightHours(startDateTime, adjustedEndDateTime, policy)
  }
  
  // Calculate total pay
  const totalPay = 
    (regularHours * hourlyRate) +
    (ot1Hours * hourlyRate * policy.ot1Multiplier) +
    (ot2Hours * hourlyRate * policy.ot2Multiplier) +
    (nightHours * hourlyRate * policy.nightMultiplier) +
    (weekendHours * hourlyRate * policy.weekendMultiplier) +
    (holidayHours * hourlyRate * policy.holidayMultiplier)
  
  return {
    regularHours: Math.round(regularHours * 100) / 100,
    ot1Hours: Math.round(ot1Hours * 100) / 100,
    ot2Hours: Math.round(ot2Hours * 100) / 100,
    nightHours: Math.round(nightHours * 100) / 100,
    holidayHours: Math.round(holidayHours * 100) / 100,
    weekendHours: Math.round(weekendHours * 100) / 100,
    totalHours: Math.round(totalHours * 100) / 100,
    totalPay: Math.round(totalPay * 100) / 100
  }
}

// Calculate night hours within a shift
function calculateNightHours(
  startTime: Date,
  endTime: Date,
  policy: RatePolicy
): number {
  let nightMinutes = 0
  const currentTime = new Date(startTime)
  
  while (currentTime < endTime) {
    const hour = currentTime.getHours()
    const isNightHour = hour >= policy.nightStartHour || hour < policy.nightEndHour
    
    if (isNightHour) {
      const nextHour = new Date(currentTime)
      nextHour.setHours(hour + 1, 0, 0, 0)
      
      const periodEnd = nextHour > endTime ? endTime : nextHour
      nightMinutes += differenceInMinutes(periodEnd, currentTime)
    }
    
    currentTime.setHours(currentTime.getHours() + 1, 0, 0, 0)
  }
  
  return nightMinutes / 60
}

// Calculate monthly summary
export function calculateMonthlySummary(
  entries: TimeEntry[],
  policy: RatePolicy = defaultRatePolicy,
  hourlyRate: number = 100
) {
  const calculations = entries.map(entry => calculateEntry(entry, policy, hourlyRate))
  
  return calculations.reduce((acc, calc) => ({
    regularHours: acc.regularHours + calc.regularHours,
    ot1Hours: acc.ot1Hours + calc.ot1Hours,
    ot2Hours: acc.ot2Hours + calc.ot2Hours,
    nightHours: acc.nightHours + calc.nightHours,
    holidayHours: acc.holidayHours + calc.holidayHours,
    weekendHours: acc.weekendHours + calc.weekendHours,
    totalHours: acc.totalHours + calc.totalHours,
    totalPay: acc.totalPay + calc.totalPay
  }), {
    regularHours: 0,
    ot1Hours: 0,
    ot2Hours: 0,
    nightHours: 0,
    holidayHours: 0,
    weekendHours: 0,
    totalHours: 0,
    totalPay: 0
  })
}

// Validate time entry
export function validateTimeEntry(entry: TimeEntry): string[] {
  const errors: string[] = []
  
  if (!entry.date) {
    errors.push('תאריך חובה')
  }
  
  if (!entry.startTime) {
    errors.push('שעת התחלה חובה')
  }
  
  if (!entry.endTime) {
    errors.push('שעת סיום חובה')
  }
  
  if (entry.breakMinutes < 0) {
    errors.push('זמן הפסקה לא יכול להיות שלילי')
  }
  
  if (entry.breakMinutes > 120) {
    errors.push('זמן הפסקה לא יכול לעבור 120 דקות')
  }
  
  // Check if total work time is reasonable (not more than 16 hours)
  if (entry.startTime && entry.endTime) {
    const startDateTime = parse(`${entry.date} ${entry.startTime}`, 'yyyy-MM-dd HH:mm', new Date())
    const endDateTime = parse(`${entry.date} ${entry.endTime}`, 'yyyy-MM-dd HH:mm', new Date())
    
    let adjustedEndDateTime = endDateTime
    if (endDateTime <= startDateTime) {
      adjustedEndDateTime = new Date(endDateTime)
      adjustedEndDateTime.setDate(adjustedEndDateTime.getDate() + 1)
    }
    
    const totalMinutes = differenceInMinutes(adjustedEndDateTime, startDateTime)
    if (totalMinutes > 960) { // 16 hours
      errors.push('משמרת לא יכולה לעבור 16 שעות')
    }
  }
  
  return errors
}
