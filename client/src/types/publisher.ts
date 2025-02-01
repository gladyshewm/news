import { AuthorStats } from './author-stats';

export type Publisher = {
  name: string;
  url: string;
  favicon: string;
  authorStats: AuthorStats[];
};
