import { useEffect, useRef } from "react";
import { useMarket } from "../contexts/MarketContext";

export const useMarketData = () => {
  const { marketData, selectedAsset } = useMarket();
  // This hook is now just for accessing market data
  // Real-time updates are handled by useRealtimeUpdates to avoid duplicate intervals

  return { marketData, selectedAsset };
};
