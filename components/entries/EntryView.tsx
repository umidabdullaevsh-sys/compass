'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Edit2, Trash2, Pin, PinOff, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { type Entry } from '@/types'
import { CATEGORY_META } from '@/lib/utils/categories'
import CategoryIcon from '@/components/categories/CategoryIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

interface Props { entry: Entry }

export default function EntryView({ entry: initial }: Props) {
  const router = useRouter()
  const [entry, setEntry] = useState(initial)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const meta = CATEGORY_META[entry.category as keyof typeof CATEGORY_META]

  async function handlePin() {
    const supabase = createClient()
    const { error } = await supabase
      .from('entries')
      .update({ is_pinned: !entry.is_pinned })
      .eq('id', entry.id)
    if (!error) setEntry((e) => ({ ...e, is_pinned: !e.is_pinned }))
  }

  async function handleDelete() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('entries').delete().eq('id', entry.id)
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Entry deleted')
    router.push('/')
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePin}
            className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title={entry.is_pinned ? 'Unpin' : 'Pin'}
          >
            {entry.is_pinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/entries/${entry.id}/edit`)}>
            <Edit2 size={13} className="mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}
            className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
          >
            <Trash2 size={13} className="mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Category + date */}
      <div className="flex items-center gap-2 mb-3">
        <CategoryIcon name={meta?.icon ?? 'Tag'} color={meta?.color} size={14} />
        <span className="text-[12px] font-medium" style={{ color: meta?.color }}>
          {entry.category}
        </span>
        <span className="text-muted-foreground text-[12px]">·</span>
        <span className="text-[12px] text-muted-foreground">
          {format(parseISO(entry.entry_date), 'EEEE, MMMM d, yyyy')}
        </span>
        {entry.is_pinned && (
          <span className="text-[11px] text-primary font-medium">· Pinned</span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight mb-6">{entry.title}</h1>

      {/* Body */}
      <article className="entry-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.body}</ReactMarkdown>
      </article>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex gap-1.5 mt-8 pt-6 border-t border-border flex-wrap">
          {entry.tags.map((tag) => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="mt-6 text-[11px] text-muted-foreground space-y-0.5">
        <p>Created {format(parseISO(entry.created_at), 'MMM d, yyyy · HH:mm')}</p>
        <p>Updated {format(parseISO(entry.updated_at), 'MMM d, yyyy · HH:mm')}</p>
      </div>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete entry?</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">
            "{entry.title}" will be permanently deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
