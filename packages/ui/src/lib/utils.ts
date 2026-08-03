import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj)
}

export function formatTime(date: Date | string) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj)
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours === 0) {
    return `${mins}m`
  }
  
  return `${hours}h ${mins}m`
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string) {
  const statusColors: Record<string, string> = {
    success: 'text-status-success bg-status-success/10 border-status-success/20',
    warning: 'text-status-warning bg-status-warning/10 border-status-warning/20',
    danger: 'text-status-danger bg-status-danger/10 border-status-danger/20',
    info: 'text-status-info bg-status-info/10 border-status-info/20',
    purple: 'text-status-purple bg-status-purple/10 border-status-purple/20',
    orange: 'text-status-orange bg-status-orange/10 border-status-orange/20',
    teal: 'text-status-teal bg-status-teal/10 border-status-teal/20',
    lime: 'text-status-lime bg-status-lime/10 border-status-lime/20',
  }
  
  return statusColors[status.toLowerCase()] || statusColors.info
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high' | 'urgent') {
  const priorityColors = {
    low: 'text-status-success bg-status-success/10 border-status-success/20',
    medium: 'text-status-warning bg-status-warning/10 border-status-warning/20',
    high: 'text-status-orange bg-status-orange/10 border-status-orange/20',
    urgent: 'text-status-danger bg-status-danger/10 border-status-danger/20',
  }
  
  return priorityColors[priority]
}

export function getSceneTypeColor(type: 'interior' | 'exterior') {
  return type === 'interior' 
    ? 'from-green-100 to-green-200 border-green-300 text-green-800'
    : 'from-orange-100 to-orange-200 border-orange-300 text-orange-800'
}

export function getTimeOfDayColor(timeOfDay: 'day' | 'night') {
  return timeOfDay === 'day'
    ? 'from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800'
    : 'from-blue-100 to-blue-200 border-blue-300 text-blue-800'
}

export function getCastingStatusColor(status: string) {
  const statusColors = {
    submitted: 'text-status-info bg-status-info/10 border-status-info/20',
    reviewing: 'text-status-warning bg-status-warning/10 border-status-warning/20',
    callback: 'text-status-purple bg-status-purple/10 border-status-purple/20',
    cast: 'text-status-success bg-status-success/10 border-status-success/20',
    rejected: 'text-status-danger bg-status-danger/10 border-status-danger/20',
  }
  
  return statusColors[status.toLowerCase() as keyof typeof statusColors] || statusColors.submitted
}