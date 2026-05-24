import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-2 border-celo-yellow bg-celo-yellow text-celo-black hover:bg-celo-black hover:text-celo-yellow focus-visible:ring-editorial-lilac",
  secondary:
    "border-2 border-celo-white bg-celo-white text-celo-black hover:bg-celo-black hover:text-celo-white focus-visible:ring-celo-yellow",
  outline:
    "border-2 border-celo-white bg-transparent text-celo-white hover:border-celo-yellow hover:bg-celo-yellow hover:text-celo-black",
  ghost:
    "border-2 border-transparent bg-transparent text-celo-white hover:border-celo-white hover:bg-celo-white hover:text-celo-black",
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
        "inline-flex min-h-14 items-center justify-center gap-3 px-5 py-3 text-sm font-black uppercase transition-colors duration-200",
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
            className="size-3 animate-pulse bg-current"
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
