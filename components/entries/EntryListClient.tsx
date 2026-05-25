'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, Plus } from 'lucide-react'
import { type Entry } from '@/types'
import EntryCard from './EntryCard'
import { CATEGORY_META } from '@/lib/utils/categories'

interface Props {
  entries: Entry[]
  activeCategory?: string
  searchQuery?: string
}

export default function EntryListClient({ entries, activeCategory, searchQuery }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
      const params = new URLSearchParams()
      if (activeCategory) params.set('category', activeCategory)
      if (q) params.set('q', q)
      startTransition(() => router.push(`${pathname}?${params}`))
    },
    [router, pathname, activeCategory]
  )

  const heading = activeCategory
    ? activeCategory
    : searchQuery
    ? `"${searchQuery}"`
    : 'All Entries'

  const catColor = activeCategory
    ? CATEGORY_META[activeCategory as keyof typeof CATEGORY_META]?.color
    : undefined

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-5 py-3 flex items-center gap-3">
        <h1 className="text-[14px] font-semibold flex-1 truncate" style={{ color: catColor }}>
          {heading}
          <span className="text-muted-foreground font-normal ml-2 text-[12px]">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </h1>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="Search…"
              className="h-8 pl-8 pr-3 rounded-md border border-input bg-background text-[12px] focus:outline-none focus:ring-1 focus:ring-ring w-44"
            />
          </div>
        </form>

        <a
          href="/new"
          className="flex items-center gap-1 h-8 px-3 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={13} />
          New
        </a>
      </div>

      {/* Entry list */}
      <div className={isPending ? 'opacity-60 pointer-events-none' : ''}>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            <p className="text-muted-foreground text-[14px]">No entries yet.</p>
            <a href="/new" className="mt-3 text-primary text-[13px] underline underline-offset-2">
              Write your first entry
            </a>
          </div>
        ) : (
          entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  )
}
