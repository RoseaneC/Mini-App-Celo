type HeaderProps = {
  isConnected: boolean;
  address: string | null;
  isDemo: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
  connectDisabled?: boolean;
};

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function Header({
  isConnected,
  address,
  isDemo,
  onConnect,
  onDisconnect,
  isConnecting,
  connectDisabled = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-celo-white/10 bg-celo-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-celo-yellow to-celo-green font-black text-celo-black shadow-lg shadow-celo-yellow/20"
            aria-hidden
          >
            C
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold leading-tight tracking-tight text-celo-white">
              Celo Pay Demo
            </p>
            <p className="text-[11px] text-celo-white/45">Rede de teste</p>
          </div>
        </div>

        {isConnected && address ? (
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs font-semibold text-celo-green">
                {shortenAddress(address)}
              </span>
              {isDemo ? (
                <span className="text-[10px] text-celo-yellow">modo demo</span>
              ) : (
                <span className="text-[10px] text-celo-white/50">conectada</span>
              )}
            </div>
            <button
              type="button"
              onClick={onDisconnect}
              className="rounded-xl border border-celo-white/15 bg-celo-white/5 px-3 py-2 text-xs font-semibold text-celo-white transition hover:border-celo-yellow/50 hover:bg-celo-yellow/10 hover:text-celo-yellow"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={isConnecting || connectDisabled}
            className="shrink-0 rounded-xl bg-celo-yellow px-4 py-2.5 text-xs font-bold text-celo-black shadow-md shadow-celo-yellow/25 transition hover:brightness-105 disabled:opacity-50"
          >
            {isConnecting ? "…" : "Conectar"}
          </button>
        )}
      </div>
    </header>
  );
}
