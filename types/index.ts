export interface BBQEvent {
  id: string
  name: string
  date: string
  created_at: string
}

export interface Family {
  id: string
  event_id: string
  name: string
  color: string
  created_at: string
}

export interface Item {
  id: string
  event_id: string
  name: string
  quantity: number
  assigned_family_id: string | null
  status: 'open' | 'assigned'
  created_at: string
}

export const FAMILY_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
]
