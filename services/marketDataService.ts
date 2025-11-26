import { MarketData } from '../types';

// Map our symbols to CoinGecko API IDs for specific updates if needed
const CRYPTO_ID_MAP: Record<string, string> = {
  'BTC/USD': 'bitcoin',
  'ETH/USD': 'ethereum',
  'SOL/USD': 'solana',
  'XRP/USD': 'ripple'
};

// Fetch top 100 coins from CoinGecko
export const fetchTopCoins = async (): Promise<MarketData[]> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
    if (!response.ok) throw new Error("Failed to fetch top coins");
    
    const data = await response.json();
    
    return data.map((coin: any) => ({
      symbol: `${coin.symbol.toUpperCase()}/USD`,
      name: coin.name,
      price: coin.current_price,
      change: coin.price_change_24h || 0,
      changePercent: coin.price_change_percentage_24h || 0,
      volume: coin.total_volume?.toString() || '0',
      marketCap: coin.market_cap?.toString() || '0',
      high52Week: coin.high_24h,
      low52Week: coin.low_24h,
      type: 'crypto'
    }));
  } catch (e) {
    console.warn("Failed to fetch top coins, falling back to mock.", e);
    return [];
  }
};

// Fetch real crypto prices and 24h change from CoinGecko (Free API)
export const fetchRealCryptoPrices = async (): Promise<Partial<Record<string, { price: number, changePercent: number }>>> => {
  try {
    const ids = Object.values(CRYPTO_ID_MAP).join(',');
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
    
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    
    const results: Record<string, { price: number, changePercent: number }> = {};
    
    Object.entries(CRYPTO_ID_MAP).forEach(([symbol, id]) => {
      if (data[id]) {
        results[symbol] = {
            price: data[id].usd,
            changePercent: data[id].usd_24h_change
        };
      }
    });
    return results;
  } catch (e) {
    console.warn("Failed to fetch live crypto prices.", e);
    return {};
  }
};

// Fetch real forex rates from Frankfurter (Free API)
export const fetchRealForexRates = async (): Promise<Partial<Record<string, number>>> => {
    try {
        // Frankfurter base is USD
        const response = await fetch('https://api.frankfurter.app/latest?from=USD');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        const rates = data.rates;
        
        // Calculate Cross Rates
        return {
            'EUR/USD': rates.EUR ? (1 / rates.EUR) : 1.05,
            'USD/JPY': rates.JPY,
            'USD/CAD': rates.CAD,
            'GBP/JPY': rates.GBP && rates.JPY ? (1 / rates.GBP) * rates.JPY : 195.00
        };
    } catch (e) {
        console.warn("Failed to fetch live forex rates.", e);
        return {};
    }
}

// Fetch Real Stock Prices from Yahoo Finance (via CORS Proxy)
export const fetchRealStockPrices = async (symbols: string[]): Promise<Partial<Record<string, { price: number, change: number, changePercent: number, volume: string, marketCap: string }>>> => {
    const results: Record<string, any> = {};
    
    // We fetch them individually to handle errors per symbol gracefully
    await Promise.all(symbols.map(async (symbol) => {
        try {
            // Using corsproxy.io to bypass CORS restrictions on the browser
            const response = await fetch(`https://corsproxy.io/?https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`);
            if (!response.ok) return;

            const data = await response.json();
            const meta = data.chart?.result?.[0]?.meta;

            if (meta) {
                const price = meta.regularMarketPrice;
                const prevClose = meta.previousClose;
                const change = price - prevClose;
                const changePercent = (change / prevClose) * 100;
                
                results[symbol] = {
                    price,
                    change,
                    changePercent,
                    volume: 'N/A', // Yahoo chart API doesn't always allow volume in meta easily without parsing timestamps
                    marketCap: 'N/A' 
                };
            }
        } catch (error) {
            console.warn(`Failed to fetch data for ${symbol}`, error);
        }
    }));

    return results;
};