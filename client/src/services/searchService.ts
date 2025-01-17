import { SupportedTopics, Topic } from '../types';

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
      console.log(language, topic, page, limit, sort, country);
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
      console.error('Error fetching topics:', error);
      throw new Error('Failed to fetch topics');
    }
  }

  async getLatestNews(language: string, limit: number): Promise<Topic[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search-delivery/latest-news?language=${language}&limit=${limit}`,
      );
      const { data: topics }: { data: Topic[] } = await response.json();
      return topics;
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw new Error('Failed to fetch topics');
    }
  }
}

export const searchService = new SearchService(API_URL);
