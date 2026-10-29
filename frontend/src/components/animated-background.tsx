"use client";

import * as React from "react";
import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();

  // Floating keyframe animations (20-32s loops with soft transitions)
  const orb1Animation: TargetAndTransition | undefined = shouldReduceMotion
    ? undefined
    : {
        x: [0, 50, -35, 0],
        y: [0, -40, 25, 0],
        scale: [1, 1.08, 0.94, 1],
        transition: {
          duration: 26,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
      };

  const orb2Animation: TargetAndTransition | undefined = shouldReduceMotion
    ? undefined
    : {
        x: [0, -60, 25, 0],
        y: [0, 45, -30, 0],
        scale: [1, 0.92, 1.06, 1],
        transition: {
          duration: 30,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
      };

  const orb3Animation: TargetAndTransition | undefined = shouldReduceMotion
    ? undefined
    : {
        x: [0, 35, -45, 0],
        y: [0, -25, 40, 0],
        scale: [1, 1.05, 0.95, 1],
        transition: {
          duration: 34,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
      };

  const orb4Animation: TargetAndTransition | undefined = shouldReduceMotion
    ? undefined
    : {
        x: [0, -30, 40, 0],
        y: [0, 35, -35, 0],
        scale: [1, 0.94, 1.07, 1],
        transition: {
          duration: 28,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
      };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none ${className ?? ""}`}
    >
      {/* Container with heavy Gaussian blur for smooth, continuous fluid blending */}
      <div className="relative h-full w-full filter blur-[80px] sm:blur-[120px] transform-gpu">
        {/* Orb 1: Deep Forest Green / Emerald (Top-Left quadrant) */}
        <motion.div
          animate={orb1Animation}
          className="absolute -top-[15%] -left-[10%] h-[450px] w-[450px] rounded-full sm:h-[700px] sm:w-[700px] opacity-70 dark:opacity-85"
          style={{
            background:
              "radial-gradient(circle at center, oklch(0.42 0.12 148 / 0.14) 0%, oklch(0.35 0.09 148 / 0.04) 50%, transparent 70%)",
          }}
        />

        {/* Orb 2: Vibrant Lime Accent Glow (Top-Right quadrant) */}
        <motion.div
          animate={orb2Animation}
          className="absolute -top-[10%] -right-[15%] h-[400px] w-[400px] rounded-full sm:h-[650px] sm:w-[650px] opacity-65 dark:opacity-75"
          style={{
            background:
              "radial-gradient(circle at center, oklch(0.88 0.18 128 / 0.12) 0%, oklch(0.80 0.15 132 / 0.03) 50%, transparent 70%)",
          }}
        />

        {/* Orb 3: Mid-Tone Emerald / Sage Foundation (Bottom-Left quadrant) */}
        <motion.div
          animate={orb3Animation}
          className="absolute top-[45%] -left-[15%] h-[500px] w-[500px] rounded-full sm:h-[750px] sm:w-[750px] opacity-60 dark:opacity-80"
          style={{
            background:
              "radial-gradient(circle at center, oklch(0.50 0.12 145 / 0.10) 0%, oklch(0.38 0.10 148 / 0.03) 50%, transparent 70%)",
          }}
        />

        {/* Orb 4: Subtle Lime & Forest Fusion (Bottom-Right quadrant) */}
        <motion.div
          animate={orb4Animation}
          className="absolute top-[50%] -right-[10%] h-[420px] w-[420px] rounded-full sm:h-[680px] sm:w-[680px] opacity-60 dark:opacity-75"
          style={{
            background:
              "radial-gradient(circle at center, oklch(0.78 0.16 135 / 0.10) 0%, oklch(0.60 0.14 142 / 0.03) 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Subtle architectural vignette overlay for readable edge contrast */}
      <div className="absolute inset-0 bg-background/35 backdrop-blur-[1px] dark:bg-background/45" />
    </div>
  );
}
