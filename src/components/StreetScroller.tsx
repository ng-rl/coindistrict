import { useRef } from 'react';
import { PlotData, isCoinPlot } from '../types';
import { Building } from './Building';
import { AdPlot } from './AdPlot';

interface StreetScrollerProps {
  plots: PlotData[];
  onPlotClick: (plot: PlotData) => void;
}

export function StreetScroller({ plots, onPlotClick }: StreetScrollerProps) {
  const streetRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="flex-1 min-h-0 flex flex-col justify-end relative">
      <div
        ref={streetRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '28px',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
      >
        <div
          className="inline-flex items-end"
          style={{
            minWidth: 'max-content',
            gap: '14px',
          }}
        >
          {plots.map((plot, index) => (
            <div
              key={plot.id}
              style={{ 
                scrollSnapAlign: 'center',
                scrollSnapStop: 'normal',
              }}
            >
              {isCoinPlot(plot) ? (
                <Building
                  coin={plot}
                  index={index}
                  onClick={() => onPlotClick(plot)}
                />
              ) : (
                <AdPlot
                  ad={plot}
                  onClick={() => onPlotClick(plot)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Street ground line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cd-line" />
      
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
