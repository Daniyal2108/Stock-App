import { apiRequest } from './apiClient';
import { MarketData, CandleData } from '../types';

export interface MarketDataResponse {
  status: string;
  results: number;
  data: {
    marketData: MarketData[];
  };
}

export interface CandleDataResponse {
  status: string;
  data: {
    candles: CandleData[];
  };
}

export interface MarketStatsResponse {
  status: string;
  data: {
    stats: {
      totalAssets: number;
      totalVolume: number;
      topGainers: MarketData[];
      topLosers: MarketData[];
    };
  };
}

// Market Service
export const marketService = {
  // Get all market data
  getMarketData: async (type?: 'stock' | 'crypto' | 'forex'): Promise<MarketData[]> => {
    try {
      const params = type ? { type } : {};
      const response = await apiRequest.get<MarketDataResponse>('/market/data', { params });
      return response.data.marketData || [];
    } catch (error: any) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  },

  // Get market data by symbol
  getMarketDataBySymbol: async (symbol: string): Promise<MarketData> => {
    try {
      const response = await apiRequest.get<{ status: string; data: { marketData: MarketData } }>(`/market/data/${symbol}`);
      return response.data.marketData;
    } catch (error: any) {
      console.error('Error fetching market data by symbol:', error);
      throw error;
    }
  },

  // Get candle data for symbol
  getCandleData: async (symbol: string, timeRange: string = '1D'): Promise<CandleData[]> => {
    try {
      const response = await apiRequest.get<CandleDataResponse>(`/market/candles/${symbol}`, {
        params: { timeRange },
      });
      return response.data.candles || [];
    } catch (error: any) {
      console.error('Error fetching candle data:', error);
      throw error;
    }
  },

  // Get market statistics
  getMarketStats: async (): Promise<MarketStatsResponse['data']['stats']> => {
    try {
      const response = await apiRequest.get<MarketStatsResponse>('/market/stats');
      return response.data.stats;
    } catch (error: any) {
      console.error('Error fetching market stats:', error);
      throw error;
    }
  },

  // Search market data
  searchMarketData: async (query: string): Promise<MarketData[]> => {
    try {
      const response = await apiRequest.get<MarketDataResponse>('/market/search', {
        params: { q: query },
      });
      return response.data.marketData || [];
    } catch (error: any) {
      console.error('Error searching market data:', error);
      throw error;
    }
  },
};

