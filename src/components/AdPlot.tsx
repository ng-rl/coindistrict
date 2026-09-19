import { AdPlot as AdPlotType } from '../types';
import { StatusPill } from './StatusPill';
import { WebGLBuilding } from './WebGLBuilding';

interface AdPlotProps {
  ad: AdPlotType;
  onClick: () => void;
}

const AD_HEIGHT = 1.6;

export function AdPlot({ ad, onClick }: AdPlotProps) {
  return (
    <button
      onClick={onClick}
      className="plot-wrapper relative cursor-pointer group"
      style={{
        width: '108px',
      }}
      aria-label={`${ad.advertiser} advertisement`}
    >
      <div className="building-container relative mx-auto">
        <WebGLBuilding
          ticker="AD"
          status="PAID"
          height={AD_HEIGHT}
          isAd={true}
          index={0}
        />
      </div>
      
      {/* Ticker badge */}
      <div
        className="ticker-badge absolute left-1/2 -translate-x-1/2 flex items-center justify-center bg-cd-ad border-2 border-cd-bg rounded-full font-mono font-bold text-[11px] z-10"
        style={{
          width: '36px',
          height: '36px',
          top: '-18px',
          color: '#1A1408',
        }}
      >
        AD
      </div>
      
      {/* Meta */}
      <div className="mt-3 text-center space-y-1">
        <div className="text-xs font-medium text-cd-ad truncate px-1">
          Sponsor
        </div>
        <div className="text-[10px] text-cd-muted">
          Ad · Every 7
        </div>
        <div className="flex justify-center">
          <StatusPill status="AD" />
        </div>
      </div>
    </button>
  );
}
