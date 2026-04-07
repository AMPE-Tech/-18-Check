import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown } from 'lucide-react'
import { languages } from '../i18n'

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const langBase = i18n.language?.split('-')[0] || 'en'
  const currentLang = languages.find((l) => l.code === langBase) || languages.find((l) => l.code === 'en') || languages[1]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-surface/80 border border-surface-border rounded-lg px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-gold hover:border-gold/30 transition-all duration-200 cursor-pointer backdrop-blur-sm"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="font-semibold uppercase tracking-widest">{currentLang.code}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180 text-gold' : ''}`} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-surface/95 backdrop-blur-md border border-surface-border rounded-xl shadow-2xl shadow-black/60 py-1.5 z-[100] max-h-80 overflow-y-auto w-44 scrollbar-phone animate-[fadeIn_150ms_ease-out]">
          {languages.map((lang) => {
            const isActive = langBase === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-gold bg-gold/10 border-l-2 border-gold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <span className="font-mono font-bold uppercase text-[10px] w-5 text-center">{lang.code}</span>
                <span className="font-medium flex-1">{lang.label}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
