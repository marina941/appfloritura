import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<PillProps["variant"]>, string> = {
  primary: "bg-magenta text-white hover:bg-magenta/90",
  secondary: "bg-sage text-white hover:bg-sage/90",
  ghost: "bg-sage-light text-leaf hover:bg-sage/15 border border-sage/30",
};

export function Pill({ variant = "ghost", className = "", children, ...rest }: PillProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-pill px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
