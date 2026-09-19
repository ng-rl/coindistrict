import { PlotData, isCoinPlot, isAdPlot } from '../types';

interface PlotDetailSheetProps {
  plot: PlotData | null;
  onClose: () => void;
}

export function PlotDetailSheet({ plot, onClose }: PlotDetailSheetProps) {
  if (!plot) return null;
  
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="fixed bottom-0 left-0 right-0 bg-cd-surface border-t-2 border-cd-mint rounded-t-3xl z-50 p-6 max-h-[70vh] overflow-y-auto">
        <div className="w-12 h-1 bg-cd-line rounded-full mx-auto mb-6" />
        
        {isCoinPlot(plot) && (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-cd-text">{plot.name}</h2>
                <p className="text-lg font-mono text-cd-mint">{plot.ticker}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  plot.rentStatus === 'PAID'
                    ? 'bg-cd-mint/20 text-cd-mint'
                    : 'bg-cd-due/20 text-cd-due'
                }`}
              >
                {plot.rentStatus}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-cd-line">
                <span className="text-cd-muted text-sm">Market Cap</span>
                <span className="text-cd-text font-mono">
                  ${(plot.marketCap / 1000000000).toFixed(2)}B
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-cd-line">
                <span className="text-cd-muted text-sm">24h Volume</span>
                <span className="text-cd-text font-mono">
                  ${(plot.volume24h / 1000000000).toFixed(2)}B
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-cd-line">
                <span className="text-cd-muted text-sm">Plot ID</span>
                <span className="text-cd-muted font-mono text-xs">{plot.id}</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-cd-bg rounded-lg">
              <p className="text-cd-muted text-sm">
                This plot is {plot.rentStatus === 'PAID' ? 'paid and active' : 'due for rent payment'}.
                {plot.rentStatus === 'DUE' && ' Pay rent to keep the lights on and avoid eviction.'}
              </p>
            </div>
          </div>
        )}
        
        {isAdPlot(plot) && (
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-cd-ad">Sponsored Plot</h2>
                <p className="text-lg font-mono text-cd-muted">{plot.advertiser}</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-cd-bg rounded-lg">
              <p className="text-cd-muted text-sm">
                This is a sponsored advertisement plot. Ad plots appear every ~7 organic plots
                and help support the district infrastructure.
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-cd-mint text-cd-bg font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Close
        </button>
      </div>
    </>
  );
}
