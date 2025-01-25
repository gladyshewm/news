import { useEffect, useState } from 'react';
import './HomePage.css';
import TrendingTopics from '../../widgets/TrendingTopics/TrendingTopics';
import { Topic } from '../../types';
import { searchService } from '../../services/searchService';
import Loader from '../../features/Loader/Loader';
import LatestNews from '../../widgets/LatestNews/LatestNews';
import TopAuthors from '../../widgets/TopAuthors/TopAuthors';
import FrequentlyReadTopics from '../../widgets/FrequentlyReadTopics/FrequentlyReadTopics';

const HomePage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchService
      .getTrendingTopics('en', 'General', 1, 5, 'date')
      .finally(() => setIsLoading(false))
      .then((data) => setTopics(data));
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
