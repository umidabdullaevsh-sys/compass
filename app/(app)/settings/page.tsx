'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { exportJSON, exportMarkdownZip } from '@/lib/utils/export'
import { Button } from '@/components/ui/button'
import { type Entry } from '@/types'
import { Moon, Sun, Download } from 'lucide-react'

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('compass-theme', next ? 'dark' : 'light')
  }

  async function handleExportJSON() {
    setExporting(true)
    const supabase = createClient()
    const { data } = await supabase.from('entries').select('*').order('entry_date', { ascending: false })
    exportJSON((data ?? []) as Entry[])
    setExporting(false)
  }

  async function handleExportMarkdown() {
    setExporting(true)
    const supabase = createClient()
    const { data } = await supabase.from('entries').select('*').order('entry_date', { ascending: false })
    await exportMarkdownZip((data ?? []) as Entry[])
    setExporting(false)
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10 space-y-10">
      <h1 className="text-xl font-semibold">Settings</h1>

      {/* Theme */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Appearance</h2>
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
          <div>
            <p className="text-[14px] font-medium">Theme</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Currently {isDark ? 'dark' : 'light'} mode
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-1.5">
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            Switch to {isDark ? 'light' : 'dark'}
          </Button>
        </div>
      </section>

      {/* Export */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Export Data</h2>
        <p className="text-[13px] text-muted-foreground">
          Your data belongs to you. Export it any time.
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div>
              <p className="text-[14px] font-medium">JSON export</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">All entries as a single JSON file</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportJSON} disabled={exporting} className="gap-1.5">
              <Download size={13} /> Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
            <div>
              <p className="text-[14px] font-medium">Markdown zip</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">One .md file per entry, grouped by category</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportMarkdown} disabled={exporting} className="gap-1.5">
              <Download size={13} /> Export
            </Button>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="text-[12px] text-muted-foreground space-y-1 pt-4 border-t border-border">
        <p>Compass — personal journal & knowledge system</p>
        <p>Data stored in Supabase Postgres with row-level security.</p>
      </section>
    </div>
  )
}
