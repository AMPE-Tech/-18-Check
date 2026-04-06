import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import { ShieldCheck } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import LanguageSelector from '../components/LanguageSelector'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const { login } = useAuth()
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
      await login(data.email, data.password)
      navigate('/app')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || t('auth.login_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <ShieldCheck className="h-8 w-8 text-gold" />
            <span className="font-display font-bold text-xl text-white">
              <span className="text-gold">[18+]</span>Check
            </span>
          </div>
          <div className="flex justify-center mb-3">
            <LanguageSelector />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">{t('auth.login_title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('auth.login_subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            placeholder={t('auth.password_placeholder')}
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" loading={loading} className="w-full">
            {t('auth.login_button')}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-gold transition-colors">
            {t('auth.forgot_password')}
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="text-gold hover:text-gold-light transition-colors">
            {t('auth.create_account')}
          </Link>
        </p>
      </Card>
    </div>
  )
}
