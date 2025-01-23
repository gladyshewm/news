import { SupportedTopicsDto } from '@app/shared';

export const CACHE_KEYS = {
  TRENDING_TOPICS: (
    language: string,
    topic: SupportedTopicsDto,
    page: number,
    limit: number,
    sort: string,
    country?: string,
  ) =>
    `trendingTopics:${language}-${topic}-${page}-${limit}-${sort}${country ? `-${country}` : ''}`,
  LATEST_NEWS: (language: string, limit: number, topic: string) =>
    `latestNews:${language}-${limit}-${topic || 'all'}`,
  SEARCH_ARTICLES: (query: string, language: string) =>
    `searchArticles:${query}-${language}`,
  SEARCH_PUBLISHERS: (
    query: string,
    language: string,
    country: string,
    category: string,
  ) => `searchPublishers:${query}-${country}-${language}-${category}`,
  FREQUENTLY_READ_NEWS: (limit: number) => `frequentlyReadNews:${limit}`,
  TOP_AUTHORS: (limit: number) => `topAuthors:${limit}`,
};
