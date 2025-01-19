import { useEffect, useState } from 'react';
import './HomePage.css';
import TrendingTopics from '../../widgets/TrendingTopics/TrendingTopics';
import { Topic } from '../../types';
import { searchService } from '../../services/searchService';
import Loader from '../../components/Loader/Loader';
import LatestNews from '../../widgets/LatestNews/LatestNews';
import FrequentlyReadNews from '../../widgets/FrequentlyReadNews/FrequentlyReadNews';
import TopAuthors from '../../widgets/TopAuthors/TopAuthors';

const HomePage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [latestNews, setLatestNews] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchService
      .getTrendingTopics('en', 'General', 1, 5, 'date')
      .then((data) => setTopics(data));

    searchService
      .getLatestNews('en', 3)
      .then((data) => setLatestNews(data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="home-page">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <TrendingTopics topics={topics} />
          <LatestNews latestNews={latestNews} />
          <FrequentlyReadNews />
          <TopAuthors />
        </>
      )}
    </main>
  );
};

export default HomePage;
