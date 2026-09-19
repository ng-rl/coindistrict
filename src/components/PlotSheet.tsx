import { PlotData, isCoinPlot, isAdPlot } from '../types';
import { StatusPill } from './StatusPill';
import { formatUsd } from '../utils/format';

interface PlotSheetProps {
  plot: PlotData | null;
  onClose: () => void;
}

export function PlotSheet({ plot, onClose }: PlotSheetProps) {
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
        className="fixed bottom-0 left-0 right-0 bg-cd-surface z-50 p-6 max-h-[70vh] overflow-y-auto"
        style={{
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          animation: 'sheetSlideUp 250ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="w-12 h-1 bg-cd-line rounded-full mx-auto mb-6" />
        
        {isCoinPlot(plot) && (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-cd-text">{plot.name}</h2>
                <p className="text-lg font-mono text-cd-muted mt-1">{plot.ticker}</p>
              </div>
              <StatusPill status={plot.rentStatus} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs text-cd-muted uppercase tracking-wide">Market Cap</div>
                <div className="text-lg font-mono text-cd-text">
                  {formatUsd(plot.marketCap, 2)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-cd-muted uppercase tracking-wide">24h Volume</div>
                <div className="text-lg font-mono text-cd-text">
                  {formatUsd(plot.volume24h, 2)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-cd-muted uppercase tracking-wide">Weekly Rent</div>
                <div className="text-lg font-mono text-cd-text">
                  {formatUsd(plot.volume24h * 0.0005, 1)}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-cd-muted uppercase tracking-wide">Status</div>
                <div className="text-lg font-mono text-cd-text">
                  {plot.rentStatus}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-cd-bg rounded-lg border border-cd-line">
              <p className="text-cd-muted text-sm leading-relaxed">
                {plot.rentStatus === 'PAID' 
                  ? 'Rent paid. This plot is active with lights on and weekly rent current.'
                  : 'Rent due. Pay weekly rent to keep the lights on and avoid eviction risk.'}
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
        
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-cd-mint text-cd-bg font-semibold rounded-lg transition-opacity hover:opacity-90"
          style={{
            transition: 'opacity 150ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          Close
        </button>
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
