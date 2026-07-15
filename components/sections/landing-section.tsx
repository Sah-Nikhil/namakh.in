"use client";

import Image from "next/image";
import { motion, useTransform, MotionValue } from "framer-motion";

interface LandingSectionProps {
  scrollY: MotionValue<number>;
}

/**
 * Hero — preserves the loved scroll-driven NAMAKH wordmark slide + bouncing
 * arrow, re-set on an editorial "saline" backdrop instead of the colour blobs.
 */
export default function LandingSection({ scrollY }: LandingSectionProps) {
  // Scroll-driven choreography (preserved behaviour)
  const logoScale = useTransform(scrollY, [0, 320], [1, 0.42]);
  const logoY = useTransform(scrollY, [0, 320], [0, -36]);
  const opacity = useTransform(scrollY, [0, 220, 320], [1, 0.6, 0]);
  const bgY = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* ---- Editorial saline backdrop ---- */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-ink" />
        {/* soft saline glows */}
        <div className="drift-slow absolute -top-1/3 left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(243,185,198,0.16),_transparent_62%)] blur-2xl" />
        <div className="drift-slower absolute top-1/4 -right-32 h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle,_rgba(127,178,255,0.12),_transparent_60%)] blur-2xl" />
        <div className="drift-slow absolute bottom-0 -left-24 h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,_rgba(215,219,224,0.08),_transparent_60%)] blur-2xl" />
        {/* hairline editorial grid */}
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-line-soft) 1px, transparent 1px), linear-gradient(90deg, var(--color-line-soft) 1px, transparent 1px)",
            backgroundSize: "88px 88px",
          }}
        />
        {/* vignette to seat the wordmark */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(11,11,13,0.85)_100%)]" />
      </motion.div>

      {/* ---- Top kicker ---- */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ opacity }}
        className="absolute top-[18vh] left-1/2 -translate-x-1/2 text-center"
      >
        <span className="kicker">Electrolytes · Engineered · Est. India</span>
      </motion.div>

      {/* ---- Wordmark (scroll-driven) ---- */}
      <motion.div style={{ opacity }} className="relative z-10">
        <motion.div
          style={{ scale: logoScale, y: logoY }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -22, scale: 0.62, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: -40, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-[78vw] max-w-[480px] md:max-w-[760px] lg:max-w-[1180px]"
          >
            <Image
              src="/assets/namakh_logo.png"
              alt="NAMAKH"
              width={1800}
              height={900}
              priority
              className="h-auto w-full select-none"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="-mt-2 max-w-xl px-6 text-center text-base font-light leading-snug text-bone-dim md:text-xl"
          >
            Precision electrolytes.{" "}
            <span className="text-bone italic font-display">No sugar,</span>{" "}
            no nonsense — just the minerals your body actually runs on.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* ---- Bouncing arrow (preserved) ---- */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="kicker !tracking-[0.3em] text-bone-faint">Scroll</span>
          <span className="text-3xl leading-none text-bone">↓</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
