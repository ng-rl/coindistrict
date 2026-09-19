import { useEffect, useMemo, useRef, useState } from 'react';
import { CoinData } from '../types';
import { fetchPriceChart, PricePoint } from '../data/market';

type Range = '24H' | '7D';

interface PriceChartProps {
  coin: CoinData;
}

const W = 320;
const H = 120;
const PAD = { top: 10, right: 8, bottom: 18, left: 8 };

function fmtPrice(v: number) {
  if (v >= 1000) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (v >= 1) return `$${v.toFixed(2)}`;
  return `$${v.toPrecision(3)}`;
}

function fmtTime(t: number, range: Range) {
  const d = new Date(t);
  return range === '24H'
    ? d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric' });
}

/** Single-series price line. 7D comes from the market sparkline (hourly); 24H is fetched on open (5-min). */
export function PriceChart({ coin }: PriceChartProps) {
  const [range, setRange] = useState<Range>('24H');
  const [day, setDay] = useState<PricePoint[] | null>(null);
  const [dayError, setDayError] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let alive = true;
    setDay(null);
    setDayError(false);
    fetchPriceChart(coin.id, 1)
      .then((p) => alive && setDay(p))
      .catch(() => alive && setDayError(true));
    return () => {
      alive = false;
    };
  }, [coin.id]);

  const week = useMemo<PricePoint[] | null>(() => {
    const s = coin.sparkline7d;
    if (!s || s.length < 2) return null;
    const now = Date.now();
    const step = (7 * 24 * 3600 * 1000) / s.length;
    return s.map((v, i) => [now - (s.length - 1 - i) * step, v]);
  }, [coin.sparkline7d]);

  const points = range === '24H' ? day : week;
  const loading = range === '24H' && !day && !dayError;

  const geom = useMemo(() => {
    if (!points || points.length < 2) return null;
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const x0 = xs[0];
    const x1 = xs[xs.length - 1];
    let lo = Math.min(...ys);
    let hi = Math.max(...ys);
    if (hi - lo < 1e-9) {
      hi += 1;
      lo -= 1;
    }
    const iw = W - PAD.left - PAD.right;
    const ih = H - PAD.top - PAD.bottom;
    const sx = (t: number) => PAD.left + ((t - x0) / (x1 - x0)) * iw;
    const sy = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * ih;
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ');
    const area = `${d} L${sx(x1).toFixed(1)},${(H - PAD.bottom).toFixed(1)} L${sx(x0).toFixed(1)},${(H - PAD.bottom).toFixed(1)} Z`;
    const first = ys[0];
    const last = ys[ys.length - 1];
    return { d, area, sx, sy, lo, hi, first, last, up: last >= first, iLo: ys.indexOf(lo), iHi: ys.indexOf(hi) };
  }, [points]);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!points || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const t = (x - PAD.left) / (W - PAD.left - PAD.right);
    const i = Math.round(Math.max(0, Math.min(1, t)) * (points.length - 1));
    setHover(i);
  };

  const change = geom ? ((geom.last - geom.first) / geom.first) * 100 : coin.change24h;
  const changeColor = change === undefined ? 'var(--cd-muted)' : change >= 0 ? 'var(--cd-mint)' : 'var(--cd-due)';
  const hp = hover !== null && points ? points[hover] : null;

  return (
    <div className="price-chart">
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className="text-xl font-mono text-cd-text">{hp ? fmtPrice(hp[1]) : coin.priceUsd !== undefined ? fmtPrice(coin.priceUsd) : '—'}</span>
          {change !== undefined && (
            <span className="ml-2 text-sm font-mono" style={{ color: changeColor }}>
              {change >= 0 ? '+' : ''}
              {change.toFixed(2)}%
            </span>
          )}
          {hp && <span className="ml-2 text-xs text-cd-muted">{fmtTime(hp[0], range)}</span>}
        </div>
        <div className="flex gap-1" role="tablist" aria-label="Chart range">
          {(['24H', '7D'] as Range[]).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={range === r}
              onClick={() => {
                setRange(r);
                setHover(null);
              }}
              className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
              style={{
                color: range === r ? 'var(--cd-bg)' : 'var(--cd-muted)',
                background: range === r ? 'var(--cd-mint)' : 'transparent',
                border: '1px solid var(--cd-line)',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full block"
        style={{ height: 'auto', touchAction: 'pan-y', cursor: geom ? 'crosshair' : 'default' }}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${coin.name} price, ${range}`}
      >
        <defs>
          <linearGradient id="cd-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3DFF9A" stopOpacity="0.28" />
            <stop offset="1" stopColor="#3DFF9A" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD.left} x2={W - PAD.right} y1={PAD.top + f * (H - PAD.top - PAD.bottom)} y2={PAD.top + f * (H - PAD.top - PAD.bottom)} stroke="#222226" strokeWidth="1" />
        ))}
        {geom && (
          <>
            <path d={geom.area} fill="url(#cd-area)" />
            <path d={geom.d} fill="none" stroke="#3DFF9A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <text x={PAD.left} y={H - 5} fontSize="9" fill="#8B8B93">
              lo {fmtPrice(geom.lo)}
            </text>
            <text x={W - PAD.right} y={H - 5} fontSize="9" fill="#8B8B93" textAnchor="end">
              hi {fmtPrice(geom.hi)}
            </text>
            {hp && (
              <>
                <line x1={geom.sx(hp[0])} x2={geom.sx(hp[0])} y1={PAD.top} y2={H - PAD.bottom} stroke="#8B8B93" strokeWidth="1" strokeDasharray="2 3" />
                <circle cx={geom.sx(hp[0])} cy={geom.sy(hp[1])} r="4" fill="#3DFF9A" stroke="#0B0B0C" strokeWidth="2" />
              </>
            )}
          </>
        )}
        {!geom && (
          <text x={W / 2} y={H / 2} fontSize="11" fill="#8B8B93" textAnchor="middle">
            {loading ? 'Loading live chart…' : range === '24H' && dayError ? 'Live 24h chart unavailable · try 7D' : 'No price history'}
          </text>
        )}
      </svg>
    </div>
  );
}
