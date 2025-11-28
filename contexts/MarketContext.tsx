import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  useEffect,
} from "react";
import { MarketData, CandleData } from "../types";
import { marketService } from "../services/marketService";

interface MarketContextType {
  marketData: MarketData[];
  selectedAsset: MarketData | null;
  chartData: CandleData[];
  setSelectedAsset: (asset: MarketData) => void;
  updateChartData: (points?: number) => void;
  refreshMarketData: () => Promise<void>;
  getFilteredAssets: (
    type?: "stock" | "crypto" | "forex",
    searchQuery?: string
  ) => MarketData[];
  loading: boolean;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

// Default empty asset to prevent errors
const DEFAULT_ASSET: MarketData = {
  symbol: "LOADING",
  name: "Loading...",
  price: 0,
  change: 0,
  changePercent: 0,
  volume: "0",
  type: "stock",
};

export const MarketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [selectedAsset, setSelectedAssetState] = useState<MarketData | null>(
    null
  );
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);

  const updateChartData = useCallback(
    async (timeRange: string = "1D") => {
      if (!selectedAsset) return;

      try {
        const candleData = await marketService.getCandleData(
          selectedAsset.symbol,
          timeRange
        );
        if (candleData && candleData.length > 0) {
          setChartData(candleData);
        }
      } catch (error) {
        console.error("Failed to update chart data:", error);
      }
    },
    [selectedAsset]
  );

  const setSelectedAsset = useCallback(async (asset: MarketData) => {
    setSelectedAssetState(asset);
    // Fetch real candle data from API
    try {
      const candleData = await marketService.getCandleData(asset.symbol, "1D");
      if (candleData && candleData.length > 0) {
        setChartData(candleData);
        return;
      }
    } catch (error) {
      console.error("Failed to fetch candle data:", error);
      setChartData([]);
    }
  }, []);

  const refreshMarketData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all market data from backend API
      const apiData = await marketService.getMarketData();

      if (apiData && apiData.length > 0) {
        setMarketData(apiData);

        // Set first asset as selected if none selected
        setSelectedAssetState((prevAsset) => {
          if (!prevAsset && apiData.length > 0) {
            const firstAsset = apiData[0];
            // Fetch candle data for first asset
            marketService
              .getCandleData(firstAsset.symbol, "1D")
              .then((candleData) => {
                if (candleData && candleData.length > 0) {
                  setChartData(candleData);
                }
              })
              .catch((error) => {
                console.error("Failed to fetch initial candle data:", error);
              });
            return firstAsset;
          } else if (prevAsset) {
            // Update selected asset if it exists in new data
            const updatedAsset = apiData.find(
              (a) => a.symbol === prevAsset.symbol
            );
            return updatedAsset || prevAsset;
          }
          return prevAsset;
        });
      }
    } catch (apiError) {
      console.error("Failed to fetch market data:", apiError);
      // Don't set mock data - just show empty state
      setMarketData([]);
    } finally {
      setLoading(false);
    }
  }, []); // Remove selectedAsset from dependencies to prevent infinite loop

  // Initial data fetch on mount - only once
  useEffect(() => {
    refreshMarketData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  const getFilteredAssets = useCallback(
    (type?: "stock" | "crypto" | "forex", searchQuery?: string) => {
      let data = marketData;
      if (type) {
        data = data.filter((a) => a.type === type);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        data = data.filter(
          (a) =>
            a.symbol.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q)
        );
      }
      return data;
    },
    [marketData]
  );

  const value = useMemo(
    () => ({
      marketData,
      selectedAsset: selectedAsset || DEFAULT_ASSET,
      chartData,
      setSelectedAsset,
      updateChartData,
      refreshMarketData,
      getFilteredAssets,
      loading,
    }),
    [
      marketData,
      selectedAsset,
      chartData,
      setSelectedAsset,
      updateChartData,
      refreshMarketData,
      getFilteredAssets,
      loading,
    ]
  );

  return (
    <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarket must be used within MarketProvider");
  }
  return context;
};
