import { motion } from 'framer-motion'

interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  mode?: 'word' | 'letter'
}

export default function TextReveal({ text, className = '', delay = 0, mode = 'word' }: TextRevealProps) {
  const units = mode === 'word' ? text.split(' ') : text.split('')

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: mode === 'word' ? 0.08 : 0.03,
        delayChildren: delay,
      },
    },
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  }

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {units.map((unit, i) => (
        <motion.span
          key={i}
          variants={child}
          className="inline-block"
          style={{ marginRight: mode === 'word' ? '0.3em' : undefined }}
        >
          {unit}
        </motion.span>
      ))}
    </motion.span>
  )
}
