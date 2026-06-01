import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy')
  } catch {
    return dateString
  }
}

export const formatRelativeDate = (dateString: string): string => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true })
  } catch {
    return dateString
  }
}

export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US',
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatArea = (area: number, unit: 'ft' | 'm' = 'ft'): string => {
  const formatted = new Intl.NumberFormat('en-US').format(Math.round(area))
  return unit === 'ft' ? `${formatted} sq ft` : `${formatted} m²`
}

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return String(num)
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    draft: '#9E9E9E',
    active: '#4CAF50',
    planning: '#FF9800',
    in_progress: '#2196F3',
    review: '#9C27B0',
    completed: '#4CAF50',
    archived: '#607D8B',
    inactive: '#F44336',
    cancelled: '#F44336',
    past_due: '#FF9800',
  }
  return colorMap[status] ?? '#607D8B'
}

export const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    draft: 'Draft',
    active: 'Active',
    planning: 'Planning',
    in_progress: 'In Progress',
    review: 'Review',
    completed: 'Completed',
    archived: 'Archived',
  }
  return labelMap[status] ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown')
}

export const getRoomColor = (roomType: string): string => {
  const colorMap: Record<string, string> = {
    bedroom: '#C8A2C8',
    bathroom: '#87CEEB',
    kitchen: '#FFD700',
    living_room: '#98FB98',
    dining_room: '#FFA07A',
    garage: '#D3D3D3',
    balcony: '#90EE90',
    study: '#DEB887',
    storage: '#BC8F8F',
    laundry: '#ADD8E6',
    hallway: '#F5F5DC',
  }
  return colorMap[roomType] ?? '#E0E0E0'
}

export const calculateTotalArea = (rooms: Array<{ width: number; height: number }>): number => {
  return rooms.reduce((total, room) => total + room.width * room.height, 0)
}

export const pixelsToFeet = (pixels: number, scale: number): number => {
  return pixels / scale
}

export const feetToPixels = (feet: number, scale: number): number => {
  return feet * scale
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize
}

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const isStrongPassword = (password: string): boolean => {
  return password.length >= 8
}
