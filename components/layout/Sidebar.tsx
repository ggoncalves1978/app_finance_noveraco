'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserRole } from '@/lib/auth/roles'
import {
  LayoutDashboard,
  Calculator,
  ShoppingCart,
  Search,
  Settings,
  LogOut,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const NAV_ITEMS = [
  { href: '/dashboard',              label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/dashboard/precificacao', label: 'Precificação',  icon: Calculator },
  { href: '/dashboard/vendas',       label: 'Vendas',        icon: ShoppingCart },
  { href: '/dashboard/seo',          label: 'SEO',           icon: Search },
]

interface SidebarProps {
  role: UserRole
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const linkClass = (href: string) =>
    cn(
      'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      isActive(href) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
    )

  return (
    <aside className="flex h-screen w-16 flex-col items-center border-r bg-card py-4 md:w-56 md:items-start md:px-3">
      {/* Logo */}
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold md:w-full md:rounded-md md:px-2 md:justify-start">
        <span className="hidden md:block text-sm font-semibold tracking-tight">Novera Co.</span>
        <span className="md:hidden text-lg">N</span>
      </div>

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-1 w-full">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} title={label} className={linkClass(href)}>
            <Icon className="h-5 w-5 shrink-0" />
            <span className="hidden md:block">{label}</span>
          </Link>
        ))}

        {role === UserRole.ADMIN && (
          <Link
            href="/dashboard/configuracoes"
            title="Configurações"
            className={linkClass('/dashboard/configuracoes')}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span className="hidden md:block">Configurações</span>
          </Link>
        )}
      </nav>

      <Separator className="my-3" />

      {/* Logout */}
      <form action="/api/auth/logout" method="POST" className="w-full">
        <button
          type="submit"
          title="Sair"
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
            'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="hidden md:block">Sair</span>
        </button>
      </form>
    </aside>
  )
}
