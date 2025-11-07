import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Futuristic aurora background with:
 * - Two animated radial gradient blobs + conic layer
 * - Subtle grid mask overlay
 * - SVG grain texture for premium feel
 * - Respects prefers-reduced-motion
 * - Zero CLS (all positioned absolutely)
 */
export function AuroraBackground({ children, className = '' }: AuroraBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Aurora gradient blobs */}
      <div
        className="absolute inset-0 -z-10"
        style={{ willChange: shouldReduceMotion ? 'auto' : 'background-position' }}
      >
        {/* Blob 1: Cyan/Blue */}
        <motion.div
          className="absolute top-0 -left-1/4 w-1/2 h-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
          }}
          animate={
            shouldReduceMotion || !mounted
              ? {}
              : {
                  x: [0, 100, 0],
                  y: [0, 50, 0],
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Blob 2: Purple/Magenta */}
        <motion.div
          className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent-2)) 0%, transparent 70%)',
          }}
          animate={
            shouldReduceMotion || !mounted
              ? {}
              : {
                  x: [0, -100, 0],
                  y: [0, -50, 0],
                }
          }
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Conic gradient layer for complexity */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `conic-gradient(
              from 0deg at 50% 50%,
              hsl(var(--accent)) 0deg,
              hsl(var(--accent-2)) 120deg,
              hsl(var(--primary)) 240deg,
              hsl(var(--accent)) 360deg
            )`,
            backgroundSize: '200% 200%',
          }}
          animate={
            shouldReduceMotion || !mounted
              ? {}
              : {
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }
          }
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--text)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--text)) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* SVG grain texture */}
      <svg className="absolute inset-0 -z-10 w-full h-full opacity-[0.015] dark:opacity-[0.025] pointer-events-none">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
