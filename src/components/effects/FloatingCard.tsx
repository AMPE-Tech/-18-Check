import { type ReactNode, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface FloatingCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export default function FloatingCard({
  children,
  className = '',
  glowColor = 'rgba(212,175,95,0.15)',
}: FloatingCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setRotateX((y - 0.5) * -8)
    setRotateY((x - 0.5) * 8)
    setGlowPos({ x: x * 100, y: y * 100 })
  }

  function handleMouseLeave() {
    setRotateX(0)
    setRotateY(0)
    setGlowPos({ x: 50, y: 50 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{ perspective: 800, transformStyle: 'preserve-3d' }}
      className={`relative group ${className}`}
    >
      {/* Border glow overlay */}
      <div
        className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 60%)`,
        }}
      />

      <div className="relative rounded-xl border border-surface-border bg-surface overflow-hidden h-full">
        {/* Inner glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(212,175,95,0.04), transparent 50%)`,
          }}
        />
        <div className="relative z-10 h-full">{children}</div>
      </div>
    </motion.div>
  )
}
