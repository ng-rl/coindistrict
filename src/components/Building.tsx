import { CoinData } from '../types';
import { StatusPill } from './StatusPill';
import { WebGLBuilding, computeBuildingHeight } from './WebGLBuilding';

interface BuildingProps {
  coin: CoinData;
  index: number;
  onClick: () => void;
  streetMinVolume: number;
  streetMaxVolume: number;
}

export function Building({ coin, index, onClick, streetMinVolume, streetMaxVolume }: BuildingProps) {
  const worldHeight = computeBuildingHeight(coin.volume24h, streetMinVolume, streetMaxVolume);
  
  return (
    <button
      onClick={onClick}
      className="plot-wrapper relative cursor-pointer group"
      style={{
        width: '88px',
      }}
      aria-label={`${coin.name} plot`}
    >
      <div className="building-container relative mx-auto">
        <WebGLBuilding
          ticker={coin.ticker}
          status={coin.rentStatus}
          height={worldHeight}
          isAd={false}
          index={index}
        />
      </div>
      
      {/* Ticker badge */}
      <div
        className="ticker-badge absolute left-1/2 -translate-x-1/2 flex items-center justify-center bg-cd-mint border-2 border-cd-bg rounded-full font-mono font-bold text-[11px] text-cd-bg z-10"
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
