import { useEffect, useState } from 'react';
import './HomePage.css';
import TrendingTopics from '../../features/TrendingTopics/TrendingTopics';
import { Topic } from '../../types';
import { searchService } from '../../services/searchService';
import Loader from '../../components/Loader/Loader';

const HomePage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchService
      .getTrendingTopics('ru', 1, 5, 'date')
      .then((data) => setTopics(data))
      .then(() => setIsLoading(false));
  }, []);

  return (
    <main className="home-page">
      {isLoading ? <Loader /> : <TrendingTopics topics={topics} />}
    </main>
  );
};

export default HomePage;
