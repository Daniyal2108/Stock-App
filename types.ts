export type ViewState = 'dashboard' | 'stocks' | 'options' | 'crypto' | 'forex' | 'analytics' | 'alerts' | 'portfolio';
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';
export type RiskTolerance = 'Conservative' | 'Balanced' | 'Aggressive' | 'Speculative';

export interface UserProfile {
  name: string;
  email: string;
  riskTolerance: RiskTolerance;
  goal: string; // e.g., "Retirement", "Lambo", "Steady Income"
  balance: number; // Cash Balance
}

export interface PortfolioItem {
  symbol: string;
  avgPrice: number;
  quantity: number;
  currentPrice: number; // For calculation convenience
  type: 'stock' | 'crypto' | 'forex';
}

export interface MarketAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  active: boolean;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap?: string;
  sector?: string;
  peRatio?: number;
  dividend?: string;
  high52Week?: number;
  low52Week?: number;
  type: 'stock' | 'crypto' | 'forex';
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  ema50?: number;
}

export interface OptionContract {
  strike: number;
  expiry: string;
  call: {
    bid: number;
    ask: number;
    last: number;
    iv: number;
    delta: number;
    gamma: number;
  };
  put: {
    bid: number;
    ask: number;
    last: number;
    iv: number;
    delta: number;
    gamma: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}