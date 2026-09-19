import { useState } from 'react';

interface CoinLogoProps {
  src?: string;
  ticker: string;
  size: number;
  ring: 'paid' | 'due' | 'none';
  className?: string;
}

/** Project logo in a dark disc with a status ring. Falls back to the ticker when no image loads. */
export function CoinLogo({ src, ticker, size, ring, className = '' }: CoinLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImg = !!src && !failed;
  const ringColor = ring === 'paid' ? 'var(--cd-mint)' : ring === 'due' ? 'var(--cd-due)' : 'var(--cd-line)';
  return (
    <div
      className={`coin-logo ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: '#141416',
        boxShadow: `0 0 0 2px ${ringColor}, 0 0 0 4px #0B0B0C${ring === 'paid' ? ', 0 0 14px rgba(61,255,154,0.35)' : ''}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {showImg ? (
        <img
          src={src}
          alt={ticker}
          width={size}
          height={size}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          style={{ width: size - 6, height: size - 6, borderRadius: 999, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <span
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontWeight: 700,
            fontSize: Math.max(9, Math.round(size * 0.32)),
            color: 'var(--cd-text)',
          }}
        >
          {ticker.slice(0, 4)}
        </span>
      )}
    </div>
  );
}
