import { Link } from 'react-router-dom';
import './FrequentlyReadTopics.css';
import { useEffect, useState } from 'react';
import { searchService } from '../../services/searchService';
import { FrequentlyReadNews } from '../../types';
import NewsBlock from '../../features/NewsBlock/NewsBlock';
import Loader from '../../components/Loader/Loader';

interface FrequentlyReadTopicsProps {
  limit: number;
}

const FrequentlyReadTopics = ({ limit }: FrequentlyReadTopicsProps) => {
  const [frequentlyReadNews, setFrequentlyReadNews] = useState<
    FrequentlyReadNews[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchService
      .getFrequentlyReadNews(limit)
      .then((data) => setFrequentlyReadNews(data))
      .finally(() => setIsLoading(false));
  }, [limit]);

  return (
    <div className="frequently-read-topics">
      <header>
        <h2>Frequently Read</h2>
        <Link to={`#`}>See all</Link>
      </header>
      <div className="content">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {frequentlyReadNews.map((topic) => (
              <NewsBlock key={topic.id} topic={topic} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default FrequentlyReadTopics;
