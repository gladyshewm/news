import { Topic } from '../types';

const mockNews = Array.from({ length: 200 }, (_, index) => ({
  id: index + 1,
  topicId: ['Sports', 'Politics', 'Technology', 'Entertainment', 'Business'][
    Math.floor(Math.random() * 5)
  ],
  title: `Latest News Item ${index + 1}`,
  url: `https://example.com/news-item-${index + 1}`,
  thumbnail: `https://example.com/news-item-${index + 1}-thumbnail.jpg`,
  excerpt: `This is the excerpt for the latest news item ${
    index + 1
  }. Contains some interesting information about the topic.`,
  publisher: {
    name: `Publisher ${Math.floor(Math.random() * 10) + 1}`,
    url: `https://example.com/publisher-${Math.floor(Math.random() * 10) + 1}`,
  },
  date: new Date(
    Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
  ),
}));

export default mockNews as Topic[];
