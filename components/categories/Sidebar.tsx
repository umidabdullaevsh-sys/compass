'use client'

import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Compass, Plus, Settings, LogOut } from 'lucide-react'
import { CATEGORIES, CATEGORY_META } from '@/lib/utils/categories'
import { createClient } from '@/lib/supabase/client'
import CategoryIcon from './CategoryIcon'

export default function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeCategory = searchParams.get('category')

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <aside
      className="hidden md:flex flex-col border-r border-border bg-card"
      style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)' }}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border flex items-center gap-2.5">
        <Compass size={20} className="text-primary flex-shrink-0" />
        <span className="font-semibold text-[15px] tracking-tight">Compass</span>
      </div>

      {/* New entry */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/new"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} />
          New Entry
        </Link>
      </div>

      {/* All entries */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <Link
          href="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
            pathname === '/' && !activeCategory
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          All Entries
        </Link>

        <div className="pt-3 pb-1 px-3">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Categories
          </span>
        </div>

        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat]
          const isActive = activeCategory === cat
          return (
            <Link
              key={cat}
              href={`/?category=${cat}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <CategoryIcon name={meta.icon} color={meta.color} size={14} />
              {cat}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-border space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Settings size={14} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full text-left"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
