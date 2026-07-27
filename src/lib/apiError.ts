/**
 * Lê a mensagem de erro que o backend mandou.
 *
 * A API responde `{ success: false, error: "..." }` — nunca `message`.
 * Todo o frontend lia `.message`, então nenhuma mensagem real chegava ao
 * usuário: "Credenciais inválidas", "Créditos insuficientes" e o resto
 * caíam sempre no texto genérico de fallback.
 *
 * Nas falhas de validação o campo vem como array do Zod, e aí o texto do
 * backend não serve para mostrar em tela — por isso só string passa.
 */
export function readApiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { error?: unknown; message?: unknown } } })?.response
    ?.data
  const raw = data?.error ?? data?.message
  return typeof raw === 'string' && raw.trim() ? raw : fallback
}
