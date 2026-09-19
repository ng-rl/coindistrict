import { useEffect, useState } from 'react';
import { DataSource, Zone } from '../types';

interface LegendBarProps {
  source: DataSource;
  updatedAt: number | null;
  zone: Zone;
}

export function LegendBar({ source, updatedAt, zone }: LegendBarProps) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => tick((n) => n + 1), 5000);
    return () => window.clearInterval(t);
  }, []);
  const age = updatedAt ? Math.max(0, Math.round((Date.now() - updatedAt) / 1000)) : null;
  return (
    <div className="shrink-0 px-4 pb-2">
      <div className="flex items-center justify-center gap-3 text-xs text-cd-muted">
        {zone === 'downtown' ? (
          <span>
            <span className="text-cd-text font-semibold">Downtown</span> · top 25 by mcap
          </span>
        ) : (
          <span>
            <span style={{ color: 'var(--cd-mint)' }} className="font-semibold">
              District
            </span>{' '}
            · leased plots
          </span>
        )}
        <span className="text-cd-line">|</span>
        <span>Ads every 7</span>
        <span className="text-cd-line">|</span>
        <span className="inline-flex items-center gap-1" title={source === 'live' ? 'CoinGecko, refreshes every 60s' : 'Sample data'}>
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: source === 'live' ? 'var(--cd-mint)' : 'var(--cd-muted)', boxShadow: source === 'live' ? '0 0 6px rgba(61,255,154,0.8)' : 'none' }}
          />
          {source === 'live' ? `Live${age !== null && age >= 5 ? ` · ${age}s` : ''}` : 'Sample data'}
        </span>
      </div>
    </div>
  );
}
