import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-celo-green text-celo-black shadow-lg shadow-celo-green/20 hover:bg-celo-green/95 focus-visible:ring-celo-yellow",
  secondary:
    "bg-celo-yellow text-celo-black shadow-md shadow-celo-yellow/20 hover:brightness-105 focus-visible:ring-celo-green",
  outline:
    "border border-celo-white/20 bg-celo-white/5 text-celo-white hover:border-celo-yellow/40 hover:bg-celo-yellow/5 hover:text-celo-yellow",
  ghost: "bg-transparent text-celo-white/80 hover:bg-celo-white/5 hover:text-celo-white",
};

export function Button({
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={[
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold tracking-tight transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-celo-black",
        "disabled:cursor-not-allowed disabled:opacity-50",
        fullWidth && "w-full",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
          <span>Aguarde...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
