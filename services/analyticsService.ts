import { apiRequest } from './apiClient';
import { MarketData } from '../types';

export interface AnalyticsStats {
  totalAssets: number;
  gainers: number;
  losers: number;
  avgChange: number;
  totalVolume: number;
  stocks: number;
  cryptos: number;
  forex: number;
}

export interface SectorPerformance {
  sector: string;
  avgChange: number;
  count: number;
}

export interface TopMovers {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
}

export interface AnalyticsResponse {
  status: string;
  data: {
    stats: AnalyticsStats;
    topGainers: TopMovers[];
    topLosers: TopMovers[];
    sectorPerformance: SectorPerformance[];
    priceDistribution: Array<{ range: string; count: number }>;
    volumeLeaders: TopMovers[];
  };
}

// Analytics Service
export const analyticsService = {
  // Get comprehensive analytics
  getAnalytics: async (timeRange: string = '1M'): Promise<AnalyticsResponse['data']> => {
    try {
      const response = await apiRequest.get<AnalyticsResponse>('/analytics', {
        params: { timeRange },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Get market statistics
  getMarketStats: async (): Promise<AnalyticsStats> => {
    try {
      const response = await apiRequest.get<{ status: string; data: { stats: AnalyticsStats } }>('/analytics/stats');
      return response.data.stats;
    } catch (error: any) {
      console.error('Error fetching market stats:', error);
      throw error;
    }
  },

  // Get top gainers
  getTopGainers: async (limit: number = 10): Promise<TopMovers[]> => {
    try {
      const response = await apiRequest.get<{ status: string; data: { gainers: TopMovers[] } }>('/analytics/gainers', {
        params: { limit },
      });
      return response.data.gainers;
    } catch (error: any) {
      console.error('Error fetching top gainers:', error);
      throw error;
    }
  },

  // Get top losers
  getTopLosers: async (limit: number = 10): Promise<TopMovers[]> => {
    try {
      const response = await apiRequest.get<{ status: string; data: { losers: TopMovers[] } }>('/analytics/losers', {
        params: { limit },
      });
      return response.data.losers;
    } catch (error: any) {
      console.error('Error fetching top losers:', error);
      throw error;
    }
  },

  // Get sector performance
  getSectorPerformance: async (): Promise<SectorPerformance[]> => {
    try {
      const response = await apiRequest.get<{ status: string; data: { sectors: SectorPerformance[] } }>('/analytics/sectors');
      return response.data.sectors;
    } catch (error: any) {
      console.error('Error fetching sector performance:', error);
      throw error;
    }
  },

  // Get volume leaders
  getVolumeLeaders: async (limit: number = 10): Promise<TopMovers[]> => {
    try {
      const response = await apiRequest.get<{ status: string; data: { leaders: TopMovers[] } }>('/analytics/volume', {
        params: { limit },
      });
      return response.data.leaders;
    } catch (error: any) {
      console.error('Error fetching volume leaders:', error);
      throw error;
    }
  },
};

