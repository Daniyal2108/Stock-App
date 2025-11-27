import { useEffect, useRef } from 'react';
import { useMarket } from '../contexts/MarketContext';
import { fetchRealStockPrices } from '../services/marketDataService';
import { MOCK_STOCKS } from '../constants';

export const useMarketData = () => {
  const { refreshMarketData, marketData, setSelectedAsset, selectedAsset } = useMarket();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    refreshMarketData();
  }, [refreshMarketData]);

  useEffect(() => {
    const updateStocks = async () => {
      const stockSymbols = MOCK_STOCKS.map(s => s.symbol);
      const realPrices = await fetchRealStockPrices(stockSymbols);
      
      // Update logic would be handled by context
    };

    intervalRef.current = setInterval(updateStocks, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const liveAsset = marketData.find(m => m.symbol === selectedAsset.symbol);
    if (liveAsset && liveAsset.price !== selectedAsset.price) {
      setSelectedAsset(liveAsset);
    }
  }, [marketData, selectedAsset.symbol, selectedAsset.price, setSelectedAsset]);

  return { marketData, selectedAsset };
};

