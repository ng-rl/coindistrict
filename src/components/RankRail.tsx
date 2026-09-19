import { PlotData, isCoinPlot } from '../types';

interface RankRailProps {
  plots: PlotData[];
  heights: number[]; // 0..1 per plot
  focusIndex: number;
  onJump: (index: number) => void;
}

/** Transit-map strip of the whole street. Tap a stop to jump. */
export function RankRail({ plots, heights, focusIndex, onJump }: RankRailProps) {
  return (
    <div className="rank-rail flex items-end gap-[3px] px-1 h-6" role="tablist" aria-label="Street overview">
      {plots.map((p, i) => {
        const ad = !isCoinPlot(p);
        const due = isCoinPlot(p) && p.rentStatus === 'DUE';
        const active = i === focusIndex;
        const h = 4 + Math.round((heights[i] ?? 0.3) * 14);
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={active}
            aria-label={isCoinPlot(p) ? p.name : 'Sponsored plot'}
            onClick={() => onJump(i)}
            className="rank-rail__stop flex-1 min-w-[6px] flex items-end justify-center h-6"
          >
            <span
              className="block w-full rounded-[1px]"
              style={{
                height: h,
                background: ad ? 'var(--cd-ad)' : active ? 'var(--cd-mint)' : due ? 'rgba(255,107,107,0.55)' : 'rgba(61,255,154,0.35)',
                opacity: ad ? (active ? 1 : 0.7) : 1,
                boxShadow: active ? '0 0 8px rgba(61,255,154,0.7)' : 'none',
                transform: active ? 'scaleY(1.15)' : 'none',
                transformOrigin: 'bottom',
                transition: 'background 200ms, transform 200ms',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
