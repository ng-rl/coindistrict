export type RentStatus = 'PAID' | 'DUE';

export type LeaseTier = 1 | 2 | 3;

/** A District tenant's lease. Rent is weekly; rentPaidThrough drives PAID / DUE. */
export interface LeaseInfo {
  tier: LeaseTier;
  tagline: string;
  website?: string;
  x?: string;
  /** ISO date the lease started (tenure orders plots within a tier) */
  since: string;
  /** ISO date rent is paid through */
  rentPaidThrough: string;
  /** optional CoinGecko id: enriches the plot with live volume, price, logo */
  coingeckoId?: string;
}

export interface CoinData {
  id: string;
  name: string;
  ticker: string;
  marketCap: number;
  volume24h: number;
  rentStatus: RentStatus;
  /** logo URL (CoinGecko) */
  image?: string;
  priceUsd?: number;
  /** 24h price change, percent */
  change24h?: number;
  /** 7d hourly price series, oldest first */
  sparkline7d?: number[];
  /** set on District plots: this project leases its plot */
  lease?: LeaseInfo;
}

export type DataSource = 'live' | 'mock';

export interface AdPlot {
  id: string;
  advertiser: string;
  tagline?: string;
  isAd: true;
}

/** An empty District lot, for lease. */
export interface LotPlot {
  id: string;
  isLot: true;
  lotNumber: number;
}

export type PlotData = CoinData | AdPlot | LotPlot;

export function isAdPlot(plot: PlotData): plot is AdPlot {
  return 'isAd' in plot && plot.isAd === true;
}

export function isLotPlot(plot: PlotData): plot is LotPlot {
  return 'isLot' in plot && plot.isLot === true;
}

export function isCoinPlot(plot: PlotData): plot is CoinData {
  return !isAdPlot(plot) && !isLotPlot(plot);
}

export function isLeasedPlot(plot: PlotData): plot is CoinData & { lease: LeaseInfo } {
  return isCoinPlot(plot) && !!plot.lease;
}

export type Zone = 'downtown' | 'district';
