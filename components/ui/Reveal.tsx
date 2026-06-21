"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import * as React from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({ children, delay = 0, y = 16, once = true, className, ...p }: { children: React.ReactNode; delay?: number; y?: number; once?: boolean } & HTMLMotionProps<"div">) {
    const reduce = useReducedMotion();
    return (
        <motion.div initial={reduce ? false : { opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once, margin: "-60px" }} transition={{ duration: 0.6, ease: EASE, delay }} className={className} {...p}>
            {children}
        </motion.div>
    );
}

export function Stagger({ children, className, gap = 0.07 }: { children: React.ReactNode; className?: string; gap?: number }) {
    return <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={{ show: { transition: { staggerChildren: gap } } }}>{children}</motion.div>;
}
export function StaggerItem({ children, className, y = 14 }: { children: React.ReactNode; className?: string; y?: number }) {
    const reduce = useReducedMotion();
    return <motion.div className={className} variants={{ hidden: reduce ? { opacity: 0 } : { opacity: 0, y }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } } }}>{children}</motion.div>;
}
