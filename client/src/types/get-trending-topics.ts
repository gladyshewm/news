export type GetTrendingTopics = {
  language?: string;
  topic?: string[];
  country?: string;
  publisher?: string[];
  sort?: string;
  page: number;
  limit: number;
};
