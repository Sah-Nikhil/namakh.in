"use client"

import { motion, useTransform } from 'framer-motion'

export default function LandingSection({ scrollY }) {
  // Transform logo size and position based on scroll
  const logoScale = useTransform(scrollY, [0, 300], [1, 0.15])
  const logoY = useTransform(scrollY, [0, 300], [0, -45])
  const opacity = useTransform(scrollY, [0, 200, 300], [1, 0.5, 0])

  return (
    <section className="h-screen flex items-center justify-center relative overflow-hidden">
        <motion.div style={{ opacity }}>
            <motion.div
                style={{
                scale: logoScale,
                y: logoY,
                }}
                className="relative z-10 flex flex-col items-center"
            >
                <motion.img
                src="/assets/namakh_logo_droplet.png"
                alt="Namakh Droplet"
                className="w-[450px] md:w-[650px] h-auto mb-6"
                initial={{ opacity: 0, scale: 0.65 }}
                animate={{ opacity: 1, scale: 0.85, y: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                />
                <motion.img
                className="text-5xl md:text-7xl font-bold text-brand-red tracking-tight mt-6 md:mt-8"
                style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
                src="/assets/namakh_logo.png"
                alt="Namakh Logo"
                initial={{ opacity: 0, y: -25, scale: 0.55 }}
                animate={{ opacity: 1, y: -70 }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                />
            </motion.div>
        </motion.div>

        <motion.div
            style={{ opacity }}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
        >
            <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-brand-red text-4xl text-white"
            >
            ↓
            </motion.div>
        </motion.div>
    </section>
  )
}
