import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface ShimmerButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  href?: string
}

export default function ShimmerButton({ children, className = '', onClick, href }: ShimmerButtonProps) {
  const buttonContent = (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`
        relative inline-flex items-center justify-center gap-2 overflow-hidden
        bg-gold text-black font-semibold px-8 py-3.5 rounded-lg text-base
        shadow-lg shadow-gold/20 cursor-pointer
        ${className}
      `}
    >
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
        }}
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
      />

      {/* Glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0 pointer-events-none"
        style={{
          boxShadow: '0 0 30px rgba(212,175,95,0.5), 0 0 60px rgba(212,175,95,0.2)',
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  )

  if (href) {
    if (href.startsWith('#')) {
      return <a href={href}>{buttonContent}</a>
    }
    return <Link to={href}>{buttonContent}</Link>
  }

  return buttonContent
}
