import { LeaseRequest, TIERS, tierSpec } from '../data/ledger';

interface MyPlotsPanelProps {
  requests: LeaseRequest[];
  onFindLot: () => void;
}

/** Tenant view (v1: requests made from this device). Accounts come with self-serve leasing. */
export function MyPlotsPanel({ requests, onFindLot }: MyPlotsPanelProps) {
  return (
    <div className="h-full overflow-y-auto px-4 pb-6">
      <h2 className="text-xl font-bold text-cd-text">My plots</h2>
      <p className="text-sm text-cd-muted mt-1">Plots you’ve leased or requested from this device.</p>

      {requests.length === 0 ? (
        <div className="mt-5 p-4 rounded-xl border border-cd-line bg-cd-surface">
          <p className="text-cd-text font-semibold">No plots yet.</p>
          <p className="text-sm text-cd-muted mt-1">
            Downtown is the top 25 by market cap and can’t be bought. Past it, the District is leased weekly. Swipe to the end of the street and tap a FOR LEASE sign.
          </p>
          <button onClick={onFindLot} className="mt-3 px-4 py-2 rounded-lg bg-cd-mint text-cd-bg text-sm font-semibold">
            Find a lot
          </button>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {requests.map((r) => {
            const t = tierSpec(r.tier);
            return (
              <li key={r.id} className="p-3 rounded-xl border border-cd-line bg-cd-surface flex items-center gap-3">
                <div className="font-mono text-[11px] font-semibold px-2 py-1 rounded-md" style={{ color: 'var(--cd-mint)', background: 'var(--cd-mint-dim)' }}>
                  #{r.lotNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-cd-text truncate">
                    {r.project} <span className="font-mono text-xs text-cd-muted">{r.ticker}</span>
                  </div>
                  <div className="text-[11px] text-cd-muted">
                    {t.name} · ${t.weekly}/wk · requested {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ color: 'var(--cd-ad)', borderColor: 'rgba(232,195,106,0.4)' }}>
                  {r.status === 'paid' ? 'LIVE' : 'PENDING'}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <h3 className="text-sm font-semibold text-cd-text mt-6">How leasing works</h3>
      <ol className="mt-2 space-y-1.5 text-sm text-cd-muted list-decimal pl-5">
        <li>Pick a lot and a tier. {TIERS.map((t) => `${t.name} $${t.weekly}`).join(' · ')} per week.</li>
        <li>We verify the project (CoinGecko listing or verified contract + X).</li>
        <li>Rent clears, your tower goes live with your logo on the crown.</li>
        <li>Rent is weekly. Miss it and the lights dim; three days later the plot is back on the market.</li>
      </ol>
    </div>
  );
}
