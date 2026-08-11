import { addDays, format } from 'date-fns'

export function toLocalDateString(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function todayLocalDateString(): string {
  return toLocalDateString(new Date())
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDaysLocal(dateStr: string, delta: number): string {
  return toLocalDateString(addDays(parseLocalDate(dateStr), delta))
}

export function isTodayLocal(dateStr: string): boolean {
  return dateStr === todayLocalDateString()
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseLocalDate(dateStr), 'EEEE, MMMM d, yyyy')
}

export function formatShortDate(dateStr: string): string {
  return format(parseLocalDate(dateStr), 'MMM d, yyyy')
}
