import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { ShieldCheck } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
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
      setError(msg || 'Erro ao criar conta. Tente novamente.')
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
          <h1 className="font-display font-bold text-2xl text-white">Criar sua conta</h1>
          <p className="text-sm text-gray-500 mt-1">3 pesquisas grátis para começar</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="name"
            label="Nome completo"
            placeholder="Seu nome"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="password"
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit" loading={loading} className="w-full">
            Criar Conta
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-gold hover:text-gold-light transition-colors">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  )
}
