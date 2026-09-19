import { CoinData } from '../types';
import { StatusPill } from './StatusPill';

interface BuildingProps {
  coin: CoinData;
  index: number;
  onClick: () => void;
}

export function Building({ coin, index, onClick }: BuildingProps) {
  const height = Math.max(72, Math.min(280, (coin.volume24h / 1000000000) * 15));
  const isPaid = coin.rentStatus === 'PAID';
  
  const animationDelay = `${index * 120}ms`;
  
  return (
    <button
      onClick={onClick}
      className="plot-wrapper relative cursor-pointer group"
      style={{
        width: '108px',
      }}
      aria-label={`${coin.name} plot`}
    >
      <div
        className="building-container relative mx-auto"
        style={{
          width: '88px',
          perspective: '1200px',
        }}
      >
        <div
          className={`building-3d relative transition-transform duration-75 ease-out group-active:scale-[0.98] ${
            !isPaid ? 'building-due' : ''
          }`}
          style={{
            height: `${height}px`,
            transformStyle: 'preserve-3d',
            transform: 'rotateY(8deg)',
            filter: !isPaid ? 'brightness(0.55) saturate(0.7)' : 'none',
          }}
        >
          {/* Front face */}
          <div
            className="building-face-front absolute inset-0 overflow-hidden"
            style={{
              transform: 'translateZ(22px)',
              background: 'linear-gradient(180deg, #2A2A30 0%, #151518 100%)',
              border: '1px solid #333339',
              borderRadius: '2px',
            }}
          >
            {/* Window grid */}
            <div
              className={`window-grid absolute inset-0 ${isPaid ? 'window-pulse' : ''}`}
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(61,255,154,0.12) 18px, rgba(61,255,154,0.12) 19px),
                  repeating-linear-gradient(90deg, transparent, transparent 16px, rgba(61,255,154,0.12) 16px, rgba(61,255,154,0.12) 17px)
                `,
                opacity: isPaid ? 0.6 : 0.25,
                ...(isPaid && {
                  animation: 'windowPulse 2.4s ease-in-out infinite',
                  animationDelay,
                }),
              }}
            />
            
            {/* Rent pulse glow */}
            {isPaid && (
              <div
                className="pulse-glow absolute inset-0 border border-cd-mint pointer-events-none"
                style={{
                  animation: 'rentPulse 2.4s ease-in-out infinite',
                  animationDelay,
                  borderRadius: '2px',
                }}
              />
            )}
            
            {/* DUE rim (subtle) */}
            {!isPaid && (
              <div
                className="absolute inset-0 border border-cd-due pointer-events-none"
                style={{
                  opacity: 0.35,
                  borderRadius: '2px',
                }}
              />
            )}
          </div>
          
          {/* Left face */}
          <div
            className="building-face-left absolute inset-0"
            style={{
              transform: 'rotateY(-90deg) translateZ(22px)',
              width: '44px',
              background: 'linear-gradient(180deg, #1F1F24 0%, #0F0F11 100%)',
              border: '1px solid #28282E',
            }}
          />
          
          {/* Right face */}
          <div
            className="building-face-right absolute inset-0"
            style={{
              transform: 'rotateY(90deg) translateZ(66px)',
              width: '44px',
              background: 'linear-gradient(180deg, #1A1A1E 0%, #0A0A0C 100%)',
              border: '1px solid #202024',
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
              background: '#2A2A30',
              border: '1px solid #333339',
            }}
          />
        </div>
      </div>
      
      {/* Ticker badge */}
      <div
        className="ticker-badge absolute left-1/2 -translate-x-1/2 flex items-center justify-center bg-cd-mint border-2 border-cd-bg rounded-full font-mono font-bold text-[11px] text-cd-bg"
        style={{
          width: '36px',
          height: '36px',
          top: '-18px',
        }}
      >
        {coin.ticker.slice(0, 3)}
      </div>
      
      {/* Meta */}
      <div className="mt-3 text-center space-y-1">
        <div className="text-xs font-medium text-cd-text truncate px-1">
          {coin.name}
        </div>
        <div className="text-[10px] text-cd-muted">
          ${(coin.marketCap / 1000000000).toFixed(1)}B
        </div>
        <div className="flex justify-center">
          <StatusPill status={coin.rentStatus} />
        </div>
      </div>
    </button>
  );
}
