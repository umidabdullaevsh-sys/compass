import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EntryView from '@/components/entries/EntryView'

interface Props { params: Promise<{ id: string }> }

export default async function EntryPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: entry } = await supabase.from('entries').select('*').eq('id', id).single()
  if (!entry) notFound()
  return <EntryView entry={entry} />
}
