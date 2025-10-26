'use client'
import { motion } from 'framer-motion'
export function MotionCard({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}
