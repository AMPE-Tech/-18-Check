import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { languages } from '../i18n'

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[1]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-surface border border-surface-border rounded-lg px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-gold hover:border-gold/30 transition-colors cursor-pointer"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{currentLang.flag}</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-surface border border-surface-border rounded-xl shadow-2xl shadow-black/50 py-2 z-[100] max-h-80 overflow-y-auto w-44 scrollbar-phone">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code)
                setOpen(false)
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                i18n.language === lang.code
                  ? 'text-gold bg-gold/10'
                  : 'text-gray-400 hover:text-white hover:bg-surface-light'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
