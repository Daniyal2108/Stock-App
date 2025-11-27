import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { MarketData, CandleData } from '../types';
import { MOCK_STOCKS, MOCK_CRYPTO, MOCK_FOREX, generateChartData } from '../constants';
import { fetchTopCoins, fetchRealForexRates, fetchRealStockPrices } from '../services/marketDataService';

interface MarketContextType {
  marketData: MarketData[];
  selectedAsset: MarketData;
  chartData: CandleData[];
  setSelectedAsset: (asset: MarketData) => void;
  updateChartData: (points?: number) => void;
  refreshMarketData: () => Promise<void>;
  getFilteredAssets: (type?: 'stock' | 'crypto' | 'forex', searchQuery?: string) => MarketData[];
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [marketData, setMarketData] = useState<MarketData[]>([...MOCK_STOCKS, ...MOCK_CRYPTO, ...MOCK_FOREX]);
  const [selectedAsset, setSelectedAssetState] = useState<MarketData>(MOCK_STOCKS[0]);
  const [chartData, setChartData] = useState<CandleData[]>(generateChartData(MOCK_STOCKS[0].price));

  const updateChartData = useCallback((points: number = 50) => {
    setChartData(generateChartData(selectedAsset.price, points));
  }, [selectedAsset.price]);

  const setSelectedAsset = useCallback((asset: MarketData) => {
    setSelectedAssetState(asset);
    setChartData(generateChartData(asset.price));
  }, []);

  const refreshMarketData = useCallback(async () => {
    try {
      // Try to fetch from API first, fallback to mock data
      try {
        const { marketService } = await import('../services/marketService');
        const apiData = await marketService.getMarketData();
        if (apiData && apiData.length > 0) {
          setMarketData(apiData);
          return;
        }
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError);
      }

      // Fallback to existing logic
      const topCoins = await fetchTopCoins();
      const forexRates = await fetchRealForexRates();
      const stockSymbols = MOCK_STOCKS.map(s => s.symbol);
      const realStockPrices = await fetchRealStockPrices(stockSymbols);

      setMarketData(prevData => {
        const stocks = prevData.filter(a => a.type === 'stock').map(stock => {
          if (realStockPrices[stock.symbol]) {
            return {
              ...stock,
              price: realStockPrices[stock.symbol]!.price,
              change: realStockPrices[stock.symbol]!.change,
              changePercent: realStockPrices[stock.symbol]!.changePercent,
            };
          }
          return stock;
        });

        const cryptos = topCoins.length > 0 ? topCoins : prevData.filter(a => a.type === 'crypto');

        const forex = prevData.filter(a => a.type === 'forex').map(asset => {
          if (forexRates[asset.symbol]) {
            return { ...asset, price: forexRates[asset.symbol]! };
          }
          return asset;
        });

        return [...stocks, ...cryptos, ...forex];
      });
    } catch (error) {
      console.error('Failed to refresh market data:', error);
    }
  }, []);

  const getFilteredAssets = useCallback((type?: 'stock' | 'crypto' | 'forex', searchQuery?: string) => {
    let data = marketData;
    if (type) {
      data = data.filter(a => a.type === type);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(a => 
        a.symbol.toLowerCase().includes(q) || 
        a.name.toLowerCase().includes(q)
      );
    }
    return data;
  }, [marketData]);

  const value = useMemo(() => ({
    marketData,
    selectedAsset,
    chartData,
    setSelectedAsset,
    updateChartData,
    refreshMarketData,
    getFilteredAssets,
  }), [marketData, selectedAsset, chartData, setSelectedAsset, updateChartData, refreshMarketData, getFilteredAssets]);

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within MarketProvider');
  }
  return context;
};

