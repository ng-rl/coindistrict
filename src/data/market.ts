import { useEffect, useRef, useState } from 'react';
import { CoinData, DataSource, RentStatus } from '../types';
import { MOCK_COINS } from './mockData';
import { DOWNTOWN_SIZE, TENANTS, tenantToCoin } from './ledger';

/**
 * Live market data from CoinGecko's public API (no key needed; ~30 req/min).
 * One /coins/markets call gives mcap, volume, price, logo and a 7d sparkline for the whole street.
 * Falls back to the mock street if the API is unreachable or rate-limited.
 */
const API = 'https://api.coingecko.com/api/v3';
const STREET_SIZE = DOWNTOWN_SIZE;
export const REFRESH_MS = 60_000;

/** Rent is a CoinDistrict mechanic, not market data. Until the ledger exists, a fixed demo set is DUE. */
const RENT_DUE = new Set(['cardano', 'chainlink', 'algorand', 'arbitrum', 'celestia', 'dogecoin', 'tron']);
const rentFor = (id: string): RentStatus => (RENT_DUE.has(id) ? 'DUE' : 'PAID');

/** Stablecoins and wrapped assets are not projects with a plot. */
const EXCLUDE = new Set(['tether', 'usd-coin', 'dai', 'wrapped-bitcoin', 'staked-ether', 'weth', 'wrapped-steth', 'usds', 'ethena-usde', 'first-digital-usd', 'binance-bridged-usdt-bnb-smart-chain', 'wrapped-eeth', 'coinbase-wrapped-btc', 'susds', 'blackrock-usd-institutional-digital-liquidity-fund', 'paypal-usd', 'usd1-wlfi', 'usdt0']);

interface CgMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price: number[] };
}

function headers(): HeadersInit {
  const key = import.meta.env.VITE_COINGECKO_KEY as string | undefined;
  return key ? { 'x-cg-demo-api-key': key } : {};
}

export async function fetchMarkets(signal?: AbortSignal): Promise<CoinData[]> {
  const url = `${API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${STREET_SIZE + EXCLUDE.size}&page=1&sparkline=true&price_change_percentage=24h`;
  const res = await fetch(url, { signal, headers: headers() });
  if (!res.ok) throw new Error(`coingecko ${res.status}`);
  const rows = (await res.json()) as CgMarket[];
  return rows
    .filter((r) => !EXCLUDE.has(r.id) && r.market_cap > 0)
    .slice(0, STREET_SIZE)
    .map((r) => ({
      id: r.id,
      name: r.name,
      ticker: r.symbol.toUpperCase(),
      marketCap: r.market_cap,
      volume24h: r.total_volume,
      rentStatus: rentFor(r.id),
      image: r.image,
      priceUsd: r.current_price,
      change24h: r.price_change_percentage_24h ?? undefined,
      sparkline7d: r.sparkline_in_7d?.price,
    }));
}

/** Live volume / price / logo for tenants that gave a CoinGecko id. Height stays honest: volume or base. */
export async function enrichTenants(signal?: AbortSignal): Promise<CoinData[]> {
  const base = TENANTS.map(tenantToCoin);
  const ids = TENANTS.filter((t) => t.lease.coingeckoId).map((t) => t.lease.coingeckoId as string);
  if (ids.length === 0) return base;
  const url = `${API}/coins/markets?vs_currency=usd&ids=${ids.join(',')}&sparkline=true&price_change_percentage=24h`;
  const res = await fetch(url, { signal, headers: headers() });
  if (!res.ok) throw new Error(`coingecko ${res.status}`);
  const rows = (await res.json()) as CgMarket[];
  const byId = new Map(rows.map((r) => [r.id, r]));
  return base.map((c) => {
    const r = c.lease?.coingeckoId ? byId.get(c.lease.coingeckoId) : undefined;
    if (!r) return c;
    return {
      ...c,
      marketCap: r.market_cap,
      volume24h: r.total_volume,
      image: r.image,
      priceUsd: r.current_price,
      change24h: r.price_change_percentage_24h ?? undefined,
      sparkline7d: r.sparkline_in_7d?.price,
    };
  });
}

export type PricePoint = [number, number];
const chartCache = new Map<string, { at: number; points: PricePoint[] }>();

/** 24h price series (5-minute resolution on CoinGecko). Cached 5 min per coin. */
export async function fetchPriceChart(id: string, days: 1 | 7 = 1): Promise<PricePoint[]> {
  const key = `${id}:${days}`;
  const hit = chartCache.get(key);
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.points;
  const res = await fetch(`${API}/coins/${id}/market_chart?vs_currency=usd&days=${days}`, { headers: headers() });
  if (!res.ok) throw new Error(`coingecko ${res.status}`);
  const json = (await res.json()) as { prices: PricePoint[] };
  chartCache.set(key, { at: Date.now(), points: json.prices });
  return json.prices;
}

export interface MarketState {
  coins: CoinData[];
  tenants: CoinData[];
  source: DataSource;
  updatedAt: number | null;
  error: string | null;
}

/** Polls the market every REFRESH_MS while the tab is visible. Starts on mock, swaps to live on first success. */
export function useMarketData(): MarketState {
  const [state, setState] = useState<MarketState>({ coins: MOCK_COINS, tenants: TENANTS.map(tenantToCoin), source: 'mock', updatedAt: null, error: null });
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    let controller: AbortController | null = null;

    const tick = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const coins = await fetchMarkets(controller.signal);
        if (!alive || coins.length < 5) return;
        const tenants = await enrichTenants(controller.signal).catch(() => TENANTS.map(tenantToCoin));
        if (!alive) return;
        setState({ coins, tenants, source: 'live', updatedAt: Date.now(), error: null });
      } catch (e) {
        if (!alive || (e as Error).name === 'AbortError') return;
        setState((s) => ({ ...s, error: (e as Error).message }));
      }
    };

    const schedule = () => {
      if (timer.current) window.clearInterval(timer.current);
      timer.current = window.setInterval(() => {
        if (document.visibilityState === 'visible') void tick();
      }, REFRESH_MS);
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') void tick();
    };

    void tick();
    schedule();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      controller?.abort();
      if (timer.current) window.clearInterval(timer.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return state;
}
