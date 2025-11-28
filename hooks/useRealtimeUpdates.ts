import { useEffect, useRef } from "react";
import { useMarket } from "../contexts/MarketContext";

export const useRealtimeUpdates = () => {
  const { selectedAsset, refreshMarketData, updateChartData } = useMarket();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshMarketDataRef = useRef(refreshMarketData);
  const updateChartDataRef = useRef(updateChartData);
  const selectedAssetRef = useRef(selectedAsset);
  const isUpdatingRef = useRef(false); // Prevent concurrent updates

  // Keep refs updated
  useEffect(() => {
    refreshMarketDataRef.current = refreshMarketData;
    updateChartDataRef.current = updateChartData;
    selectedAssetRef.current = selectedAsset;
  }, [refreshMarketData, updateChartData, selectedAsset]);

  useEffect(() => {
    // Refresh market data every 30 seconds (increased to reduce API calls)
    // Chart data updates less frequently to avoid rate limits
    intervalRef.current = setInterval(async () => {
      // Prevent concurrent updates
      if (isUpdatingRef.current) {
        return;
      }

      try {
        isUpdatingRef.current = true;
        await refreshMarketDataRef.current();

        // Also refresh chart data if asset is selected (less frequently)
        const currentAsset = selectedAssetRef.current;
        if (currentAsset && currentAsset.symbol !== "LOADING") {
          // Only update chart data every 3rd cycle (every 90 seconds)
          const shouldUpdateChart = Math.random() < 0.33; // 33% chance
          if (shouldUpdateChart) {
            await updateChartDataRef.current("1D");
          }
        }
      } catch (error) {
        console.error("Error in real-time update:", error);
      } finally {
        isUpdatingRef.current = false;
      }
    }, 30000); // Update every 30 seconds (reduced frequency)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty deps - interval only created once
};
