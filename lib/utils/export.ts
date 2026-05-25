import JSZip from 'jszip'
import { type Entry } from '@/types'
import { format } from 'date-fns'

/** Download all entries as a JSON file */
export function exportJSON(entries: Entry[]) {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `compass-export-${format(new Date(), 'yyyy-MM-dd')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Download all entries as a zip of markdown files, one file per entry, grouped by category */
export async function exportMarkdownZip(entries: Entry[]) {
  const zip = new JSZip()

  for (const entry of entries) {
    const folder = zip.folder(entry.category)!
    const dateStr = format(new Date(entry.entry_date), 'yyyy-MM-dd')
    const slug = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)
    const filename = `${dateStr}-${slug}.md`

    const frontmatter = [
      '---',
      `id: ${entry.id}`,
      `title: "${entry.title}"`,
      `category: ${entry.category}`,
      `date: ${entry.entry_date}`,
      `tags: [${entry.tags.map((t) => `"${t}"`).join(', ')}]`,
      entry.mood ? `mood: ${entry.mood}` : null,
      `pinned: ${entry.is_pinned}`,
      `created_at: ${entry.created_at}`,
      `updated_at: ${entry.updated_at}`,
      '---',
      '',
      `# ${entry.title}`,
      '',
    ].filter((l) => l !== null).join('\n')

    folder.file(filename, frontmatter + entry.body)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `compass-entries-${format(new Date(), 'yyyy-MM-dd')}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
