import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { press } from "./motion";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "primary" | "secondary" | "quiet";
  full?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  full,
  loading,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      className={`btn btn--${variant}${full ? " btn--full" : ""} ${className}`}
      whileTap={press}
      disabled={disabled || loading}
      {...rest}
    >
      <span className="btn__label" data-busy={loading || undefined}>
        {children}
      </span>
      {loading && <span className="spinner" aria-hidden="true" />}
    </motion.button>
  );
}
