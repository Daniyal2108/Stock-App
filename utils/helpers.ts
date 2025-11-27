import { MarketData, CandleData } from '../types';

// Format currency
export const formatCurrency = (
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSign?: boolean;
  } = {}
): string => {
  // Handle NaN and Infinity first
  if (!isFinite(value) || isNaN(value)) {
    return value > 0 ? '+∞' : value < 0 ? '-∞' : 'NaN';
  }

  const {
    minimumFractionDigits,
    maximumFractionDigits,
    showSign = false,
  } = options;

  // If maximumFractionDigits is explicitly set to 0, also set minimumFractionDigits to 0
  // Otherwise default to 2 for both
  let minDigits: number;
  let maxDigits: number;

  if (maximumFractionDigits === 0) {
    minDigits = 0;
    maxDigits = 0;
  } else {
    minDigits = minimumFractionDigits ?? 2;
    maxDigits = maximumFractionDigits ?? 2;
  }

  // Validate fraction digits (must be between 0 and 20)
  minDigits = Math.max(0, Math.min(20, minDigits));
  maxDigits = Math.max(0, Math.min(20, maxDigits));
  
  // Ensure maxDigits >= minDigits (required by toLocaleString)
  const validMaxDigits = Math.max(minDigits, maxDigits);

  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: validMaxDigits,
  });

  return showSign && value > 0 ? `+${formatted}` : formatted;
};

// Format percentage
export const formatPercentage = (
  value: number,
  options: { showSign?: boolean; decimals?: number } = {}
): string => {
  const { showSign = true, decimals = 2 } = options;
  
  // Validate decimals (must be between 0 and 20)
  const validDecimals = Math.max(0, Math.min(20, decimals));
  
  // Handle NaN and Infinity
  if (!isFinite(value)) {
    return value > 0 ? '+∞%' : value < 0 ? '-∞%' : 'NaN%';
  }
  
  const formatted = value.toFixed(validDecimals);
  return showSign && value > 0 ? `+${formatted}%` : `${formatted}%`;
};

// Format large numbers (K, M, B, T)
export const formatLargeNumber = (value: number): string => {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
};

// Calculate P&L
export const calculatePnL = (
  currentPrice: number,
  avgPrice: number,
  quantity: number
): { pnl: number; pnlPercent: number } => {
  const costBasis = avgPrice * quantity;
  const currentValue = currentPrice * quantity;
  const pnl = currentValue - costBasis;
  const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

  return { pnl, pnlPercent };
};


// Get price change color class
export const getPriceChangeColor = (changePercent: number): string => {
  if (changePercent > 0) return 'text-emerald-400';
  if (changePercent < 0) return 'text-rose-400';
  return 'text-slate-400';
};

// Get price change icon
export const getPriceChangeIcon = (changePercent: number): string => {
  if (changePercent > 0) return '↑';
  if (changePercent < 0) return '↓';
  return '→';
};

// Check if asset is bullish
export const isBullish = (open: number, close: number): boolean => {
  return close >= open;
};

// Filter assets by type and search
export const filterAssets = (
  assets: MarketData[],
  type?: 'stock' | 'crypto' | 'forex',
  searchQuery?: string
): MarketData[] => {
  let filtered = assets;

  if (type) {
    filtered = filtered.filter((a) => a.type === type);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.symbol.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query)
    );
  }

  return filtered;
};

// Generate CSV content
export const generateCSV = (
  headers: string[],
  rows: (string | number)[][]
): string => {
  const headerRow = headers.join(',');
  const dataRows = rows.map((row) => row.join(',')).join('\n');
  return `${headerRow}\n${dataRows}`;
};

// Download CSV
export const downloadCSV = (content: string, filename: string): void => {
  const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`;
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Calculate price domain for charts
export const calculatePriceDomain = (data: CandleData[]): [number, number] => {
  if (data.length === 0) return [0, 100];
  const allPrices = data.flatMap((d) => [d.high, d.low, d.open, d.close]);
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);
  const padding = (max - min) * 0.1;
  return [Math.max(0, min - padding), max + padding];
};

// Calculate volume domain for charts
export const calculateVolumeDomain = (data: CandleData[]): [number, number] => {
  if (data.length === 0) return [0, 100];
  const volumes = data.map((d) => d.volume);
  const max = Math.max(...volumes);
  return [0, max * 1.1];
};

// Get sentiment color
export const getSentimentColor = (
  sentiment: 'positive' | 'negative' | 'neutral'
): string => {
  switch (sentiment) {
    case 'positive':
      return 'text-emerald-500';
    case 'negative':
      return 'text-rose-500';
    default:
      return 'text-amber-500';
  }
};

// Get sentiment icon
export const getSentimentIcon = (
  sentiment: 'positive' | 'negative' | 'neutral'
): string => {
  switch (sentiment) {
    case 'positive':
      return '↑';
    case 'negative':
      return '↓';
    default:
      return '→';
  }
};

