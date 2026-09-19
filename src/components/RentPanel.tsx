import { PlotData, isCoinPlot, isLeasedPlot } from '../types';
import { AD_PLOT_WEEKLY, GRACE_DAYS, TIERS } from '../data/ledger';

interface RentPanelProps {
  plots: PlotData[];
  onJump: (index: number) => void;
}

/** The rent economy at a glance: who's paid, who's due, and what a plot costs. */
export function RentPanel({ plots, onJump }: RentPanelProps) {
  const tenants = plots.map((p, i) => ({ p, i })).filter(({ p }) => isLeasedPlot(p));
  const due = tenants.filter(({ p }) => isCoinPlot(p) && p.rentStatus === 'DUE');
  const paid = tenants.length - due.length;
  return (
    <div className="h-full overflow-y-auto px-4 pb-6">
      <h2 className="text-xl font-bold text-cd-text">Rent</h2>
      <p className="text-sm text-cd-muted mt-1">Weekly rent keeps a District tower lit. Downtown never pays: it’s earned.</p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="p-3 rounded-xl border border-cd-line bg-cd-surface">
          <div className="text-[11px] text-cd-muted uppercase tracking-wide">Paid</div>
          <div className="text-2xl font-mono" style={{ color: 'var(--cd-mint)' }}>{paid}</div>
        </div>
        <div className="p-3 rounded-xl border border-cd-line bg-cd-surface">
          <div className="text-[11px] text-cd-muted uppercase tracking-wide">Due</div>
          <div className="text-2xl font-mono" style={{ color: due.length ? 'var(--cd-due)' : 'var(--cd-text)' }}>{due.length}</div>
        </div>
      </div>

      {due.length > 0 && (
        <ul className="mt-3 space-y-2">
          {due.map(({ p, i }) =>
            isCoinPlot(p) ? (
              <li key={p.id}>
                <button onClick={() => onJump(i)} className="w-full text-left p-3 rounded-xl border bg-cd-surface flex items-center justify-between" style={{ borderColor: 'rgba(255,107,107,0.4)' }}>
                  <span className="text-sm text-cd-text">
                    {p.name} <span className="font-mono text-xs text-cd-muted">{p.ticker}</span>
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--cd-due)' }}>
                    lights dimming · eviction in {GRACE_DAYS} days
                  </span>
                </button>
              </li>
            ) : null
          )}
        </ul>
      )}

      <h3 className="text-sm font-semibold text-cd-text mt-6">Rent card</h3>
      <table className="w-full mt-2 text-sm">
        <tbody>
          {TIERS.map((t) => (
            <tr key={t.tier} className="border-t border-cd-line">
              <td className="py-2 text-cd-text">{t.name}</td>
              <td className="py-2 text-cd-muted text-xs">{t.blurb}</td>
              <td className="py-2 font-mono text-right text-cd-text">${t.weekly}/wk</td>
            </tr>
          ))}
          <tr className="border-t border-cd-line">
            <td className="py-2" style={{ color: 'var(--cd-ad)' }}>Ad plot</td>
            <td className="py-2 text-cd-muted text-xs">Every 7th plot, gold, 4-week minimum</td>
            <td className="py-2 font-mono text-right text-cd-text">${AD_PLOT_WEEKLY.toLocaleString()}/wk</td>
          </tr>
        </tbody>
      </table>
      <p className="text-[11px] text-cd-muted mt-3">
        Rent never changes a tower’s height or downtown order. Height is 24h volume. Storefronts, crowns and share-card branding are what rent buys.
      </p>
    </div>
  );
}
