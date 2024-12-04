import { useEffect, useState } from 'react';
import TrendingTopics from '../features/TrendingTopics';
import { Topic } from '../types';

const HomePage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const a = [
      {
        id: 1,
        title: 'General',
        url: 'https://google.com',
        excerpt: 'This is a general news topic.',
        thumbnail: 'https://via.placeholder.com/150',
        language: 'en',
        contentLength: 1000,
        authors: ['John Doe'],
        publisher: {
          name: 'ABC News',
          url: 'https://abcnews.com',
          favicon: 'https://abcnews.com/favicon.ico',
        },
        date: new Date(),
      },
      {
        id: 2,
        title: 'Sport',
        url: 'https://google.com',
        excerpt: 'This is a sport news topic.',
        thumbnail: 'https://via.placeholder.com/150',
        language: 'en',
        contentLength: 1000,
        authors: ['John Doe'],
        publisher: {
          name: 'ABC News',
          url: 'https://abcnews.com',
          favicon: 'https://abcnews.com/favicon.ico',
        },
        date: new Date(),
      },
    ];
    setTopics(a);
  }, []);

  return (
    <div>
      <h1>News Aggregator</h1>
      <TrendingTopics topics={topics} />
    </div>
  );
};

export default HomePage;
