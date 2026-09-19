import { PlotData, isAdPlot, isCoinPlot, isLotPlot } from '../types';
import { lowestWeekly, tierSpec } from '../data/ledger';
import { StatusPill } from './StatusPill';
import { formatUsd, rankLabel } from '../utils/format';
import { CoinLogo } from './CoinLogo';

interface FocusCardProps {
  plot: PlotData | undefined;
  index: number;
  /** downtown rank (1-based) or null for District plots */
  rank: number | null;
  count: number;
  onOpen: () => void;
}

/** HUD readout for the plot under the thumb. */
export function FocusCard({ plot, index, rank, count, onOpen }: FocusCardProps) {
  if (!plot) return null;
  if (isLotPlot(plot)) {
    return (
      <button
        onClick={onOpen}
        className="focus-card w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border"
        style={{ background: 'rgba(20,20,22,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderColor: 'rgba(61,255,154,0.45)' }}
        aria-label={`Lease plot ${plot.lotNumber}`}
      >
        <div className="shrink-0 font-mono text-[11px] font-semibold px-2 py-1 rounded-md" style={{ color: 'var(--cd-mint)', background: 'var(--cd-mint-dim)' }}>
          #{plot.lotNumber}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-cd-text">For lease · District</div>
          <div className="text-[11px] text-cd-muted truncate">Your tower on the street with BTC · from ${lowestWeekly()}/wk</div>
        </div>
        <span className="shrink-0 px-3 py-1.5 rounded-lg bg-cd-mint text-cd-bg text-xs font-semibold">Lease</span>
      </button>
    );
  }
  const coin = isCoinPlot(plot) ? plot : null;
  const lease = coin?.lease;
  return (
    <button
      onClick={onOpen}
      className="focus-card w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border border-cd-line"
      style={{ background: 'rgba(20,20,22,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      aria-label={coin ? `${coin.name} details` : 'Sponsored plot details'}
    >
      {coin && <CoinLogo src={coin.image} ticker={coin.ticker} size={30} ring="none" />}
      <div
        className="shrink-0 font-mono text-[11px] font-semibold px-2 py-1 rounded-md"
        style={{
          color: coin ? 'var(--cd-mint)' : 'var(--cd-ad)',
          background: coin ? 'var(--cd-mint-dim)' : 'var(--cd-ad-dim)',
        }}
      >
        {coin ? (lease ? tierSpec(lease.tier).name.toUpperCase() : rank ? rankLabel(rank - 1) : '—') : 'AD'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-sm font-semibold text-cd-text truncate">{coin ? coin.name : isAdPlot(plot) ? plot.advertiser : ''}</span>
          {coin && <span className="font-mono text-xs text-cd-muted">{coin.ticker}</span>}
        </div>
        <div className="text-[11px] text-cd-muted truncate">
          {coin ? (
            lease ? (
              <>
                {lease.tagline} · District · {index + 1} of {count}
              </>
            ) : (
              <>
                mcap {formatUsd(coin.marketCap)} · vol {formatUsd(coin.volume24h)} · {index + 1} of {count}
              </>
            )
          ) : (
            <>Paid plot · every 7 organic · height not tied to mcap</>
          )}
        </div>
      </div>
      <StatusPill status={coin ? coin.rentStatus : 'AD'} />
    </button>
  );
}
