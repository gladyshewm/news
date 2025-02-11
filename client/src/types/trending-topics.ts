import { Publisher } from './publisher';
import { SupportedTopics } from './supported-topics';

export type Topic = {
  id: number;
  topicId: SupportedTopics;
  title: string;
  url: string;
  excerpt: string;
  thumbnail: string;
  language: string;
  country: string;
  contentLength: number;
  authors: string[];
  publisher: Publisher;
  date: Date;
};
