import { useEffect, useRef } from 'react';
import { useMarket } from '../contexts/MarketContext';
import { CandleData } from '../types';

export const useRealtimeUpdates = () => {
  const { selectedAsset, chartData, updateChartData } = useMarket();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedAsset.type === 'stock') return; // Stocks use API updates

    intervalRef.current = setInterval(() => {
      // Update chart data for crypto/forex
      const lastCandle = chartData[chartData.length - 1];
      if (!lastCandle) return;

      const volatility = lastCandle.close * 0.001;
      const move = (Math.random() - 0.5) * volatility;
      const newClose = lastCandle.close + move;

      const updatedCandle: CandleData = {
        ...lastCandle,
        close: newClose,
        high: Math.max(lastCandle.high, newClose),
        low: Math.min(lastCandle.low, newClose),
        volume: lastCandle.volume + Math.floor(Math.random() * 100),
      };

      // 5% chance to create a new candle
      if (Math.random() > 0.95) {
        const newCandle: CandleData = {
          ...updatedCandle,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open: newClose,
        };
        // This would need to be handled by context
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedAsset.type, chartData, updateChartData]);
};

