import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import {
  ShieldCheck,
  LayoutDashboard,
  Search,
  History,
  CreditCard,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils'
import LanguageSelector from './LanguageSelector'

export default function Layout() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { to: '/app', icon: LayoutDashboard, label: t('layout.panel') },
    { to: '/app/search', icon: Search, label: t('layout.search') },
    { to: '/app/history', icon: History, label: t('layout.history') },
    { to: '/app/plans', icon: CreditCard, label: t('layout.plans') },
  ]

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-border flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-surface-border">
          <ShieldCheck className="h-6 w-6 text-gold" />
          <span className="font-display font-bold text-white">
            <span className="text-gold">[18+]</span>Check
          </span>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors mb-2"
          >
            <Home className="h-4.5 w-4.5" />
            {t('layout.home')}
          </Link>
          <div className="border-b border-surface-border mb-2" />
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gold/10 text-gold border border-gold/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            {t('layout.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-surface-border bg-surface/50 backdrop-blur-sm flex items-center px-6 lg:px-8 sticky top-0 z-30">
          <button
            className="lg:hidden mr-4 text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4 text-sm">
            <LanguageSelector />
            <span className="text-gray-500">{t('dashboard.credits')}:</span>
            <span className="font-mono font-medium text-gold">{user?.credits ?? 0}</span>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-red-400 transition-colors ml-2"
              title={t('layout.logout')}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline text-xs">{t('layout.logout')}</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
