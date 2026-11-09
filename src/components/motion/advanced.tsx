"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function CountUp({
  value,
  suffix = "",
  prefix = "",
  className,
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const progress = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(progress, (latest) =>
    `${prefix}${latest.toLocaleString("en-NG", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    })}${suffix}`,
  );

  if (inView && !reduce) progress.set(value);

  return (
    <span ref={ref} className={className}>
      {reduce || !inView ? `${prefix}${value.toLocaleString("en-NG", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}${suffix}` : <motion.span>{display}</motion.span>}
    </span>
  );
}

export function ParallaxImage({
  src,
  alt = "",
  className,
  strength = 60,
}: {
  src: string;
  alt?: string;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [strength, -strength]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={reduce ? undefined : { y }} className="absolute inset-[-15%]">
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </motion.div>
    </div>
  );
}

export function FloatIn({
  children,
  className,
  delay = 0,
  y = 32,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? undefined : { opacity: 0, y, scale: 0.98 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
