'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Mountain, LogOut, User, Menu, X, LayoutDashboard, Route, Backpack } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/utils'

const AUTH_NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trips', label: 'Trips', icon: Route },
  { href: '/gear', label: 'Gear', icon: Backpack },
]

export default function Navigation() {
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname?.startsWith(href)
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup'
  if (isAuthPage) return null

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <Mountain className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight">TrailMate</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : user ? (
              <>
                {AUTH_NAV_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} className={cn('text-sm font-medium transition-colors', isActive(href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                    {label}
                  </Link>
                ))}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="max-w-[120px] truncate">{user.email}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
                <Link href="/signup"><Button size="sm" className="rounded-full px-6">Start Exploring</Button></Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-foreground hover:text-primary transition-colors" aria-expanded={mobileMenuOpen} aria-controls="mobile-menu" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 space-y-1 border-t border-border">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : user ? (
              <>
                {AUTH_NAV_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} className={cn('block px-4 py-3 text-sm font-medium rounded-md transition-colors', isActive(href) ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground')} onClick={() => setMobileMenuOpen(false)}>
                    {label}
                  </Link>
                ))}
                <div className="pt-4 mt-4 px-4 space-y-3 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><User className="h-4 w-4" /><span className="truncate">{user.email}</span></div>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full"><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
                <div className="pt-4 px-4"><Link href="/signup" className="block" onClick={() => setMobileMenuOpen(false)}><Button className="w-full">Start Exploring</Button></Link></div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
