import { PlotData, isCoinPlot, isAdPlot, isLotPlot } from '../types';
import { LeaseRequest, tierSpec } from '../data/ledger';
import { LeaseSheet } from './LeaseSheet';
import { StatusPill } from './StatusPill';
import { formatUsd } from '../utils/format';
import { CoinLogo } from './CoinLogo';
import { PriceChart } from './PriceChart';

interface PlotSheetProps {
  plot: PlotData | null;
  onClose: () => void;
  onLeaseRequested?: (req: LeaseRequest) => void;
}

export function PlotSheet({ plot, onClose, onLeaseRequested }: PlotSheetProps) {
  if (!plot) return null;
  
  return (
    <>
      <div
        className="fixed inset-0 z-40 backdrop"
        style={{
          backgroundColor: 'rgba(0,0,0,0.45)',
          animation: 'backdropFadeIn 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div
        className="plot-sheet fixed bottom-0 left-0 right-0 bg-cd-surface z-50 px-6 pt-6 pb-0 overflow-y-auto"
        style={{
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          animation: 'sheetSlideUp 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="w-12 h-1 bg-cd-line rounded-full mx-auto mb-6" />

        {isLotPlot(plot) && <LeaseSheet lot={plot} onClose={onClose} onRequested={(r) => onLeaseRequested?.(r)} />}

        {isCoinPlot(plot) && (
          <div>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <CoinLogo src={plot.image} ticker={plot.ticker} size={44} ring={plot.rentStatus === 'PAID' ? 'paid' : 'due'} />
                <div>
                  <h2 className="text-2xl font-bold text-cd-text leading-tight">{plot.name}</h2>
                  <p className="text-base font-mono text-cd-muted">{plot.ticker}</p>
                </div>
              </div>
              <StatusPill status={plot.rentStatus} />
            </div>

            {plot.lease && (
              <div className="mb-5 p-4 bg-cd-bg rounded-lg border border-cd-line">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: 'var(--cd-mint)' }}>
                    Leased plot · {tierSpec(plot.lease.tier).name}
                  </span>
                  <span className="text-[11px] text-cd-muted">since {new Date(plot.lease.since).toLocaleDateString()}</span>
                </div>
                <p className="text-cd-text text-base mt-2">{plot.lease.tagline}</p>
                <div className="flex gap-2 mt-3">
                  {plot.lease.website && (
                    <a href={plot.lease.website} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg bg-cd-mint text-cd-bg text-sm font-semibold">
                      Visit
                    </a>
                  )}
                  {plot.lease.x && (
                    <a href={`https://x.com/${plot.lease.x}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg border border-cd-line text-cd-text text-sm">
                      @{plot.lease.x}
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-cd-muted mt-3">
                  Rent paid through {new Date(plot.lease.rentPaidThrough).toLocaleDateString()}. Height reflects on-chain volume only.
                </p>
              </div>
            )}

            {(plot.volume24h > 0 || plot.sparkline7d) && (
              <div className="mb-5 p-3 bg-cd-bg rounded-lg border border-cd-line">
                <PriceChart coin={plot} />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {plot.marketCap > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-cd-muted uppercase tracking-wide">Market Cap</div>
                  <div className="text-lg font-mono text-cd-text">{formatUsd(plot.marketCap, 2)}</div>
                </div>
              )}
              {plot.volume24h > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-cd-muted uppercase tracking-wide">24h Volume</div>
                  <div className="text-lg font-mono text-cd-text">{formatUsd(plot.volume24h, 2)}</div>
                </div>
              )}
              <div className="space-y-1">
                <div className="text-xs text-cd-muted uppercase tracking-wide">Weekly Rent</div>
                <div className="text-lg font-mono text-cd-text">
                  {plot.lease ? `$${tierSpec(plot.lease.tier).weekly}` : 'Earned'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-cd-muted uppercase tracking-wide">Status</div>
                <div className="text-lg font-mono text-cd-text">{plot.rentStatus}</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-cd-bg rounded-lg border border-cd-line">
              <p className="text-cd-muted text-sm leading-relaxed">
                {plot.lease
                  ? plot.rentStatus === 'PAID'
                    ? 'Rent paid. This District plot is lit and current.'
                    : 'Rent due. The lights are dimming; the plot returns to the market after the grace period.'
                  : 'Downtown plot. Earned by market cap, never for sale.'}
              </p>
            </div>
          </div>
        )}
        
        {isAdPlot(plot) && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-cd-ad">Sponsored Plot</h2>
                <p className="text-lg font-mono text-cd-muted mt-1">{plot.advertiser}</p>
              </div>
              <StatusPill status="AD" />
            </div>
            
            <div className="mt-6 p-4 bg-cd-bg rounded-lg border border-cd-line">
              <p className="text-cd-muted text-sm leading-relaxed">
                Paid ad plot · inserted every 7 organic plots · height not tied to mcap.
                Ad plots help support district infrastructure.
              </p>
            </div>
          </div>
        )}
        
        {!isLotPlot(plot) && (
        <div className="sticky bottom-0 -mx-6 px-6 pt-4 bg-cd-surface" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <button
          onClick={onClose}
          className="w-full py-3 bg-cd-mint text-cd-bg font-semibold rounded-lg transition-opacity hover:opacity-90"
          style={{
            transition: 'opacity 150ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          Close
        </button>
        </div>
        )}
      </div>
      
      <style>{`
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes sheetSlideUp {
          from { transform: translateY(110%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
