"use client";
import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const transition = {
    type: "spring",
    mass: 0.5,
    damping: 11.5,
    stiffness: 100,
    restDelta: 0.001,
    restSpeed: 0.001,
};

export const MenuItem = ({
    setActive,
    active,
    item,
    children,
    }: {
    setActive: (item: string) => void;
    active: string | null;
    item: string;
    children?: React.ReactNode;
    }) => {
    return (
        <div onMouseEnter={() => setActive(item)} className="relative ">
        <motion.p
            transition={{ duration: 0.3 }}
            className="cursor-pointer text-white hover:opacity-[0.9]"
        >
            {item}
        </motion.p>
        {active !== null && (
            <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={transition}
            >
            {active === item && (
                <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
                <motion.div
                    transition={transition}
                    layoutId="active" // layoutId ensures smooth animation
                    className="bg-black/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/[0.2] shadow-xl"
                >
                    <motion.div
                    layout // layout ensures smooth animation
                    className="w-max h-full p-4"
                    >
                    {children}
                    </motion.div>
                </motion.div>
                </div>
            )}
            </motion.div>
        )}
        </div>
    );
};

export const Menu = ({
    setActive,
    children,
    logoSrc = "/assets/namakh_logo.png",
    }: {
    setActive: (item: string | null) => void;
    children: React.ReactNode;
    logoSrc?: string;
    }) => {
    return (
        <nav
        onMouseLeave={() => setActive(null)} // resets the state
        className="relative rounded-full border border-white/[0.2] bg-black/85 shadow-input flex items-center px-8 py-6 "
        >
        {/* Logo pinned to the left of the navbar */}
        <Link href="/" className="flex items-center">
            <Image src={logoSrc} alt="Logo" width={120} height={60} className="mr-6" />
        </Link>
        <div className="flex-1 flex justify-center">
            <div className="flex justify-center items-center gap-12 w-full">
            {children}
            </div>
        </div>
        <div className="justify-end flex">
          <MenuItem setActive={setActive} active={null} item="Your Cart">
          </MenuItem>
        </div>
        </nav>
    );
};

export const ProductItem = ({
    title,
    description,
    href,
    src,
    }: {
    title: string;
    description: string;
    href: string;
    src: string;
    }) => {
    return (
        <a href={href} className="flex space-x-2">
        <img
            src={src}
            width={140}
            height={70}
            alt={title}
            className="shrink-0 rounded-md shadow-2xl"
        />
        <div className="flex flex-col justify-center">
            <h4 className="text-xl font-bold mb-1 text-white">
            {title}
            </h4>
            <p className="text-neutral-300 text-sm max-w-[10rem] whitespace-nowrap">
            {description}
            </p>
        </div>
        </a>
    );
};

export const HoveredLink = ({ children, ...rest }: any) => {
    return (
        <a
        {...rest}
    className="text-neutral-200 hover:text-black "
        >
        {children}
        </a>
    );
};
