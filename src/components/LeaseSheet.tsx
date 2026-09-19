import { FormEvent, useState } from 'react';
import { LeaseTier, LotPlot } from '../types';
import { LeaseRequest, PREPAY_DISCOUNT, TIERS, saveLeaseRequest, stripeLinkFor, tierSpec } from '../data/ledger';

interface LeaseSheetProps {
  lot: LotPlot;
  onClose: () => void;
  onRequested: (req: LeaseRequest) => void;
}

const encode = (data: Record<string, string>) =>
  Object.entries(data)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

/**
 * Lease an empty lot. Tier picker + request form.
 * The form posts to Netlify Forms (no backend); with Stripe payment links configured it also offers Pay & lease now.
 */
export function LeaseSheet({ lot, onClose, onRequested }: LeaseSheetProps) {
  const [tier, setTier] = useState<LeaseTier>(1);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<LeaseRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const spec = tierSpec(tier);
  const stripe = stripeLinkFor(tier);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const fields: Record<string, string> = {
      'form-name': 'lease',
      lot: String(lot.lotNumber),
      tier: `${spec.tier} ${spec.name} $${spec.weekly}/wk`,
      project: String(fd.get('project') ?? ''),
      ticker: String(fd.get('ticker') ?? '').toUpperCase(),
      website: String(fd.get('website') ?? ''),
      email: String(fd.get('email') ?? ''),
      coingecko: String(fd.get('coingecko') ?? ''),
      notes: String(fd.get('notes') ?? ''),
    };
    if (String(fd.get('bot-field') ?? '')) return; // honeypot
    try {
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: encode(fields) });
      if (!res.ok) throw new Error(`form ${res.status}`);
    } catch (err) {
      // local dev has no form endpoint; keep the request on-device so the flow still completes
      if (import.meta.env.PROD) {
        setBusy(false);
        setError('Could not send the request. Try again, or email lease@coindistrict.app');
        return;
      }
      console.warn('lease form (dev):', err);
    }
    const req: LeaseRequest = {
      id: `req-${Date.now()}`,
      lotNumber: lot.lotNumber,
      tier,
      project: fields.project,
      ticker: fields.ticker,
      website: fields.website,
      email: fields.email,
      coingeckoId: fields.coingecko || undefined,
      notes: fields.notes || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    saveLeaseRequest(req);
    onRequested(req);
    setDone(req);
    setBusy(false);
    if (stripe) window.open(`${stripe}?client_reference_id=${encodeURIComponent(req.id)}`, '_blank', 'noopener');
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-cd-mint uppercase">District · Plot #{lot.lotNumber}</p>
          <h2 className="text-2xl font-bold text-cd-text leading-tight">Lease this plot</h2>
          <p className="text-sm text-cd-muted mt-1">A tower on the same street as BTC. Weekly rent keeps the lights on.</p>
        </div>
      </div>

      {done ? (
        <div className="p-4 bg-cd-bg rounded-lg border border-cd-line">
          <p className="text-cd-text font-semibold">Request received.</p>
          <p className="text-sm text-cd-muted mt-1">
            {stripe
              ? 'Complete payment in the tab that opened. Your tower goes live once the project is verified, usually within a day.'
              : `We’ll verify ${done.project} and reply to ${done.email} with a payment link. Your tower goes live once rent clears, usually within a day.`}
          </p>
          <p className="text-xs text-cd-muted mt-3">Track it under My Plots.</p>
        </div>
      ) : (
        <form onSubmit={submit} name="lease" data-netlify="true" netlify-honeypot="bot-field">
          <input type="hidden" name="form-name" value="lease" />
          <p className="hidden">
            <label>
              Don’t fill this out: <input name="bot-field" />
            </label>
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4" role="radiogroup" aria-label="Lease tier">
            {TIERS.map((t) => {
              const active = t.tier === tier;
              return (
                <button
                  type="button"
                  key={t.tier}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTier(t.tier)}
                  className="text-left p-3 rounded-lg border"
                  style={{
                    borderColor: active ? 'var(--cd-mint)' : 'var(--cd-line)',
                    background: active ? 'var(--cd-mint-dim)' : 'var(--cd-bg)',
                  }}
                >
                  <div className="text-xs font-semibold text-cd-text">{t.name}</div>
                  <div className="font-mono text-base text-cd-text">${t.weekly}</div>
                  <div className="text-[10px] text-cd-muted">per week</div>
                </button>
              );
            })}
          </div>

          <div className="mb-4 p-3 bg-cd-bg rounded-lg border border-cd-line">
            <p className="text-sm text-cd-text">{spec.blurb}</p>
            <ul className="mt-2 space-y-1">
              {spec.perks.map((p) => (
                <li key={p} className="text-xs text-cd-muted flex gap-2">
                  <span className="text-cd-mint">•</span>
                  {p}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-cd-muted mt-2">Prepay 4 weeks and save {Math.round(PREPAY_DISCOUNT * 100)}%. Height is never for sale.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="col-span-2 text-xs text-cd-muted">
              Project
              <input name="project" required className="lease-input" placeholder="Meridian Labs" />
            </label>
            <label className="text-xs text-cd-muted">
              Ticker
              <input name="ticker" required maxLength={8} className="lease-input uppercase" placeholder="MRDN" />
            </label>
            <label className="text-xs text-cd-muted">
              CoinGecko id (optional)
              <input name="coingecko" className="lease-input" placeholder="meridian-labs" />
            </label>
            <label className="col-span-2 text-xs text-cd-muted">
              Website or X
              <input name="website" required className="lease-input" placeholder="https://" inputMode="url" />
            </label>
            <label className="col-span-2 text-xs text-cd-muted">
              Contact email
              <input name="email" type="email" required className="lease-input" placeholder="you@project.xyz" />
            </label>
            <label className="col-span-2 text-xs text-cd-muted">
              Anything else
              <textarea name="notes" rows={2} className="lease-input" placeholder="Launch date, what you want on the storefront…" />
            </label>
          </div>

          {error && <p className="text-sm mt-3" style={{ color: 'var(--cd-due)' }}>{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-4 py-3 bg-cd-mint text-cd-bg font-semibold rounded-lg disabled:opacity-60"
          >
            {busy ? 'Sending…' : stripe ? `Pay & lease · $${spec.weekly}/wk` : `Request Plot #${lot.lotNumber} · $${spec.weekly}/wk`}
          </button>
          <p className="text-[11px] text-cd-muted text-center mt-2">Verified projects only. No charge until your tower is approved.</p>
        </form>
      )}

      <div className="sticky bottom-0 -mx-6 px-6 pt-3 bg-cd-surface" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <button onClick={onClose} className="w-full py-3 rounded-lg border border-cd-line text-cd-text font-semibold">
          {done ? 'Back to the street' : 'Not now'}
        </button>
      </div>
    </div>
  );
}
