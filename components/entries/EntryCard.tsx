import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { Pin } from 'lucide-react'
import { type Entry } from '@/types'
import { CATEGORY_META } from '@/lib/utils/categories'
import CategoryIcon from '@/components/categories/CategoryIcon'

interface Props {
  entry: Entry
}

export default function EntryCard({ entry }: Props) {
  const meta = CATEGORY_META[entry.category as keyof typeof CATEGORY_META]
  const preview = entry.body.replace(/[#*`>\-_\[\]]/g, '').slice(0, 120)

  return (
    <Link
      href={`/entries/${entry.id}`}
      className="block px-4 py-3.5 border-b border-border hover:bg-accent/50 transition-colors group"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <CategoryIcon name={meta?.icon ?? 'Tag'} color={meta?.color} size={12} />
          <span className="text-[11px] font-medium" style={{ color: meta?.color }}>
            {entry.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {entry.is_pinned && <Pin size={10} className="text-primary" />}
          <span>{format(parseISO(entry.entry_date), 'MMM d')}</span>
        </div>
      </div>

      {/* Title */}
      <p className="text-[13px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-1">
        {entry.title}
      </p>

      {/* Preview */}
      {preview && (
        <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
          {preview}
        </p>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
