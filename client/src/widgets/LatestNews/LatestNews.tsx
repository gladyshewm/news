import { Link, useParams } from 'react-router-dom';
import './LatestNews.css';
import NewsBlock from '../../features/NewsBlock/NewsBlock';
import { Topic } from '../../types';
import { useEffect, useState } from 'react';
import { searchService } from '../../services/searchService';
import Loader from '../../features/Loader/Loader';
import { formatTopic } from '../../utils/formatTopic';

interface LatestNewsProps {
  limit: number;
}

const LatestNews = ({ limit }: LatestNewsProps) => {
  const [latestNews, setLatestNews] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { language = 'en', topic = 'general' } = useParams<{
    language: string;
    topic: string;
  }>();

  useEffect(() => {
    const formattedTopic = formatTopic(topic);

    searchService
      .getLatestNews(language, limit, formattedTopic)
      .then((data) => setLatestNews(data))
      .finally(() => setIsLoading(false));
  }, [language, limit, topic]);

  return (
    <div className="latest-news">
      <header>
        <h2>Latest News</h2>
        <Link to={`/${language}/${topic}/latest-news`}>See all</Link>
      </header>
      <div className="content">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {latestNews.map((topic) => (
              <NewsBlock key={topic.id} topic={topic} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default LatestNews;
