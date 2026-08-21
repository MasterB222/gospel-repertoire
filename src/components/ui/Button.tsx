import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-accent text-[#2A0F1E] shadow-[0_6px_20px_-6px_rgba(212,169,74,0.55)] hover:bg-accent-soft font-semibold",
  secondary: "border border-border bg-surface-raised text-ink hover:border-accent/60",
  ghost: "text-ink hover:bg-surface-raised",
  danger: "border border-danger/50 text-danger hover:bg-danger/10",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_STYLES[variant],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
