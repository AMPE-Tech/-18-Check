import { motion } from 'framer-motion'

interface AuroraBackgroundProps {
  className?: string
  intensity?: 'subtle' | 'normal'
}

export default function AuroraBackground({ className = '', intensity = 'normal' }: AuroraBackgroundProps) {
  const opacity = intensity === 'subtle' ? 0.06 : 0.12

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Base radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,95,0.08),transparent_60%)]" />

      {/* Floating orb 1 */}
      <motion.div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: 400,
          height: 400,
          background: `radial-gradient(circle, rgba(212,175,95,${opacity}), transparent 70%)`,
          top: '10%',
          left: '20%',
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating orb 2 */}
      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{
          width: 300,
          height: 300,
          background: `radial-gradient(circle, rgba(184,148,63,${opacity * 0.8}), transparent 70%)`,
          top: '30%',
          right: '15%',
        }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 30, -50, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating orb 3 */}
      <motion.div
        className="absolute rounded-full blur-[140px]"
        style={{
          width: 350,
          height: 350,
          background: `radial-gradient(circle, rgba(232,204,127,${opacity * 0.5}), transparent 70%)`,
          bottom: '10%',
          left: '40%',
        }}
        animate={{
          x: [0, 40, -60, 0],
          y: [0, -30, 40, 0],
          scale: [1, 1.08, 0.92, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}
