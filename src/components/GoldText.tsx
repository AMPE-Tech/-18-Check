import { Fragment } from 'react'

type Props = {
  text: string
  boldGold?: boolean
}

export default function GoldText({ text, boldGold = false }: Props) {
  const parts = text.split(/<gold>(.*?)<\/gold>/g)
  const goldClass = boldGold ? 'text-gold font-semibold' : 'text-gold'

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={goldClass}>
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}
