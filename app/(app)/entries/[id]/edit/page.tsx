import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EntryForm from '@/components/editor/EntryForm'

interface Props { params: Promise<{ id: string }> }

export default async function EditEntryPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: entry } = await supabase.from('entries').select('*').eq('id', id).single()
  if (!entry) notFound()
  return <EntryForm entry={entry} />
}
