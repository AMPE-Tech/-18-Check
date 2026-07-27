/**
 * Desfecho de um caso real, derivado do texto de status vindo do dado.
 *
 * É o que decide qual ilustração o card mostra — algema, martelo ou globo.
 * Ver components/CaseIllustration.tsx.
 */
export type Outcome = 'arrest' | 'conviction' | 'extradition'

export function outcomeFromStatus(status: string): Outcome {
  const s = status.toLowerCase()
  if (s.includes('extradit')) return 'extradition'
  if (s.includes('conden')) return 'conviction'
  return 'arrest' // preso, presa, flagrante, mandados, preventiva
}

export const OUTCOME_LABELS: Record<Outcome, string> = {
  arrest: 'Preso',
  conviction: 'Condenado',
  extradition: 'Extraditado',
}
