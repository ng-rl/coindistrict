export type RentStatus = 'PAID' | 'DUE';

export interface CoinData {
  id: string;
  name: string;
  ticker: string;
  marketCap: number;
  volume24h: number;
  rentStatus: RentStatus;
}

export interface AdPlot {
  id: string;
  advertiser: string;
  isAd: true;
}

export type PlotData = CoinData | AdPlot;

export function isAdPlot(plot: PlotData): plot is AdPlot {
  return 'isAd' in plot && plot.isAd === true;
}

export function isCoinPlot(plot: PlotData): plot is CoinData {
  return !isAdPlot(plot);
}
