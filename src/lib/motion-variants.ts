export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
}

export const subtleSpring = {
  type: 'spring',
  stiffness: 240,
  damping: 24,
} as const

export const motionTokens = {
  duration: {
    fast: 0.16,
    normal: 0.24,
    slow: 0.36,
  },
  stagger: {
    tight: 0.06,
    normal: 0.1,
  },
} as const

export const reducedMotionTransition = { duration: 0 } as const
