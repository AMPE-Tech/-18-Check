import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, ArrowLeft, Mail } from 'lucide-react'
import api from '../lib/api'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import LanguageSelector from '../components/LanguageSelector'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setSent(true)
    } catch {
      // Always show success to prevent email enumeration
      setSent(true)
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
          <h1 className="font-display font-bold text-2xl text-white">{t('auth.forgot_password')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('auth.forgot_subtitle')}</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-gold" />
            </div>
            <p className="text-white font-medium mb-2">{t('auth.forgot_sent_title')}</p>
            <p className="text-sm text-gray-400 mb-6">{t('auth.forgot_sent_desc')}</p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('auth.back_to_login')}
              </Button>
            </Link>
          </div>
        ) : (
          <>
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
              <Button type="submit" loading={loading} className="w-full">
                {t('auth.forgot_button')}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              <Link to="/login" className="text-gold hover:text-gold-light transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                {t('auth.back_to_login')}
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  )
}
