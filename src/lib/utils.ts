import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function riskColor(level: string) {
  switch (level) {
    case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/30'
    case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    case 'LOW': return 'text-green-400 bg-green-400/10 border-green-400/30'
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
  }
}

export function riskLabel(level: string) {
  switch (level) {
    case 'HIGH': return 'Alto Risco'
    case 'MEDIUM': return 'Risco Moderado'
    case 'LOW': return 'Baixo Risco'
    case 'NONE': return 'Sem Risco'
    default: return level
  }
}
