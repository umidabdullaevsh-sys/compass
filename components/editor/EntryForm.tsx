'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, CATEGORY_META } from '@/lib/utils/categories'
import { type Entry, type EntryInsert } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'

const DRAFT_KEY = 'compass-draft'

interface Props {
  entry?: Entry
  onSaved?: (id: string) => void
}

export default function EntryForm({ entry, onSaved }: Props) {
  const router = useRouter()
  const isEdit = !!entry

  const [category, setCategory] = useState(entry?.category ?? CATEGORIES[0])
  const [title, setTitle] = useState(entry?.title ?? '')
  const [body, setBody] = useState(entry?.body ?? '')
  const [entryDate, setEntryDate] = useState(
    entry?.entry_date ?? format(new Date(), 'yyyy-MM-dd')
  )
  const [tags, setTags] = useState(entry?.tags.join(', ') ?? '')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load draft for new entries
  useEffect(() => {
    if (isEdit) return
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const d = JSON.parse(draft)
        setCategory(d.category ?? CATEGORIES[0])
        setTitle(d.title ?? '')
        setBody(d.body ?? '')
        setTags(d.tags ?? '')
      } catch {}
    }
  }, [isEdit])

  // Autosave draft every 5s for new entries
  useEffect(() => {
    if (isEdit) return
    const interval = setInterval(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ category, title, body, tags }))
    }, 5000)
    return () => clearInterval(interval)
  }, [isEdit, category, title, body, tags])

  const handleSave = useCallback(async () => {
    if (!title.trim()) { toast.error('Title is required'); return }
    if (!body.trim())  { toast.error('Body is required'); return }

    setSaving(true)
    const supabase = createClient()

    const payload: EntryInsert = {
      category: category as Entry['category'],
      title: title.trim(),
      body: body.trim(),
      entry_date: entryDate,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      mood: null,
      is_pinned: entry?.is_pinned ?? false,
    }

    let savedId = entry?.id

    if (isEdit && entry) {
      const { error } = await supabase
        .from('entries')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', entry.id)
      if (error) { toast.error(error.message); setSaving(false); return }
    } else {
      const { data, error } = await supabase.from('entries').insert(payload).select().single()
      if (error) { toast.error(error.message); setSaving(false); return }
      savedId = data.id
      localStorage.removeItem(DRAFT_KEY)
    }

    toast.success(isEdit ? 'Entry updated' : 'Entry saved')
    if (onSaved && savedId) {
      onSaved(savedId)
    } else {
      router.push(`/entries/${savedId}`)
    }
  }, [category, title, body, entryDate, tags, entry, isEdit, onSaved, router])

  // Cmd/Ctrl+Enter to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
      {/* Category + Date row */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Entry['category'])}
          className="h-9 rounded-md border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Title */}
      <Input
        placeholder="Entry title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-[16px] font-semibold h-11 border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
        autoFocus={!isEdit}
      />

      {/* Body / Preview toggle */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
            {preview ? 'Preview' : 'Write'}
          </span>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
          >
            {preview ? <EyeOff size={13} /> : <Eye size={13} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {preview ? (
          <div className="entry-body min-h-[320px] prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body || '*Nothing yet…*'}</ReactMarkdown>
          </div>
        ) : (
          <Textarea
            placeholder="Write your entry in Markdown…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[320px] font-mono text-[13px] resize-none focus-visible:ring-1"
          />
        )}
      </div>

      {/* Tags */}
      <Input
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="text-[13px]"
      />

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Update entry' : 'Save entry'}
        </Button>
        <span className="text-[11px] text-muted-foreground">⌘+Enter to save</span>
        {isEdit && (
          <Button variant="ghost" onClick={() => router.back()} className="ml-auto">
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
