import { CoinData, AdPlot, isAdPlot } from '../types';

interface BuildingProps {
  plot: CoinData | AdPlot;
  onClick: () => void;
}

export function Building({ plot, onClick }: BuildingProps) {
  if (isAdPlot(plot)) {
    return <AdBuilding ad={plot} onClick={onClick} />;
  }
  
  return <CoinBuilding coin={plot} onClick={onClick} />;
}

function CoinBuilding({ coin, onClick }: { coin: CoinData; onClick: () => void }) {
  const height = Math.max(80, Math.min(320, (coin.volume24h / 1000000000) * 15));
  const isPaid = coin.rentStatus === 'PAID';
  
  return (
    <button
      onClick={onClick}
      className="building-wrapper relative cursor-pointer"
      style={{
        width: '80px',
        perspective: '1000px',
      }}
      aria-label={`${coin.name} plot`}
    >
      <div
        className={`building-3d relative transition-all duration-300 ${
          isPaid ? 'opacity-100' : 'opacity-40'
        }`}
        style={{
          height: `${height}px`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className={`building-face-front absolute inset-0 border-2 ${
            isPaid ? 'border-cd-mint bg-cd-surface' : 'border-cd-due bg-cd-surface'
          }`}
          style={{
            transform: 'translateZ(20px)',
            borderColor: isPaid ? 'var(--cd-mint)' : 'var(--cd-due)',
          }}
        >
          {isPaid && (
            <div className="pulse-glow absolute inset-0 bg-cd-mint opacity-10 animate-pulse" />
          )}
        </div>
        
        <div
          className="building-face-left absolute inset-0 bg-cd-line opacity-60"
          style={{
            transform: 'rotateY(-90deg) translateZ(20px)',
            width: '40px',
          }}
        />
        
        <div
          className="building-face-right absolute inset-0 bg-cd-line opacity-40"
          style={{
            transform: 'rotateY(90deg) translateZ(60px)',
            width: '40px',
          }}
        />
        
        <div
          className="building-face-top absolute bg-cd-surface border border-cd-line"
          style={{
            transform: 'rotateX(90deg) translateZ(0)',
            width: '80px',
            height: '40px',
            top: '0',
          }}
        />
      </div>
      
      <div className="mt-2 text-center">
        <div className="text-xs font-mono text-cd-mint">{coin.ticker}</div>
        <div className="text-[10px] text-cd-muted">{coin.name}</div>
      </div>
    </button>
  );
}

function AdBuilding({ ad, onClick }: { ad: AdPlot; onClick: () => void }) {
  const height = 180;
  
  return (
    <button
      onClick={onClick}
      className="building-wrapper relative cursor-pointer"
      style={{
        width: '80px',
        perspective: '1000px',
      }}
      aria-label={`${ad.advertiser} advertisement`}
    >
      <div
        className="building-3d relative"
        style={{
          height: `${height}px`,
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="building-face-front absolute inset-0 border-2 bg-cd-surface"
          style={{
            transform: 'translateZ(20px)',
            borderColor: 'var(--cd-ad)',
          }}
        >
          <div className="absolute inset-0 bg-cd-ad opacity-20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-cd-ad text-2xl font-bold opacity-60">AD</div>
          </div>
        </div>
        
        <div
          className="building-face-left absolute inset-0 bg-cd-ad opacity-20"
          style={{
            transform: 'rotateY(-90deg) translateZ(20px)',
            width: '40px',
          }}
        />
        
        <div
          className="building-face-right absolute inset-0 bg-cd-ad opacity-15"
          style={{
            transform: 'rotateY(90deg) translateZ(60px)',
            width: '40px',
          }}
        />
        
        <div
          className="building-face-top absolute bg-cd-surface border"
          style={{
            transform: 'rotateX(90deg) translateZ(0)',
            width: '80px',
            height: '40px',
            top: '0',
            borderColor: 'var(--cd-ad)',
          }}
        />
      </div>
      
      <div className="mt-2 text-center">
        <div className="text-xs font-mono text-cd-ad">SPONSOR</div>
      </div>
    </button>
  );
}
