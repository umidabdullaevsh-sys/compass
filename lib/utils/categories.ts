import { type Category } from '@/types'

export const CATEGORY_META: Record<Category, { color: string; icon: string; label: string }> = {
  Religion:  { color: '#a78bfa', icon: 'BookOpen',      label: 'Religion'  },
  Logistics: { color: '#60a5fa', icon: 'Truck',         label: 'Logistics' },
  Mindset:   { color: '#34d399', icon: 'Brain',         label: 'Mindset'   },
  Knowledge: { color: '#fbbf24', icon: 'GraduationCap', label: 'Knowledge' },
  Gym:       { color: '#f87171', icon: 'Dumbbell',      label: 'Gym'       },
  Finance:   { color: '#4ade80', icon: 'Wallet',        label: 'Finance'   },
  Family:    { color: '#fb923c', icon: 'Users',         label: 'Family'    },
  Health:    { color: '#38bdf8', icon: 'Heart',         label: 'Health'    },
}

export const CATEGORIES = Object.keys(CATEGORY_META) as Category[]
