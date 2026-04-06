import { Outlet, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import LanguageSelector from './LanguageSelector'

export default function PublicLayout() {
  const { t } = useTranslation()
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
          <nav className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              {t('auth.sign_in')}
            </Link>
            <Link
              to="/register"
              className="text-sm bg-gold text-black font-semibold px-4 py-2 rounded-lg hover:bg-gold-light transition-colors"
            >
              {t('nav.investigate')}
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-surface-border py-12 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <span className="font-display font-bold text-white">
                  <span className="text-gold">[18+]</span>Check
                </span>
              </Link>
              <p className="text-xs text-gray-600 leading-relaxed">
                Pesquisa discreta de conteudo adulto com inteligencia artificial.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Produto</p>
              <ul className="space-y-2">
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#precos" className="hover:text-white transition-colors">Precos</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Legal</p>
              <ul className="space-y-2">
                <li><Link to="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contato</p>
              <ul className="space-y-2">
                <li><a href="mailto:suporte@18check.online" className="hover:text-white transition-colors">suporte@18check.online</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-surface-border pt-6 text-center text-xs text-gray-600">
            <p>&copy; {new Date().getFullYear()} [18+]Check &mdash; 18check.online. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
