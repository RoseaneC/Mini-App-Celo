import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function Input({ label, hint, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="font-mono text-[11px] font-bold uppercase text-warm-gray"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={[
          "min-h-14 w-full border-0 border-b-2 border-celo-white bg-transparent px-0 py-3 text-xl font-black text-celo-white",
          "placeholder:text-warm-gray/55",
          "focus:border-celo-yellow focus:bg-celo-yellow focus:px-3 focus:text-celo-black focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        ].join(" ")}
        {...props}
      />
      {hint ? (
        <p className="font-mono text-[11px] leading-relaxed text-warm-gray">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
