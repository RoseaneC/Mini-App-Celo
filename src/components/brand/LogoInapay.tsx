import { FlameIcon } from "@/components/brand/FlameIcon";

type LogoInapayProps = {
  className?: string;
  compact?: boolean;
};

export function LogoInapay({ className = "", compact = false }: LogoInapayProps) {
  const flameClassName = compact
    ? "mb-[0.04em] h-[0.42em] w-[0.32em] shrink-0"
    : "mb-[0.05em] h-[0.48em] w-[0.36em] shrink-0";

  return (
    <span
      className={[
        "inline-flex items-end overflow-hidden uppercase leading-none text-celo-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Inapay"
    >
      <span className="font-black tracking-normal">IN</span>
      <span className="inline-flex flex-col items-center justify-end font-black tracking-normal leading-none">
        <FlameIcon className={flameClassName} />
        <span>A</span>
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
