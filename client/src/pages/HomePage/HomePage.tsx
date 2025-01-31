import { useEffect, useState } from 'react';
import './HomePage.css';
import TrendingTopics from '../../widgets/TrendingTopics/TrendingTopics';
import { GetTrendingTopics, Topic } from '../../types';
import { searchService } from '../../services/searchService';
import Loader from '../../features/Loader/Loader';
import LatestNews from '../../widgets/LatestNews/LatestNews';
import TopAuthors from '../../widgets/TopAuthors/TopAuthors';
import FrequentlyReadTopics from '../../widgets/FrequentlyReadTopics/FrequentlyReadTopics';

const HomePage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const query: GetTrendingTopics = {
      language: 'en',
      topic: ['General'],
      page: 1,
      limit: 5,
      sort: 'date',
    };

    searchService
      .getTrendingTopics(query)
      .then((data) => setTopics(data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="home-page">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <TrendingTopics topics={topics} />
          <LatestNews limit={3} />
          <FrequentlyReadTopics limit={3} />
          <TopAuthors limit={4} />
        </>
      )}
    </main>
  );
};

export default HomePage;
