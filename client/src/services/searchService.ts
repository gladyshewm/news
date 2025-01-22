import {
  AuthorStats,
  FrequentlyReadNews,
  SupportedTopics,
  Topic,
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class SearchService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getTrendingTopics(
    language: string,
    topic: SupportedTopics,
    page: number = 1,
    limit: number = 10,
    sort: string = 'date',
    country?: string,
  ): Promise<Topic[]> {
    try {
      const response = await fetch(
        `${
          this.baseUrl
        }/search-delivery/trending-topics?language=${language}&topic=${topic}&page=${page}&limit=${limit}&sort=${sort}${
          country ? `&country=${country}` : ''
        }`,
      );
      const { data: topics }: { data: Topic[] } = await response.json();
      return topics;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw new Error('Failed to fetch trending topics');
    }
  }

  async getLatestNews(
    language: string,
    limit: number,
    topic: string = '',
  ): Promise<Topic[]> {
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
    limit: number = 10,
  ): Promise<FrequentlyReadNews[]> {
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

  async getTopAuthors(limit: number = 5): Promise<AuthorStats[]> {
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
}

export const searchService = new SearchService(API_URL);
