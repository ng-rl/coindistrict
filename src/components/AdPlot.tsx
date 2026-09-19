import { AdPlot as AdPlotType } from '../types';
import { StatusPill } from './StatusPill';

interface AdPlotProps {
  ad: AdPlotType;
  onClick: () => void;
}

export function AdPlot({ ad, onClick }: AdPlotProps) {
  const height = 160;
  
  return (
    <button
      onClick={onClick}
      className="plot-wrapper relative cursor-pointer group"
      style={{
        width: '108px',
      }}
      aria-label={`${ad.advertiser} advertisement`}
    >
      <div
        className="building-container relative mx-auto"
        style={{
          width: '88px',
          perspective: '1200px',
        }}
      >
        <div
          className="building-3d relative transition-transform duration-75 ease-out group-active:scale-[0.98]"
          style={{
            height: `${height}px`,
            transformStyle: 'preserve-3d',
            transform: 'rotateY(-15deg)',
          }}
        >
          {/* Front face */}
          <div
            className="building-face-front absolute inset-0 overflow-hidden"
            style={{
              transform: 'translateZ(22px)',
              background: 'linear-gradient(180deg, rgba(232,195,106,0.08) 0%, rgba(232,195,106,0.04) 100%)',
              border: '1px solid rgba(232,195,106,0.35)',
              borderRadius: '2px',
            }}
          >
            {/* AD Badge */}
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
              style={{
                backgroundColor: '#E8C36A',
                color: '#1A1408',
                letterSpacing: '0.08em',
              }}
            >
              AD
            </div>
            
            {/* Ad Copy */}
            <div className="absolute bottom-4 left-2 right-2 text-center">
              <div className="text-xs font-semibold text-cd-ad mb-1">
                {ad.advertiser}
              </div>
              <div className="text-[9px] text-cd-ad/70 leading-tight">
                Sponsored plot
              </div>
            </div>
            
            {/* Gold pattern overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(232,195,106,0.1) 10px, rgba(232,195,106,0.1) 20px)
                `,
              }}
            />
          </div>
          
          {/* Left face */}
          <div
            className="building-face-left absolute inset-0"
            style={{
              transform: 'rotateY(-90deg) translateZ(22px)',
              width: '44px',
              background: 'rgba(232,195,106,0.12)',
              border: '1px solid rgba(232,195,106,0.3)',
            }}
          />
          
          {/* Right face */}
          <div
            className="building-face-right absolute inset-0"
            style={{
              transform: 'rotateY(90deg) translateZ(66px)',
              width: '44px',
              background: 'rgba(232,195,106,0.08)',
              border: '1px solid rgba(232,195,106,0.25)',
            }}
          />
          
          {/* Top face */}
          <div
            className="building-face-top absolute"
            style={{
              transform: 'rotateX(90deg) translateZ(0)',
              width: '88px',
              height: '44px',
              top: '0',
              background: 'rgba(232,195,106,0.15)',
              border: '1px solid rgba(232,195,106,0.3)',
            }}
          />
        </div>
      </div>
      
      {/* Ticker badge */}
      <div
        className="ticker-badge absolute left-1/2 -translate-x-1/2 flex items-center justify-center bg-cd-ad border-2 border-cd-bg rounded-full font-mono font-bold text-[11px]"
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
