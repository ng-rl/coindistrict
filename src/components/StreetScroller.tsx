import { useMemo, useState } from 'react';
import { PlotData, isCoinPlot } from '../types';
import { StreetScene, STREET_PX_PER_WORLD, type StreetPlot } from '../district-building-kit';

interface StreetScrollerProps {
  plots: PlotData[];
  onPlotClick: (plot: PlotData) => void;
}

const H_MIN = 1.4;
const H_MAX = 3.8;
const PLOT_WIDTH = 88;
const PLOT_GAP = 14;
const AD_WIDTH = 108;
const PADDING_LEFT = 20;

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
  const [scrollLeftPx, setScrollLeftPx] = useState(0);
  
  const { streetPlots, totalStreetWidth } = useMemo(() => {
    const coinPlots = plots.filter(isCoinPlot);
    if (coinPlots.length === 0) return { 
      streetPlots: [] as StreetPlot[],
      totalStreetWidth: 0,
    };
    
    const volumes = coinPlots.map(c => c.volume24h);
    const minVol = Math.min(...volumes);
    const maxVol = Math.max(...volumes);
    
    // Don't bake paddingLeft into x — CSS handles it
    let accumulatedX = 0;
    const streetPlots: StreetPlot[] = plots.map((plot) => {
      const isAd = !isCoinPlot(plot);
      const width = isAd ? AD_WIDTH : PLOT_WIDTH;
      
      // Center of this plot in scroll-content coordinates (CSS paddingLeft separate)
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
        x: centerX / STREET_PX_PER_WORLD,
      };
    });
    
    // Total width = all plots + gaps (CSS padding separate)
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
      {/* Pin Canvas to BOTTOM street band — never inset-0 / top:0 */}
      <div 
        className="absolute left-0 right-0 bottom-0 pointer-events-none z-0"
        style={{ height: 480 }}
      >
        <StreetScene 
          plots={streetPlots}
          scrollLeftPx={scrollLeftPx}
        />
      </div>
      
      {/* Scrollable DOM layer in same bottom band */}
      <div
        className="relative z-10 overflow-x-auto overflow-y-visible scrollbar-hide"
        onScroll={(e) => setScrollLeftPx(e.currentTarget.scrollLeft)}
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingTop: '36px',
          paddingBottom: '28px',
          height: '480px',
        }}
      >
        <div
          className="inline-flex items-end"
          style={{
            width: `${totalStreetWidth}px`,
            height: '480px',
            gap: `${PLOT_GAP}px`,
            paddingLeft: `${PADDING_LEFT}px`,
            paddingRight: `${PADDING_LEFT}px`,
          }}
        >
          {plots.map((plot) => {
            const isAd = !isCoinPlot(plot);
            const width = isAd ? AD_WIDTH : PLOT_WIDTH;
            
            return (
              <button
                key={plot.id}
                onClick={() => onPlotClick(plot)}
                className="plot-wrapper relative cursor-pointer group flex-shrink-0"
                style={{ 
                  width: `${width}px`,
                  height: '480px',
                  scrollSnapAlign: 'center',
                  scrollSnapStop: 'normal',
                }}
                aria-label={isCoinPlot(plot) ? `${plot.name} plot` : `${plot.advertiser} advertisement`}
              >
                {/* Ticker badge */}
                <div
                  className={`ticker-badge absolute left-1/2 -translate-x-1/2 flex items-center justify-center border-2 border-cd-bg rounded-full font-mono font-bold text-[11px] z-30 ${
                    isAd ? 'bg-cd-ad' : 'bg-cd-mint'
                  }`}
                  style={{
                    width: '36px',
                    height: '36px',
                    top: '-18px',
                    color: isAd ? '#1A1408' : '#0B0B0C',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  }}
                >
                  {isAd ? 'AD' : isCoinPlot(plot) ? plot.ticker.slice(0, 3) : ''}
                </div>
                
                {/* Meta - readable over WebGL */}
                <div 
                  className="absolute bottom-0 left-0 right-0 text-center space-y-1 pb-3 z-20"
                  style={{
                    background: 'linear-gradient(to top, rgba(11,11,12,0.96) 0%, rgba(11,11,12,0.88) 65%, rgba(11,11,12,0.6) 100%)',
                    paddingTop: '36px',
                  }}
                >
                  <div className={`text-xs font-bold truncate px-1 ${
                    isAd ? 'text-cd-ad' : 'text-cd-text'
                  }`}
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                  }}>
                    {isAd ? 'Sponsor' : isCoinPlot(plot) ? plot.name : ''}
                  </div>
                  <div 
                    className="text-[10px] font-medium text-cd-muted"
                    style={{
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    }}
                  >
                    {isAd ? 'Ad · Every 7' : isCoinPlot(plot) ? `$${(plot.marketCap / 1000000000).toFixed(1)}B` : ''}
                  </div>
                  <div className="flex justify-center pt-0.5">
                    <div
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                        isAd 
                          ? 'bg-cd-ad/15 text-cd-ad border border-cd-ad/40'
                          : isCoinPlot(plot) && plot.rentStatus === 'PAID'
                            ? 'bg-cd-mint/15 text-cd-mint border border-cd-mint/40'
                            : 'bg-cd-due/15 text-cd-due border border-cd-due/40'
                      }`}
                      style={{
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                      }}
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
