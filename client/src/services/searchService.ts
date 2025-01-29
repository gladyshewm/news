import {
  AuthorStats,
  FrequentlyReadNews,
  GetFrequentlyReadNews,
  GetLatestNews,
  GetTopAuthors,
  GetTrendingTopics,
  Topic,
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class SearchService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getTrendingTopics(query: GetTrendingTopics): Promise<Topic[]> {
    const { language, topic, page, limit, publisher, sort, country } = query;
    try {
      const response = await fetch(
        `${
          this.baseUrl
        }/search-delivery/trending-topics?language=${language}&topic=${topic}&page=${page}&limit=${limit}&sort=${sort}${`&country=${
          country || ''
        }&publisher=${publisher || ''}`}`,
      );
      const { data: topics }: { data: Topic[] } = await response.json();
      return topics;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw new Error('Failed to fetch trending topics');
    }
  }

  async getLatestNews(query: GetLatestNews): Promise<Topic[]> {
    const { language, limit, topic } = query;
    try {
      const response = await fetch(
        `${this.baseUrl}/search-delivery/latest-news?language=${language}&limit=${limit}&topic=${topic}`,
      );
      const { data: topics }: { data: Topic[] } = await response.json();
      return topics;
    } catch (error) {
      console.error('Error fetching latest news:', error);
      throw new Error('Failed to fetch latest news');
    }
  }

  async getFrequentlyReadNews(
    query: GetFrequentlyReadNews,
  ): Promise<FrequentlyReadNews[]> {
    const { limit } = query;
    try {
      const response = await fetch(
        `${this.baseUrl}/search-delivery/analytics/frequently-read-news?limit=${limit}`,
      );
      const frequentlyReadNews: FrequentlyReadNews[] = await response.json();
      return frequentlyReadNews;
    } catch (error) {
      console.error('Error fetching frequently read news:', error);
      throw new Error('Failed to fetch frequently read news');
    }
  }

  async getTopAuthors(query: GetTopAuthors): Promise<AuthorStats[]> {
    const { limit } = query;
    try {
      const response = await fetch(
        `${this.baseUrl}/search-delivery/analytics/top-authors?limit=${limit}`,
      );
      const topAuthors: AuthorStats[] = await response.json();
      return topAuthors;
    } catch (error) {
      console.error('Error fetching top authors:', error);
      throw new Error('Failed to fetch top authors');
    }
  }

  async registerClick(trendingTopicId: number): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/search-delivery/analytics/news-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trendingTopicId }),
      });
    } catch (error) {
      console.error('Error when processing a click:', error);
      throw new Error('Error when processing a click');
    }
  }
}

export const searchService = new SearchService(API_URL);
