import html2canvas from 'html2canvas';
import { PlotData, isCoinPlot } from '../types';

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
  const tickers = coinPlots.map(p => p.ticker).join(' · ');
  
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
      
      {/* Street viewport placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-cd-muted text-center">
          <div className="text-lg mb-2">Street View Capture</div>
          <div className="text-sm opacity-60">
            {visiblePlots.length} plots · {tickers}
          </div>
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
            className="px-2 py-1 rounded-full text-xs font-mono font-semibold"
            style={{
              backgroundColor: 'var(--cd-mint-dim)',
              color: 'var(--cd-mint)',
              border: '1px solid rgba(61,255,154,0.3)',
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

export async function captureShareCard(plots: PlotData[], focusPlotId?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);
    
    const root = document.createElement('div');
    container.appendChild(root);
    
    import('react-dom/client').then(({ createRoot }) => {
      const reactRoot = createRoot(root);
      reactRoot.render(
        <ShareCard plots={plots} focusPlotId={focusPlotId} />
      );
      
      setTimeout(() => {
        const shareCardElement = root.querySelector('.share-card') as HTMLElement;
        if (!shareCardElement) {
          document.body.removeChild(container);
          reject(new Error('ShareCard element not found'));
          return;
        }
        
        html2canvas(shareCardElement, {
          backgroundColor: '#0B0B0C',
          scale: 2,
          logging: false,
        }).then((canvas) => {
          const dataUrl = canvas.toDataURL('image/png');
          reactRoot.unmount();
          document.body.removeChild(container);
          resolve(dataUrl);
        }).catch((error) => {
          reactRoot.unmount();
          document.body.removeChild(container);
          reject(error);
        });
      }, 300);
    }).catch(reject);
  });
}
