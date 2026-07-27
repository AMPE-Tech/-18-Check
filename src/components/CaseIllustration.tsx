/**
 * Ilustração temática do desfecho de um caso real.
 *
 * REGRA: a imagem representa o DESFECHO, nunca a pessoa.
 *
 * Prisão vira algema, condenação vira martelo de juiz, extradição vira globo.
 * Em nenhum caso exibimos o rosto de quem foi preso ou condenado — o card
 * ilustra o tipo de crime e o que aconteceu com ele, e é isso que a vítima
 * precisa reconhecer ao olhar. Retrato de pessoa real, ainda que condenada e
 * noticiada, é exposição sem necessidade e risco jurídico sem retorno.
 *
 * Vetor, e não foto de banco de imagem: sem licenciamento, sem requisição
 * externa, peso desprezível, nítido em qualquer densidade de tela. E foto de
 * banco de imagem, num produto que se pretende premium, sempre se denuncia.
 *
 * Desenhado na paleta blindada — gold #D4AF5F sobre dark #0C0C0E.
 */

import { OUTCOME_LABELS, type Outcome } from '../lib/caseOutcome'

function Handcuffs() {
  /* Argolas lado a lado, não na diagonal: em 36px a diagonal lê como óculos.
     A corrente central é o que faz o desenho ser reconhecido como algema. */
  return (
    <>
      {/* argolas — ovais e levemente inclinadas, como pulso preso */}
      <ellipse cx="17" cy="32" rx="10.5" ry="12.5" transform="rotate(-10 17 32)" />
      <ellipse cx="47" cy="32" rx="10.5" ry="12.5" transform="rotate(10 47 32)" />
      {/* caixa da trava na borda interna — é este detalhe que diferencia
          algema de dois círculos quaisquer */}
      <rect x="24.5" y="26.5" width="6" height="11" rx="1.5" />
      <rect x="33.5" y="26.5" width="6" height="11" rx="1.5" />
      {/* elo central unindo as duas travas */}
      <path d="M30.5 32h3" strokeWidth="3" strokeLinecap="round" />
    </>
  )
}

function Gavel() {
  return (
    <>
      {/* cabeça do martelo, inclinada */}
      <rect x="30" y="9" width="21" height="12" rx="2.5" transform="rotate(45 40.5 15)" />
      {/* cabo */}
      <path d="M30 26L16 40" strokeWidth="3.2" strokeLinecap="round" />
      {/* base */}
      <rect x="14" y="46" width="36" height="6" rx="2.5" />
      <path d="M20 46v-3h24v3" opacity="0.55" />
      {/* impacto */}
      <path d="M48 30h5M46 24l4-3M46 36l4 3" opacity="0.45" strokeLinecap="round" />
    </>
  )
}

function Globe() {
  return (
    <>
      <circle cx="32" cy="32" r="20" />
      {/* meridianos */}
      <ellipse cx="32" cy="32" rx="8.5" ry="20" />
      {/* paralelos */}
      <path d="M13.5 24h37M13.5 40h37" opacity="0.6" />
      {/* trajeto de extradição */}
      <path
        d="M16 47c10-9 24-13 34-22"
        strokeDasharray="3 3.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path d="M45 24.5l5.5.5-1 5.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  )
}

const SHAPES: Record<Outcome, () => React.JSX.Element> = {
  arrest: Handcuffs,
  conviction: Gavel,
  extradition: Globe,
}

export default function CaseIllustration({
  outcome,
  className = '',
}: {
  outcome: Outcome
  className?: string
}) {
  const Shape = SHAPES[outcome]

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      role="img"
      aria-label={OUTCOME_LABELS[outcome]}
    >
      <Shape />
    </svg>
  )
}
