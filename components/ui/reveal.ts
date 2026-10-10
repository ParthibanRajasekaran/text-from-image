/**
 * One scroll-reveal for the whole site. Spread it on a motion element:
 *   <motion.section {...reveal} className="...">
 * Duration and easing come from <MotionConfig> in AppShell, and reducedMotion="user" there turns the
 * movement off for visitors who ask for less motion, so nothing here needs its own check.
 */
export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
} as const;
