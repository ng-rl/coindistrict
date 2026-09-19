import { CoinData, LotPlot, PlotData, Zone, isCoinPlot, isLeasedPlot, isLotPlot } from '../types';
import { DOWNTOWN_SIZE, LOTS_FOR_LEASE, TENANTS, sortTenants, tenantToCoin } from './ledger';

export const MOCK_COINS: CoinData[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    ticker: 'BTC',
    marketCap: 1250000000000,
    volume24h: 45000000000,
    rentStatus: 'PAID',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    ticker: 'ETH',
    marketCap: 420000000000,
    volume24h: 28000000000,
    rentStatus: 'PAID',
  },
  {
    id: 'solana',
    name: 'Solana',
    ticker: 'SOL',
    marketCap: 85000000000,
    volume24h: 5200000000,
    rentStatus: 'PAID',
  },
  {
    id: 'cardano',
    name: 'Cardano',
    ticker: 'ADA',
    marketCap: 32000000000,
    volume24h: 980000000,
    rentStatus: 'DUE',
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    ticker: 'AVAX',
    marketCap: 18500000000,
    volume24h: 620000000,
    rentStatus: 'PAID',
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    ticker: 'DOT',
    marketCap: 12300000000,
    volume24h: 420000000,
    rentStatus: 'PAID',
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    ticker: 'LINK',
    marketCap: 9800000000,
    volume24h: 380000000,
    rentStatus: 'DUE',
  },
  {
    id: 'polygon',
    name: 'Polygon',
    ticker: 'MATIC',
    marketCap: 7200000000,
    volume24h: 290000000,
    rentStatus: 'PAID',
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    ticker: 'UNI',
    marketCap: 5600000000,
    volume24h: 180000000,
    rentStatus: 'PAID',
  },
  {
    id: 'cosmos',
    name: 'Cosmos',
    ticker: 'ATOM',
    marketCap: 4100000000,
    volume24h: 150000000,
    rentStatus: 'PAID',
  },
  {
    id: 'algorand',
    name: 'Algorand',
    ticker: 'ALGO',
    marketCap: 3200000000,
    volume24h: 95000000,
    rentStatus: 'DUE',
  },
  {
    id: 'near',
    name: 'NEAR Protocol',
    ticker: 'NEAR',
    marketCap: 2800000000,
    volume24h: 78000000,
    rentStatus: 'PAID',
  },
  {
    id: 'aptos',
    name: 'Aptos',
    ticker: 'APT',
    marketCap: 2100000000,
    volume24h: 92000000,
    rentStatus: 'PAID',
  },
  {
    id: 'fantom',
    name: 'Fantom',
    ticker: 'FTM',
    marketCap: 1800000000,
    volume24h: 52000000,
    rentStatus: 'PAID',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    ticker: 'ARB',
    marketCap: 1500000000,
    volume24h: 68000000,
    rentStatus: 'DUE',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    ticker: 'OP',
    marketCap: 1200000000,
    volume24h: 45000000,
    rentStatus: 'PAID',
  },
  {
    id: 'sei',
    name: 'Sei',
    ticker: 'SEI',
    marketCap: 980000000,
    volume24h: 38000000,
    rentStatus: 'PAID',
  },
  {
    id: 'injective',
    name: 'Injective',
    ticker: 'INJ',
    marketCap: 720000000,
    volume24h: 25000000,
    rentStatus: 'PAID',
  },
  {
    id: 'celestia',
    name: 'Celestia',
    ticker: 'TIA',
    marketCap: 580000000,
    volume24h: 21000000,
    rentStatus: 'DUE',
  },
  {
    id: 'starknet',
    name: 'Starknet',
    ticker: 'STRK',
    marketCap: 420000000,
    volume24h: 15000000,
    rentStatus: 'PAID',
  },
];

const AD_INVENTORY: { advertiser: string; tagline: string }[] = [
  { advertiser: 'Northline', tagline: 'Zero-fee spot. Night desk open.' },
  { advertiser: 'Vaultworks', tagline: 'Cold storage, warm UX.' },
  { advertiser: 'Meridian Labs', tagline: 'Build on the block.' },
];

function createAdPlot(index: number) {
  const ad = AD_INVENTORY[index % AD_INVENTORY.length];
  return {
    id: `ad-${index}`,
    advertiser: ad.advertiser,
    tagline: ad.tagline,
    isAd: true as const,
  };
}

/**
 * The street: Downtown (top 25 by market cap, earned) → District (leased plots, by tier then tenure)
 * → empty lots for lease. A paid ad plot is inserted after every 7 organic plots across both zones.
 */
export function buildStreet(coins: CoinData[], tenants: CoinData[] = TENANTS.map(tenantToCoin), lots = LOTS_FOR_LEASE): PlotData[] {
  const downtown = [...coins].sort((a, b) => b.marketCap - a.marketCap).slice(0, DOWNTOWN_SIZE);
  const district = sortTenants(tenants);
  const organic: CoinData[] = [...downtown, ...district];
  const street: PlotData[] = [];
  organic.forEach((plot, index) => {
    street.push(plot);
    if ((index + 1) % 7 === 0) street.push(createAdPlot(Math.floor(index / 7)));
  });
  const firstLot = organic.length + 1;
  for (let i = 0; i < lots; i++) {
    const lot: LotPlot = { id: `lot-${firstLot + i}`, isLot: true, lotNumber: firstLot + i };
    street.push(lot);
  }
  return street;
}

/** Index of the first District plot (leased or lot), or the street length if there is none. */
export function districtStart(street: PlotData[]): number {
  const i = street.findIndex((p) => isLotPlot(p) || isLeasedPlot(p));
  return i < 0 ? street.length : i;
}

export function zoneOf(street: PlotData[], index: number): Zone {
  return index >= districtStart(street) ? 'district' : 'downtown';
}

/** Rank among downtown coins (1-based), or null for District plots. */
export function downtownRank(street: PlotData[], index: number): number | null {
  const plot = street[index];
  if (!plot || !isCoinPlot(plot) || plot.lease) return null;
  return street.slice(0, index + 1).filter((p) => isCoinPlot(p) && !p.lease).length;
}

export function generateStreetData(): PlotData[] {
  return buildStreet(MOCK_COINS);
}
