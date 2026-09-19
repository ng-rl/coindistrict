import { useRef, useMemo, useEffect, useState } from 'react';
import { PlotData, isCoinPlot } from '../types';
import { StreetScene, STREET_PX_PER_WORLD, type StreetPlot } from '../district-building-kit';

interface StreetScrollerProps {
  plots: PlotData[];
  onPlotClick: (plot: PlotData) => void;
}

const H_MIN = 2.0;
const H_MAX = 5.5;
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
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const { streetPlots } = useMemo(() => {
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
        ? 1.8 
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
    
    // Total width = all plots + gaps between them
    const totalWidth = plots.reduce((sum, plot) => {
      const isAd = !isCoinPlot(plot);
      return sum + (isAd ? AD_WIDTH : PLOT_WIDTH);
    }, 0) + (plots.length - 1) * PLOT_GAP;
    
    return {
      streetPlots,
    };
  }, [plots]);
  
  // Sync scroll position for camera offset
  useEffect(() => {
    const handleScroll = () => {
      if (streetRef.current) {
        setScrollLeft(streetRef.current.scrollLeft);
      }
    };
    
    const scrollEl = streetRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollEl.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Calculate visible mid-point for camera positioning
  const scrollOffsetWorld = scrollLeft / STREET_PX_PER_WORLD;
  
  return (
    <div className="flex-1 min-h-0 flex flex-col justify-end relative">
      {/* Viewport-sized FIXED StreetScene Canvas */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '520px',
          zIndex: 0,
        }}
      >
        <StreetScene 
          plots={streetPlots}
          camera={{
            position: [scrollOffsetWorld + 0.6, 1.55, 6.5],
            lookAt: [scrollOffsetWorld, 1.45, 0],
          }}
        />
      </div>
      
      {/* Scrollable DOM badges/meta */}
      <div
        ref={streetRef}
        className="overflow-x-auto overflow-y-visible scrollbar-hide relative"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '20px',
          paddingTop: '48px',
          paddingLeft: '20px',
          paddingRight: '20px',
          zIndex: 10,
        }}
      >
        <div
          className="inline-flex items-end"
          style={{
            minWidth: 'max-content',
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
                  minHeight: '480px',
                }}
                aria-label={isCoinPlot(plot) ? `${plot.name} plot` : `${plot.advertiser} advertisement`}
              >
                {/* Ticker badge - more padding to prevent clip */}
                <div
                  className={`ticker-badge absolute left-1/2 -translate-x-1/2 flex items-center justify-center border-2 border-cd-bg rounded-full font-mono font-bold text-[11px] z-30 ${
                    isAd ? 'bg-cd-ad' : 'bg-cd-mint'
                  }`}
                  style={{
                    width: '36px',
                    height: '36px',
                    top: '-24px',
                    color: isAd ? '#1A1408' : '#0B0B0C',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  }}
                >
                  {isAd ? 'AD' : isCoinPlot(plot) ? plot.ticker.slice(0, 3) : ''}
                </div>
                
                {/* Meta BELOW towers - high z-index, strong contrast */}
                <div 
                  className="absolute bottom-0 left-0 right-0 text-center space-y-1 pb-2 z-20"
                  style={{
                    background: 'linear-gradient(to top, rgba(11,11,12,0.98) 0%, rgba(11,11,12,0.92) 70%, rgba(11,11,12,0.7) 100%)',
                    paddingTop: '40px',
                    borderRadius: '0 0 4px 4px',
                  }}
                >
                  <div className={`text-xs font-bold truncate px-1 ${
                    isAd ? 'text-cd-ad' : 'text-cd-text'
                  }`}
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                    letterSpacing: '-0.01em',
                  }}>
                    {isAd ? 'Sponsor' : isCoinPlot(plot) ? plot.name : ''}
                  </div>
                  <div 
                    className="text-[11px] font-medium text-cd-muted"
                    style={{
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    }}
                  >
                    {isAd ? 'Ad · Every 7' : isCoinPlot(plot) ? `$${(plot.marketCap / 1000000000).toFixed(1)}B` : ''}
                  </div>
                  <div className="flex justify-center pt-1">
                    <div
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                        isAd 
                          ? 'bg-cd-ad/20 text-cd-ad border border-cd-ad/50'
                          : isCoinPlot(plot) && plot.rentStatus === 'PAID'
                            ? 'bg-cd-mint/20 text-cd-mint border border-cd-mint/50'
                            : 'bg-cd-due/20 text-cd-due border border-cd-due/50'
                      }`}
                      style={{
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        letterSpacing: '0.05em',
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
