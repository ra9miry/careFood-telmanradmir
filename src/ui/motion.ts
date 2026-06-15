import type { Transition, Variants } from "framer-motion";

export const ease: Transition["ease"] = [0.22, 0.61, 0.36, 1];

export const press = { scale: 0.98 };

export const screenVariants: Variants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  enter: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.36, ease },
  },
  exit: {
    opacity: 0,
    y: -6,
    filter: "blur(4px)",
    transition: { duration: 0.22, ease },
  },
};

export const listVariants: Variants = {
  initial: {},
  enter: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
};

export const itemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.34, ease } },
};
