import { CoinData, LeaseInfo, LeaseTier, RentStatus } from '../types';

/**
 * The lease ledger (v1: static). Tenants lease District plots weekly.
 * v2 moves this behind a Netlify Function + DB written by Stripe webhooks.
 */

export const DOWNTOWN_SIZE = 25;
export const LOTS_FOR_LEASE = 6;
/** days after rentPaidThrough before a plot reads DUE */
export const GRACE_DAYS = 3;

export interface TierSpec {
  tier: LeaseTier;
  name: string;
  weekly: number;
  blurb: string;
  perks: string[];
}

export const TIERS: TierSpec[] = [
  {
    tier: 1,
    name: 'Storefront',
    weekly: 199,
    blurb: 'A plot on the street, next to the top 25.',
    perks: ['Logo on the crown', 'Sheet with links + CTA', 'Rent-paid mint glow'],
  },
  {
    tier: 2,
    name: 'Corner',
    weekly: 499,
    blurb: 'Closer to downtown, with a storefront.',
    perks: ['Everything in Storefront', 'Facade billboard', 'Share-card branding'],
  },
  {
    tier: 3,
    name: 'Tower',
    weekly: 1499,
    blurb: 'Front of the District, right after downtown.',
    perks: ['Everything in Corner', 'Crown beacon', 'Pinned copy in the sheet', 'New-tenant moment on the street'],
  },
];

export const AD_PLOT_WEEKLY = 2500;
export const PREPAY_DISCOUNT = 0.15;

export const tierSpec = (tier: LeaseTier) => TIERS.find((t) => t.tier === tier) ?? TIERS[0];
export const lowestWeekly = () => Math.min(...TIERS.map((t) => t.weekly));

/** Optional Stripe payment links per tier (VITE_STRIPE_LINK_TIER1..3). Without them the lease sheet captures a request. */
export function stripeLinkFor(tier: LeaseTier): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>;
  return env[`VITE_STRIPE_LINK_TIER${tier}`] || undefined;
}

interface Tenant {
  id: string;
  name: string;
  ticker: string;
  lease: LeaseInfo;
}

/** Demo tenants so the District reads as a place. Replace with real leases. */
export const TENANTS: Tenant[] = [
  {
    id: 'tenant-meridian',
    name: 'Meridian Labs',
    ticker: 'MRDN',
    lease: {
      tier: 3,
      tagline: 'Build on the block. Mainnet Q4.',
      website: 'https://example.com/meridian',
      x: 'meridianlabs',
      since: '2026-09-01',
      rentPaidThrough: '2026-12-31',
    },
  },
  {
    id: 'tenant-vaultworks',
    name: 'Vaultworks',
    ticker: 'VLT',
    lease: {
      tier: 2,
      tagline: 'Cold storage, warm UX.',
      website: 'https://example.com/vaultworks',
      since: '2026-09-05',
      rentPaidThrough: '2026-12-31',
    },
  },
  {
    id: 'tenant-raincity',
    name: 'Rain City DAO',
    ticker: 'RAIN',
    lease: {
      tier: 1,
      tagline: 'Community-run treasury, weekly drops.',
      since: '2026-08-20',
      rentPaidThrough: '2026-09-10', // lapsed: reads DUE
    },
  },
];

export function rentStatusFor(lease: LeaseInfo, now = new Date()): RentStatus {
  const paidThrough = new Date(lease.rentPaidThrough).getTime() + GRACE_DAYS * 86_400_000;
  return now.getTime() > paidThrough ? 'DUE' : 'PAID';
}

export function tenantToCoin(t: Tenant): CoinData {
  return {
    id: t.id,
    name: t.name,
    ticker: t.ticker,
    marketCap: 0,
    volume24h: 0,
    rentStatus: rentStatusFor(t.lease),
    lease: t.lease,
  };
}

/** District order: tier (highest first), then tenure (earliest first). */
export function sortTenants(coins: CoinData[]): CoinData[] {
  return [...coins].sort((a, b) => {
    const ta = a.lease?.tier ?? 0;
    const tb = b.lease?.tier ?? 0;
    if (tb !== ta) return tb - ta;
    return (a.lease?.since ?? '').localeCompare(b.lease?.since ?? '');
  });
}

/* ---- lease requests made from this device (v1, until tenants have accounts) ---- */

export interface LeaseRequest {
  id: string;
  lotNumber: number;
  tier: LeaseTier;
  project: string;
  ticker: string;
  website: string;
  email: string;
  coingeckoId?: string;
  notes?: string;
  createdAt: string;
  status: 'pending' | 'paid';
}

const KEY = 'coindistrict:leases';

export function loadLeaseRequests(): LeaseRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LeaseRequest[]) : [];
  } catch {
    return [];
  }
}

export function saveLeaseRequest(req: LeaseRequest) {
  try {
    const all = loadLeaseRequests().filter((r) => r.id !== req.id);
    all.unshift(req);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, 20)));
  } catch {
    /* storage unavailable: the request still went to the form endpoint */
  }
}
