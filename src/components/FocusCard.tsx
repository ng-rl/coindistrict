import { PlotData, isAdPlot, isCoinPlot } from '../types';
import { StatusPill } from './StatusPill';
import { formatUsd, rankLabel } from '../utils/format';

interface FocusCardProps {
  plot: PlotData | undefined;
  index: number;
  rank: number;
  count: number;
  onOpen: () => void;
}

/** HUD readout for the plot under the thumb. */
export function FocusCard({ plot, index, rank, count, onOpen }: FocusCardProps) {
  if (!plot) return null;
  const coin = isCoinPlot(plot) ? plot : null;
  return (
    <button
      onClick={onOpen}
      className="focus-card w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border border-cd-line"
      style={{ background: 'rgba(20,20,22,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
      aria-label={coin ? `${coin.name} details` : 'Sponsored plot details'}
    >
      <div
        className="shrink-0 font-mono text-[11px] font-semibold px-2 py-1 rounded-md"
        style={{
          color: coin ? 'var(--cd-mint)' : 'var(--cd-ad)',
          background: coin ? 'var(--cd-mint-dim)' : 'var(--cd-ad-dim)',
        }}
      >
        {coin ? rankLabel(rank - 1) : 'AD'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-sm font-semibold text-cd-text truncate">{coin ? coin.name : isAdPlot(plot) ? plot.advertiser : ''}</span>
          {coin && <span className="font-mono text-xs text-cd-muted">{coin.ticker}</span>}
        </div>
        <div className="text-[11px] text-cd-muted truncate">
          {coin ? (
            <>
              mcap {formatUsd(coin.marketCap)} · vol {formatUsd(coin.volume24h)} · {index + 1} of {count}
            </>
          ) : (
            <>Paid plot · every 7 organic · height not tied to mcap</>
          )}
        </div>
      </div>
      <StatusPill status={coin ? coin.rentStatus : 'AD'} />
    </button>
  );
}
