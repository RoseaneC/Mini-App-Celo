import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-semibold text-celo-white">
        {label}
      </label>
      <input
        id={inputId}
        className={[
          "min-h-12 w-full rounded-2xl border border-celo-white/12 bg-celo-white/[0.06] px-4 py-3 text-base text-celo-white",
          "placeholder:text-celo-white/35",
          "focus:border-celo-yellow/50 focus:bg-celo-white/[0.08] focus:outline-none focus:ring-2 focus:ring-celo-yellow/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        ].join(" ")}
        {...props}
      />
      {hint ? <p className="text-xs leading-relaxed text-celo-white/45">{hint}</p> : null}
    </div>
  );
}
