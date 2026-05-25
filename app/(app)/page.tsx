import { createClient } from '@/lib/supabase/server'
import EntryListClient from '@/components/entries/EntryListClient'

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { category, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('entries')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('entry_date', { ascending: false })
    .limit(200)

  if (category) query = query.eq('category', category)

  if (q) {
    // Full-text search using Postgres tsvector
    query = query.textSearch('title,body', q, { type: 'websearch', config: 'english' })
  }

  const { data: entries } = await query

  return (
    <EntryListClient
      entries={entries ?? []}
      activeCategory={category}
      searchQuery={q}
    />
  )
}
