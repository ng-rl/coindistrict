import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { PlotData, isCoinPlot } from '../types';
import { StreetScene, type StreetPlot } from '../district-building-kit';
import { useMemo } from 'react';

interface ShareCardProps {
  plots: PlotData[];
  focusPlotId?: string;
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

export function ShareCard({ plots, focusPlotId }: ShareCardProps) {
  const focusIndex = focusPlotId 
    ? plots.findIndex(p => p.id === focusPlotId)
    : 0;
    
  const startIndex = Math.max(0, focusIndex - 2);
  const visiblePlots = plots.slice(startIndex, startIndex + 5);
  
  const coinPlots = visiblePlots.filter(isCoinPlot);
  
  const { streetPlots } = useMemo(() => {
    const allCoinPlots = plots.filter(isCoinPlot);
    if (allCoinPlots.length === 0) return { 
      streetMinVolume: 1, 
      streetMaxVolume: 1000000000,
      streetPlots: [] as StreetPlot[],
    };
    
    const volumes = allCoinPlots.map(c => c.volume24h);
    const minVol = Math.min(...volumes);
    const maxVol = Math.max(...volumes);
    
    let worldX = 0;
    const streetPlots: StreetPlot[] = visiblePlots.map((plot) => {
      const isAd = !isCoinPlot(plot);
      const width = isAd ? AD_WIDTH : PLOT_WIDTH;
      
      const centerX = worldX + width / 2;
      worldX += width + PLOT_GAP;
      
      const height = isAd 
        ? 1.6 
        : computeBuildingHeight(plot.volume24h, minVol, maxVol);
      
      return {
        id: plot.id,
        height,
        status: isCoinPlot(plot) ? plot.rentStatus : 'PAID',
        isAd,
        seed: isCoinPlot(plot) ? plot.ticker : 'AD',
        ticker: undefined,
        x: (centerX - PLOT_WIDTH / 2) / 30,
      };
    });
    
    return {
      streetPlots,
    };
  }, [plots, visiblePlots]);

  return (
    <div
      className="share-card bg-cd-bg p-6 flex flex-col"
      style={{
        width: '1080px',
        height: '1350px',
      }}
    >
      {/* Brand header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="flex items-center justify-center rounded-md border-2"
          style={{
            width: '22px',
            height: '22px',
            borderColor: 'var(--cd-mint)',
            backgroundColor: 'var(--cd-mint-dim)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="6" width="3" height="6" fill="#3DFF9A" />
            <rect x="6" y="3" width="3" height="9" fill="#3DFF9A" />
            <rect x="10" y="5" width="3" height="7" fill="#3DFF9A" />
          </svg>
        </div>
        <div
          className="text-cd-text font-bold text-xl"
          style={{
            letterSpacing: '-0.02em',
            fontWeight: 650,
          }}
        >
          CoinDistrict
        </div>
      </div>
      
      {/* Street viewport with WebGL buildings */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-8">
        <div style={{ width: '100%', height: '600px' }}>
          <StreetScene plots={streetPlots} />
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-8 py-3 border-t border-cd-line">
        <div className="text-center text-cd-muted text-sm">
          Higher mcap ← → Lower
        </div>
      </div>
      
      {/* Tickers row */}
      <div className="mt-4 flex justify-center gap-2 flex-wrap">
        {coinPlots.slice(0, 5).map((plot) => (
          <span
            key={plot.id}
            className="text-xs font-mono font-semibold"
            style={{
              color: 'var(--cd-mint)',
            }}
          >
            {plot.ticker}
          </span>
        ))}
      </div>
      
      {/* Footer */}
      <div className="mt-6 text-center">
        <div className="text-cd-muted text-sm">
          Street view · CoinDistrict
        </div>
      </div>
    </div>
  );
}

export async function captureShareCard(plots: PlotData[], focusPlotId?: string): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);
  
  const root = createRoot(container);
  
  try {
    root.render(
      <ShareCard plots={plots} focusPlotId={focusPlotId} />
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const shareCardElement = container.querySelector('.share-card') as HTMLElement;
    if (!shareCardElement) {
      throw new Error('ShareCard element not found');
    }
    
    const canvas = await html2canvas(shareCardElement, {
      backgroundColor: '#0B0B0C',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });
    
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'coindistrict-street.png';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      root.unmount();
      document.body.removeChild(container);
    }, 'image/png');
  } catch (error) {
    console.error('Share capture failed:', error);
    root.unmount();
    document.body.removeChild(container);
    alert('Failed to capture street view. Please try again.');
    throw error;
  }
}
