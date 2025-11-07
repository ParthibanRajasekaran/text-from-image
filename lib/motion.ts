import { useReducedMotion } from "framer-motion";

export const motionTransition = { 
  type: "spring" as const, 
  stiffness: 320, 
  damping: 30 
};

export const useSafeMotion = () => useReducedMotion();
