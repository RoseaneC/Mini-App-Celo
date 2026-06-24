import { FlameIcon } from "@/components/brand/FlameIcon";
import { LogoInapay } from "@/components/brand/LogoInapay";

export function BrandCardPreview() {
  return (
    <section
      className="overflow-hidden border-2 border-celo-white/20 bg-celo-black shadow-[6px_6px_0_var(--brand-copper)]"
      aria-labelledby="brand-card-preview-title"
    >
      <div className="relative aspect-[1.62] min-h-[168px] p-4">
        <div
          className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,107,0,0.16),rgba(17,17,17,0.82)_38%,rgba(212,131,10,0.12)),repeating-linear-gradient(90deg,rgba(247,244,239,0.06)_0_1px,transparent_1px_18px)]"
          aria-hidden
        />
        <div className="absolute right-0 top-0 h-full w-16 border-l border-celo-yellow/20 bg-celo-yellow/5" aria-hidden />
        <div className="absolute bottom-0 left-0 h-10 w-full border-t border-celo-white/10 bg-celo-black/20" aria-hidden />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <LogoInapay className="text-lg" compact />
            <span className="border border-celo-yellow/50 px-2 py-1 font-mono text-[8px] font-black uppercase text-celo-yellow">
              roadmap
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-7 w-9 border border-celo-yellow/50 bg-celo-black/60 shadow-[3px_3px_0_var(--brand-copper)]" />
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-celo-white/45">
              {"\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 ROADMAP"}
            </p>
            <p
              id="brand-card-preview-title"
              className="max-w-[12rem] text-2xl font-black uppercase leading-none text-celo-white"
            >
              {"Cart\u00e3o In\u00e1Pay em estudo"}
            </p>
          </div>

          <div className="flex items-end justify-between gap-4">
            <p className="font-mono text-[9px] font-bold uppercase leading-relaxed text-celo-white/60">
              Celo Mainnet
              <span className="block text-celo-yellow">sem pagamento ativo</span>
            </p>
            <FlameIcon className="h-9 w-7" title="Chama Inapay" />
          </div>
        </div>
      </div>
    </section>
  );
}
