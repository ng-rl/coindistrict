import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { PlotData, isCoinPlot } from '../types';
import { Building } from './Building';
import { AdPlot } from './AdPlot';

interface ShareCardProps {
  plots: PlotData[];
  focusPlotId?: string;
}

export function ShareCard({ plots, focusPlotId }: ShareCardProps) {
  const focusIndex = focusPlotId 
    ? plots.findIndex(p => p.id === focusPlotId)
    : 0;
    
  const startIndex = Math.max(0, focusIndex - 2);
  const visiblePlots = plots.slice(startIndex, startIndex + 5);
  
  const coinPlots = visiblePlots.filter(isCoinPlot);
  
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
      
      {/* Street viewport with real buildings */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-8">
        <div 
          className="inline-flex items-end gap-3"
          style={{
            transform: 'scale(0.85)',
          }}
        >
          {visiblePlots.map((plot, index) => (
            <div key={plot.id} style={{ width: '108px' }}>
              {isCoinPlot(plot) ? (
                <Building
                  coin={plot}
                  index={index}
                  onClick={() => {}}
                />
              ) : (
                <AdPlot
                  ad={plot}
                  onClick={() => {}}
                />
              )}
            </div>
          ))}
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
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const shareCardElement = container.querySelector('.share-card') as HTMLElement;
    if (!shareCardElement) {
      throw new Error('ShareCard element not found');
    }
    
    const canvas = await html2canvas(shareCardElement, {
      backgroundColor: '#0B0B0C',
      scale: 2,
      logging: false,
      useCORS: true,
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
