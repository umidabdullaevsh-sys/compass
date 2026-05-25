/** Core domain types for Compass. Keep in sync with supabase/migrations. */

export type Category =
  | 'Religion'
  | 'Logistics'
  | 'Mindset'
  | 'Knowledge'
  | 'Gym'
  | 'Finance'
  | 'Family'
  | 'Health'

export interface Entry {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  /** The date the entry is "about" — may differ from created_at */
  entry_date: string
  category: Category
  title: string
  /** Markdown source */
  body: string
  tags: string[]
  /** Optional mood 1–10 */
  mood: number | null
  is_pinned: boolean
}

export interface CategoryMeta {
  id: string
  user_id: string
  name: string
  /** Hex color string e.g. "#6366f1" */
  color: string
  /** lucide-react icon name */
  icon: string
  sort_order: number
  created_at: string
}

/** Shape of a new entry before it hits the DB */
export type EntryInsert = Omit<Entry, 'id' | 'user_id' | 'created_at' | 'updated_at'>

/** Shape of an entry update */
export type EntryUpdate = Partial<Omit<Entry, 'id' | 'user_id' | 'created_at'>>
