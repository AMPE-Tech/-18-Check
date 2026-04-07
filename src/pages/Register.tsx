import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import { ShieldCheck, UserPlus } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LanguageSelector from '../components/LanguageSelector'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    setLoading(true)
    try {
      await registerUser(data.name, data.email, data.password)
      navigate('/app')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || t('auth.register_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Glassmorphism card */}
        <div className="bg-surface/80 backdrop-blur-xl border border-surface-border rounded-2xl p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gold/10 border border-gold/20 mb-4">
              <ShieldCheck className="h-7 w-7 text-gold" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white mb-1">
              <span className="text-gold">[18+]</span>Check
            </h1>
            <p className="text-sm text-gray-500">{t('auth.register_subtitle')}</p>
            <div className="flex justify-center mt-3">
              <LanguageSelector />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="name"
              label={t('auth.name')}
              placeholder={t('auth.name_placeholder')}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="email"
              label={t('auth.email')}
              type="email"
              placeholder={t('auth.email_placeholder')}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              label={t('auth.password')}
              type="password"
              placeholder={t('auth.password_min')}
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" loading={loading} className="w-full">
              <UserPlus className="h-4 w-4" />
              {t('auth.register_button')}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">{t('auth.has_account')}</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          {/* Login link */}
          <Link
            to="/login"
            className="flex items-center justify-center w-full py-2.5 rounded-xl border border-surface-border text-gray-400 text-sm font-medium hover:text-gold hover:border-gold/30 transition-all duration-200"
          >
            {t('auth.sign_in')}
          </Link>
        </div>
      </div>
    </div>
  )
}
