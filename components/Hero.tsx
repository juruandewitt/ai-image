'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start','end start'] })
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const blur = useTransform(scrollYProgress, [0, 1], ['0px', '6px'])
  const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7 } }
  const stagger = { animate: { transition: { staggerChildren: 0.12 } } }

  return (
    <section ref={ref} className="relative overflow-hidden rounded-2xl">
      <motion.div
        style={{ y: yBg, filter: blur as any }}
        className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-amber-500"
      />
      <div className="absolute inset-0 -z-10 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="relative text-white text-center px-6 py-24 md:py-28 space-y-6"
      >
        <motion.h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg" {...fadeIn}>
          Discover the Future of Art
        </motion.h1>
        <motion.p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto" {...fadeIn}>
          Explore, collect, and be inspired by stunning AI-generated artworks crafted by digital creators worldwide.
        </motion.p>
        <motion.div className="flex flex-wrap justify-center gap-4" {...fadeIn}>
          <Link href="/explore" className="px-6 py-3 rounded-md bg-white text-indigo-700 font-semibold shadow-md hover:scale-105 transition-transform">
            Explore the Gallery
          </Link>
          <Link href="/explore" className="px-6 py-3 rounded-md border border-white text-white font-semibold hover:bg-white/10 transition">
            Latest Drops
          </Link>
        </motion.div>
      </motion.div>
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black/30 to-transparent" />
    </section>
  )
}
