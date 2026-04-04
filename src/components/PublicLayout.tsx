import { Outlet, Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-surface-border bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <ShieldCheck className="h-7 w-7 text-gold" />
            <span className="font-display font-bold text-lg text-white">
              <span className="text-gold">[18+]</span>Check
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link
              to="/register"
              className="text-sm bg-gold text-black font-semibold px-4 py-2 rounded-lg hover:bg-gold-light transition-colors"
            >
              Criar Conta
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-surface-border py-8 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-6">
          <p>&copy; {new Date().getFullYear()} [18+]Check &mdash; 18check.online. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
