import { Topic } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class SearchService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getTrendingTopics(
    language: string = 'ru',
    page: number = 1,
    limit: number = 10,
    sort: string = 'date',
  ): Promise<Topic[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search-delivery/trending-topics?language=${language}&page=${page}&limit=${limit}&sort=${sort}`,
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
