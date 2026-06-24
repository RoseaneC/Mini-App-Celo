import { LogoInapay } from "@/components/brand/LogoInapay";

type HeaderProps = {
  isConnected: boolean;
  address: string | null;
  isDemo: boolean;
  accountLabel?: string;
  accountDetail?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
  connectDisabled?: boolean;
};

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Header({
  isConnected,
  address,
  isDemo,
  accountLabel,
  accountDetail,
  onConnect,
  onDisconnect,
  isConnecting,
  connectDisabled = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-celo-white bg-celo-black/95 backdrop-blur">
      <div className="mx-auto grid max-w-[480px] grid-cols-[1fr_auto] items-stretch px-4">
        <div className="flex min-w-0 items-center gap-3 border-r-2 border-celo-white py-3 pr-3">
          <span className="font-mono text-[10px] font-bold uppercase text-celo-yellow">
            Celo Mainnet
          </span>
          <div className="h-5 w-px bg-celo-white/35" aria-hidden />
          <LogoInapay className="truncate text-lg" compact />
        </div>

        {isConnected && address ? (
          <div className="flex shrink-0 items-center gap-3 py-2 pl-3">
            <div className="flex flex-col items-end">
              <span className="font-mono text-[11px] font-bold text-celo-green">
                {isDemo
                  ? "Modo demo"
                  : accountLabel
                    ? accountLabel
                    : shortenAddress(address)}
              </span>
              <span className="font-mono text-[9px] uppercase text-warm-gray">
                {isDemo ? "sem wallet real" : accountDetail ?? "online"}
              </span>
            </div>
            <button
              type="button"
              onClick={onDisconnect}
              className="border-2 border-celo-white bg-celo-black px-3 py-2 text-xs font-black uppercase text-celo-white transition-colors hover:border-brand-fire hover:bg-brand-fire hover:text-celo-black"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={isConnecting || connectDisabled}
            className="my-2 ml-3 shrink-0 border-2 border-celo-yellow bg-celo-yellow px-4 py-2 text-xs font-black uppercase text-celo-black shadow-[4px_4px_0_var(--brand-copper)] transition-colors hover:border-brand-fire hover:bg-brand-fire hover:text-celo-black disabled:opacity-50"
          >
            {isConnecting ? "..." : "Conectar"}
          </button>
        )}
      </div>
    </header>
  );
}
