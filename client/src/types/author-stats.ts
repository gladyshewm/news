import { Publisher } from './publisher';

export type AuthorStats = {
  id: number;
  publisher: Publisher;
  publisherId: number;
  totalArticles: number;
  totalClicks: number;
  lastUpdated: Date;
};
