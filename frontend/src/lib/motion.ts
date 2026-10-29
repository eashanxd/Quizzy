import { Transition, Variants } from "motion/react";

/**
 * Standard easing curves for scholarly, disciplined animations
 */
export const EASINGS = {
  easeOutCubic: [0.22, 1, 0.36, 1] as const,
  easeInOutCubic: [0.65, 0, 0.35, 1] as const,
  anticipate: [0.38, -0.05, 0.24, 1] as const,
};

/**
 * Common transitions
 */
export const TRANSITIONS = {
  fast: { duration: 0.18, ease: "easeOut" } as Transition,
  normal: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as Transition,
  smooth: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as Transition,
  slow: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } as Transition,
};

/**
 * Container variant for staggered child reveals
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/**
 * Subtle upward fade for headers, sections, and items
 */
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Gentle scale-in variant for dialogs, cards, and summary stats
 */
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/**
 * Reduced motion fallbacks
 */
export const reducedFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15 },
  },
};

/**
 * Interactive button and card micro-interaction configurations
 */
export const interactiveCardMotion = {
  whileHover: { y: -2, transition: { duration: 0.2, ease: "easeOut" } },
  whileTap: { scale: 0.99, transition: { duration: 0.1 } },
};

export const interactiveButtonMotion = {
  whileHover: { scale: 1.01, transition: { duration: 0.15 } },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};
