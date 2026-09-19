import { useRef } from 'react';
import { PlotData } from '../types';
import { Building } from './Building';

interface StreetProps {
  plots: PlotData[];
  onPlotClick: (plot: PlotData) => void;
}

export function Street({ plots, onPlotClick }: StreetProps) {
  const streetRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="flex-1 overflow-hidden relative">
      <div
        ref={streetRef}
        className="h-full overflow-x-auto overflow-y-hidden pb-4"
        style={{
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className="inline-flex items-end h-full px-4 gap-8"
          style={{
            minWidth: 'max-content',
          }}
        >
          {plots.map((plot) => (
            <div
              key={plot.id}
              style={{ scrollSnapAlign: 'center' }}
            >
              <Building
                plot={plot}
                onClick={() => onPlotClick(plot)}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-cd-line" />
    </div>
  );
}
