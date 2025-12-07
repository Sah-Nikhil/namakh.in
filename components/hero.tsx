"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import styles from "./Hero.module.css";

const assets: { src: string; alt: string; width?: number; height?: number }[] = [
  { src: "/assets/namakh_logo.png", alt: "Namakh Logo", width: 1800, height: 900 },
  { src: "/assets/namakh_logo_droplet.png", alt: "Namakh Droplet", width: 900, height: 900 }, // <- new file
];


const fadeFlyIn: {
  initial: { opacity: number; y: number; filter: string };
  animate: { opacity: number; y: number; filter: string };
  transition: Transition;
} = {
  initial: { opacity: 0, y: 24, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  // a safe transition typed as framer-motion's Transition
  transition: { duration: 1.8, ease: ([0.22, 1, 0.36, 1] as unknown) as Transition["ease"] },
};

export default function Hero() {
  const strip = [...assets, ...assets];

  return (
    <section className={styles.hero}>
      <motion.div
        initial={fadeFlyIn.initial}
        animate={fadeFlyIn.animate}
        transition={fadeFlyIn.transition}
      >
        <div className={styles.track} aria-hidden>
          {strip.map((a, i) => (
            <div className={styles.asset} key={i}>
              <Image
                src={a.src}
                alt={a.alt}
                width={a.width ?? 1600}
                height={a.height ?? 600}
                priority={i < assets.length}
                sizes="(min-width: 1024px) 40vw, 80vw"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
