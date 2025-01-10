import { SupportedTopics } from './supported-topics';

export type Publisher = {
  name: string;
  url: string;
  favicon: string;
};

export type Topic = {
  id: number;
  topicId: SupportedTopics;
  title: string;
  url: string;
  excerpt: string;
  thumbnail: string;
  language: string;
  contentLength: number;
  authors: string[];
  publisher: Publisher;
  date: Date;
};
