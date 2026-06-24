import { FlameIcon } from "@/components/brand/FlameIcon";

type LogoInapayProps = {
  className?: string;
  compact?: boolean;
};

export function LogoInapay({ className = "", compact = false }: LogoInapayProps) {
  return (
    <span
      className={[
        "inline-flex items-end uppercase leading-none text-celo-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Inapay"
    >
      <span className="font-black tracking-normal">IN</span>
      <span className="relative inline-flex font-black tracking-normal">
        A
        <FlameIcon className="absolute -top-[0.9em] left-1/2 h-[0.85em] w-[0.62em] -translate-x-1/2" />
      </span>
      <span className="mx-1.5 h-[0.82em] w-px self-center bg-celo-white/18" />
      <span
        className={[
          "font-semibold tracking-[0.1em] text-celo-white/50",
          compact && "tracking-[0.06em]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        PAY
      </span>
    </span>
  );
}
