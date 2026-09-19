import { PlotData, isAdPlot, isCoinPlot, isLotPlot } from '../types';
import { formatUsd } from '../utils/format';

/**
 * ShareCard: composes the live WebGL frame into a 1080×1350 card.
 * Top: BrandMark + wordmark. Middle: the street as it is on screen. Legend strip. Bottom: focus plot.
 */
export async function captureShareCard(plot: PlotData | undefined, rank: number): Promise<void> {
  const gl = document.querySelector<HTMLCanvasElement>('.city-stage canvas');
  if (!gl) throw new Error('stage not ready');

  const W = 1080;
  const H = 1350;
  const out = document.createElement('canvas');
  out.width = W;
  out.height = H;
  const ctx = out.getContext('2d')!;

  ctx.fillStyle = '#0B0B0C';
  ctx.fillRect(0, 0, W, H);

  // street: cover-fit the stage into the middle band
  const bandTop = 150;
  const bandH = 1010;
  const sw = gl.width;
  const sh = gl.height;
  const scale = Math.max(W / sw, bandH / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, bandTop, W, bandH);
  ctx.clip();
  ctx.drawImage(gl, (W - dw) / 2, bandTop + (bandH - dh) / 2, dw, dh);
  // soft edges into the card ground
  const g1 = ctx.createLinearGradient(0, bandTop, 0, bandTop + 90);
  g1.addColorStop(0, 'rgba(11,11,12,1)');
  g1.addColorStop(1, 'rgba(11,11,12,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, bandTop, W, 90);
  const g2 = ctx.createLinearGradient(0, bandTop + bandH - 140, 0, bandTop + bandH);
  g2.addColorStop(0, 'rgba(11,11,12,0)');
  g2.addColorStop(1, 'rgba(11,11,12,1)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, bandTop + bandH - 140, W, 140);
  ctx.restore();

  // brand
  const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  ctx.strokeStyle = '#3DFF9A';
  ctx.lineWidth = 4;
  ctx.fillStyle = 'rgba(61,255,154,0.15)';
  roundRect(ctx, 64, 62, 48, 48, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3DFF9A';
  ctx.fillRect(74, 84, 7, 16);
  ctx.fillRect(84.5, 76, 7, 24);
  ctx.fillRect(95, 81, 7, 19);
  ctx.fillStyle = '#F4F4F5';
  ctx.font = `650 44px ${font}`;
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '-1px';
  ctx.fillText('CoinDistrict', 128, 86);
  ctx.textAlign = 'right';
  ctx.font = `500 22px ${font}`;
  ctx.fillStyle = '#8B8B93';
  ctx.fillText('Street view', W - 64, 86);
  ctx.textAlign = 'left';

  // legend strip
  ctx.fillStyle = '#8B8B93';
  ctx.font = `500 22px ${font}`;
  ctx.textAlign = 'center';
  ctx.fillText('← Higher mcap  ·  Lower →     height = 24h volume', W / 2, 1195);

  // focus plot
  if (plot) {
    const coin = isCoinPlot(plot) ? plot : null;
    const accent = isLotPlot(plot) || coin ? '#3DFF9A' : '#E8C36A';
    const tag = isLotPlot(plot) ? `#${plot.lotNumber}` : coin ? (coin.lease ? 'LEASED' : `#${rank}`) : 'AD';
    ctx.textAlign = 'left';
    ctx.fillStyle = accent;
    ctx.font = `700 26px ${font}`;
    ctx.fillText(tag, 64, 1262);
    ctx.fillStyle = '#F4F4F5';
    ctx.font = `650 34px ${font}`;
    const title = isLotPlot(plot) ? 'For lease · District' : coin ? `${coin.name}  ${coin.ticker}` : isAdPlot(plot) ? plot.advertiser : '';
    ctx.fillText(title, 64 + ctx.measureText(tag).width + 40, 1262);
    if (coin) {
      ctx.textAlign = 'right';
      ctx.fillStyle = coin.rentStatus === 'PAID' ? '#3DFF9A' : '#FF6B6B';
      ctx.font = `700 22px ${font}`;
      ctx.fillText(`RENT ${coin.rentStatus}`, W - 64, 1250);
      ctx.fillStyle = '#8B8B93';
      ctx.font = `500 22px ${font}`;
      ctx.fillText(`mcap ${formatUsd(coin.marketCap)} · vol ${formatUsd(coin.volume24h)}`, W - 64, 1282);
    }
  }

  const blob: Blob | null = await new Promise((r) => out.toBlob(r, 'image/png'));
  if (!blob) throw new Error('capture failed');
  const file = new File([blob], 'coindistrict-street.png', { type: 'image/png' });

  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'CoinDistrict', text: 'My street view on CoinDistrict' });
      return;
    } catch {
      /* fall through to download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'coindistrict-street.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
