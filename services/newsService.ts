import { apiRequest } from "./apiClient";

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  sentiment: "positive" | "negative" | "neutral";
  url?: string;
}

export interface NewsResponse {
  status: string;
  results: number;
  data: {
    news: NewsItem[];
  };
}

export const newsService = {
  // Get market news
  getNews: async (limit: number = 10): Promise<NewsItem[]> => {
    try {
      const response = await apiRequest.get<NewsResponse>("/news", {
        params: { limit },
      });
      return response.data.news || [];
    } catch (error: any) {
      console.error("Error fetching news:", error);
      return [];
    }
  },
};
