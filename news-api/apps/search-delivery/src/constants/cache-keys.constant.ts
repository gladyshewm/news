export const CACHE_KEYS = {
  TRENDING_TOPICS: (
    language?: string,
    topic?: string,
    page: number = 1,
    limit: number = 10,
    sort: string = 'date',
    country?: string,
    publisher?: string,
  ) => {
    const parts = [
      'trendingTopics',
      language || 'all',
      topic || 'all',
      page,
      limit,
      sort,
      country || 'all',
      publisher || 'all',
    ];
    return parts.join('-');
  },
  LATEST_NEWS: (language: string, limit: number, topic?: string) =>
    `latestNews-${language}-${limit}-${topic || 'all'}`,
  SEARCH_ARTICLES: (query: string, language: string) =>
    `searchArticles-${query}-${language}`,
  // SEARCH_PUBLISHERS: (
  //   query: string,
  //   language: string,
  //   country: string,
  //   category: string,
  // ) => `searchPublishers-${query}-${country}-${language}-${category}`,
  SEARCH_PUBLISHERS: (name: string) => `searchPublishers-${name}`,
  FREQUENTLY_READ_NEWS: (limit: number) => `frequentlyReadNews-${limit}`,
  TOP_AUTHORS: (limit: number) => `topAuthors-${limit}`,
};
