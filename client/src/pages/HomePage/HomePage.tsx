import { useEffect, useState } from 'react';
import './HomePage.css';
import TrendingTopics from '../../widgets/TrendingTopics/TrendingTopics';
import { Topic } from '../../types';
import { searchService } from '../../services/searchService';
import Loader from '../../components/Loader/Loader';
import LatestNews from '../../widgets/LatestNews/LatestNews';

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
      .then(() => setIsLoading(false));
  }, []);

  return (
    <main className="home-page">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="digest">
            <TrendingTopics topics={topics} />
          </div>
          <LatestNews latestNews={latestNews} />
        </>
      )}
    </main>
  );
};

export default HomePage;
