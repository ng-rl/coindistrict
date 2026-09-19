import { useRef, useMemo } from 'react';
import { PlotData, isCoinPlot } from '../types';
import { StreetScene, type StreetPlot } from '../district-building-kit';

interface StreetScrollerProps {
  plots: PlotData[];
  onPlotClick: (plot: PlotData) => void;
}

const H_MIN = 1.4;
const H_MAX = 3.8;
const PLOT_WIDTH = 88;
const PLOT_GAP = 14;
const AD_WIDTH = 108;

function computeBuildingHeight(
  volume24h: number,
  streetMinVolume: number,
  streetMaxVolume: number,
): number {
  const epsilon = 1;
  const rawLog = Math.log10(volume24h + epsilon);
  const minLog = Math.log10(streetMinVolume + epsilon);
  const maxLog = Math.log10(streetMaxVolume + epsilon);
  
  const normalized = maxLog > minLog 
    ? Math.max(0, Math.min(1, (rawLog - minLog) / (maxLog - minLog)))
    : 0.5;
  
  return H_MIN + normalized * (H_MAX - H_MIN);
}

export function StreetScroller({ plots, onPlotClick }: StreetScrollerProps) {
  const streetRef = useRef<HTMLDivElement>(null);
  
  const { streetPlots, totalStreetWidth } = useMemo(() => {
    const coinPlots = plots.filter(isCoinPlot);
    if (coinPlots.length === 0) return { 
      streetPlots: [] as StreetPlot[],
      totalStreetWidth: 0,
    };
    
    const volumes = coinPlots.map(c => c.volume24h);
    const minVol = Math.min(...volumes);
    const maxVol = Math.max(...volumes);
    
    let accumulatedX = 0;
    const streetPlots: StreetPlot[] = plots.map((plot) => {
      const isAd = !isCoinPlot(plot);
      const width = isAd ? AD_WIDTH : PLOT_WIDTH;
      
      // Center of this plot in DOM pixels
      const centerX = accumulatedX + width / 2;
      accumulatedX += width + PLOT_GAP;
      
      const height = isAd 
        ? 1.6 
        : computeBuildingHeight(plot.volume24h, minVol, maxVol);
      
      return {
        id: plot.id,
        height,
        status: isCoinPlot(plot) ? plot.rentStatus : 'PAID',
        isAd,
        seed: isCoinPlot(plot) ? plot.ticker : 'AD',
        ticker: undefined, // DOM HUD outside Canvas
        x: centerX / 30, // Scale DOM pixels to world units for StreetScene
      };
    });
    
    // Total width = all plots + gaps between them
    const totalWidth = plots.reduce((sum, plot) => {
      const isAd = !isCoinPlot(plot);
      return sum + (isAd ? AD_WIDTH : PLOT_WIDTH);
    }, 0) + (plots.length - 1) * PLOT_GAP;
    
    return {
      streetPlots,
      totalStreetWidth: totalWidth,
    };
  }, [plots]);
  
  return (
    <div className="flex-1 min-h-0 flex flex-col justify-end relative">
      {/* Scrollable container with StreetScene INSIDE */}
      <div
        ref={streetRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide relative"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '28px',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        {/* Scrollable content wrapper */}
        <div
          className="relative"
          style={{
            minWidth: 'max-content',
            height: '420px',
          }}
        >
          {/* StreetScene Canvas layer - scrolls with content */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              width: `${totalStreetWidth}px`,
              height: '420px',
            }}
          >
            <StreetScene plots={streetPlots} />
          </div>
          
          {/* DOM badges/meta overlay - scrolls with Canvas */}
          <div
            className="relative inline-flex items-end z-10"
            style={{
              gap: `${PLOT_GAP}px`,
            }}
          >
            {plots.map((plot) => {
              const isAd = !isCoinPlot(plot);
              const width = isAd ? AD_WIDTH : PLOT_WIDTH;
              
              return (
                <button
                  key={plot.id}
                  onClick={() => onPlotClick(plot)}
                  className="plot-wrapper relative cursor-pointer group"
                  style={{ 
                    width: `${width}px`,
                    scrollSnapAlign: 'center',
                    scrollSnapStop: 'normal',
                    minHeight: '420px',
                  }}
                  aria-label={isCoinPlot(plot) ? `${plot.name} plot` : `${plot.advertiser} advertisement`}
                >
                  {/* Ticker badge */}
                  <div
                    className={`ticker-badge absolute left-1/2 -translate-x-1/2 flex items-center justify-center border-2 border-cd-bg rounded-full font-mono font-bold text-[11px] z-20 ${
                      isAd ? 'bg-cd-ad' : 'bg-cd-mint'
                    }`}
                    style={{
                      width: '36px',
                      height: '36px',
                      top: '-18px',
                      color: isAd ? '#1A1408' : '#0B0B0C',
                    }}
                  >
                    {isAd ? 'AD' : isCoinPlot(plot) ? plot.ticker.slice(0, 3) : ''}
                  </div>
                  
                  {/* Meta */}
                  <div className="absolute bottom-0 left-0 right-0 text-center space-y-1 pb-3">
                    <div className={`text-xs font-medium truncate px-1 ${
                      isAd ? 'text-cd-ad' : 'text-cd-text'
                    }`}>
                      {isAd ? 'Sponsor' : isCoinPlot(plot) ? plot.name : ''}
                    </div>
                    <div className="text-[10px] text-cd-muted">
                      {isAd ? 'Ad · Every 7' : isCoinPlot(plot) ? `$${(plot.marketCap / 1000000000).toFixed(1)}B` : ''}
                    </div>
                    <div className="flex justify-center">
                      <div
                        className={`px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider ${
                          isAd 
                            ? 'bg-cd-ad/10 text-cd-ad border border-cd-ad/30'
                            : isCoinPlot(plot) && plot.rentStatus === 'PAID'
                              ? 'bg-cd-mint/10 text-cd-mint border border-cd-mint/30'
                              : 'bg-cd-due/10 text-cd-due border border-cd-due/30'
                        }`}
                      >
                        {isAd ? 'AD' : isCoinPlot(plot) ? plot.rentStatus : 'PAID'}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Street ground line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cd-line z-10" />
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
