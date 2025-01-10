import { SupportedTopics } from '../types';

export const formatTopic = (topic: string): SupportedTopics => {
  return (topic.charAt(0).toUpperCase() +
    topic.slice(1).toLowerCase()) as SupportedTopics;
};
