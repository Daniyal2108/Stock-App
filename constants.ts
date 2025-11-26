import { MarketData, CandleData, OptionContract } from "./types";

// Updated to reflect Real-World Prices as of Late 2024
export const MOCK_STOCKS: MarketData[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 237.50, change: 1.25, changePercent: 0.52, volume: '45.2M', marketCap: '3.6T', sector: 'Tech', peRatio: 34.5, dividend: '0.56%', high52Week: 237.29, low52Week: 164.00, type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 345.10, change: 12.40, changePercent: 3.73, volume: '98.1M', marketCap: '1.1T', sector: 'Auto', peRatio: 85.2, dividend: 'N/A', high52Week: 358.29, low52Week: 152.37, type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 141.30, change: -2.20, changePercent: -1.57, volume: '320.5M', marketCap: '3.5T', sector: 'Semi', peRatio: 66.1, dividend: '0.02%', high52Week: 153.94, low52Week: 45.00, type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft', price: 425.12, change: 2.10, changePercent: 0.51, volume: '22.1M', marketCap: '3.1T', sector: 'Tech', peRatio: 36.4, dividend: '0.71%', high52Week: 468.82, low52Week: 309.45, type: 'stock' },
  { symbol: 'AMD', name: 'Adv. Micro Dev', price: 138.00, change: 1.50, changePercent: 1.09, volume: '55.3M', marketCap: '220B', sector: 'Semi', peRatio: 120.5, dividend: 'N/A', high52Week: 227.30, low52Week: 121.02, type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 208.45, change: 3.20, changePercent: 1.56, volume: '38.2M', marketCap: '2.1T', sector: 'Cons. Disc.', peRatio: 42.1, dividend: 'N/A', high52Week: 215.00, low52Week: 145.00, type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 178.35, change: -0.45, changePercent: -0.25, volume: '24.1M', marketCap: '2.2T', sector: 'Tech', peRatio: 24.1, dividend: '0.20%', high52Week: 191.75, low52Week: 130.00, type: 'stock' },
];

export const MOCK_CRYPTO: MarketData[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: 98450.00, change: 2500.00, changePercent: 2.60, volume: '55B', marketCap: '1.9T', high52Week: 99800, low52Week: 38000, type: 'crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum', price: 3350.20, change: 45.00, changePercent: 1.36, volume: '18B', marketCap: '400B', high52Week: 4000, low52Week: 2100, type: 'crypto' },
  { symbol: 'SOL/USD', name: 'Solana', price: 245.60, change: 8.20, changePercent: 3.45, volume: '4.2B', marketCap: '110B', high52Week: 260, low52Week: 50, type: 'crypto' },
  { symbol: 'XRP/USD', name: 'Ripple', price: 1.45, change: 0.10, changePercent: 7.40, volume: '3.2B', marketCap: '80B', high52Week: 1.60, low52Week: 0.42, type: 'crypto' },
  { symbol: 'BNB/USD', name: 'Binance Coin', price: 660.50, change: 5.50, changePercent: 0.84, volume: '1.2B', marketCap: '95B', high52Week: 720, low52Week: 300, type: 'crypto' },
  { symbol: 'DOGE/USD', name: 'Dogecoin', price: 0.38, change: 0.02, changePercent: 5.55, volume: '2B', marketCap: '55B', high52Week: 0.45, low52Week: 0.08, type: 'crypto' },
  { symbol: 'ADA/USD', name: 'Cardano', price: 0.78, change: -0.02, changePercent: -2.50, volume: '800M', marketCap: '28B', high52Week: 0.90, low52Week: 0.30, type: 'crypto' },
];

export const MOCK_FOREX: MarketData[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0450, change: -0.0020, changePercent: -0.19, volume: 'N/A', type: 'forex' },
  { symbol: 'GBP/JPY', name: 'British Pound / Yen', price: 195.45, change: 0.30, changePercent: 0.16, volume: 'N/A', type: 'forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Yen', price: 154.10, change: 0.15, changePercent: 0.10, volume: 'N/A', type: 'forex' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian', price: 1.3980, change: 0.0010, changePercent: 0.07, volume: 'N/A', type: 'forex' },
];

// Generate fake chart data with a random walk
export const generateChartData = (startPrice: number, points: number = 50): CandleData[] => {
  let currentPrice = startPrice;
  const data: CandleData[] = [];
  const now = new Date();
  
  for (let i = 0; i < points; i++) {
    const date = new Date(now.getTime() - (points - i) * 60000 * 60); // Hourly candles
    const volatility = startPrice * 0.005; // Reduced volatility for smoother charts
    const change = (Math.random() - 0.5) * volatility;
    
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * (volatility / 2);
    const low = Math.min(open, close) - Math.random() * (volatility / 2);
    const volume = Math.floor(Math.random() * 1000000) + 500000;

    currentPrice = close;

    data.push({
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open,
      high,
      low,
      close,
      volume,
      sma20: close * (1 + (Math.random() * 0.02 - 0.01)), 
      ema50: close * (1 + (Math.random() * 0.04 - 0.02)),
    });
  }
  return data;
};

export const generateOptionsChain = (spotPrice: number): OptionContract[] => {
  const strikes = [];
  const startStrike = Math.floor(spotPrice * 0.85);
  for (let i = 0; i < 12; i++) {
    const strike = startStrike + (i * (spotPrice * 0.02)); // Dynamic strike steps
    const timeToExpiry = 30 / 365; // 30 days
    
    // Basic Black-Scholes-ish estimation for better realism
    const d1 = (Math.log(spotPrice / strike) + (0.05 + 0.5 * 0.2 * 0.2) * timeToExpiry) / (0.2 * Math.sqrt(timeToExpiry));
    
    // Delta Approx
    const deltaCall = 0.5 + (spotPrice - strike) / (spotPrice * 0.5); 
    const deltaPut = deltaCall - 1;

    const callPrice = Math.max(0.01, (spotPrice - strike) + (Math.random() * spotPrice * 0.05));
    const putPrice = Math.max(0.01, (strike - spotPrice) + (Math.random() * spotPrice * 0.05));

    strikes.push({
      strike: Math.round(strike),
      expiry: '2024-12-20',
      call: {
        bid: Number((callPrice * 0.98).toFixed(2)),
        ask: Number((callPrice * 1.02).toFixed(2)),
        last: Number(callPrice.toFixed(2)),
        iv: Number((0.2 + Math.random() * 0.1).toFixed(2)),
        delta: Number(Math.max(0, Math.min(1, deltaCall)).toFixed(2)),
        gamma: Number((Math.random() * 0.05).toFixed(3)),
      },
      put: {
        bid: Number((putPrice * 0.98).toFixed(2)),
        ask: Number((putPrice * 1.02).toFixed(2)),
        last: Number(putPrice.toFixed(2)),
        iv: Number((0.2 + Math.random() * 0.1).toFixed(2)),
        delta: Number(Math.max(-1, Math.min(0, deltaPut)).toFixed(2)),
        gamma: Number((Math.random() * 0.04).toFixed(3)),
      }
    });
  }
  return strikes;
};