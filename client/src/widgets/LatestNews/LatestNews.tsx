import { Link, useParams } from 'react-router-dom';
import './LatestNews.css';
import NewsBlock from '../../features/NewsBlock/NewsBlock';
import { Topic } from '../../types';

interface LatestNewsProps {
  latestNews: Topic[];
}

const LatestNews = ({ latestNews }: LatestNewsProps) => {
  const { language = 'en', topic = 'general' } = useParams<{
    language: string;
    topic: string;
  }>();

  return (
    <div className="latest-news">
      <header>
        <h2>Latest News</h2>
        <Link to={`/${language}/${topic}/latest-news`}>See all</Link>
      </header>
      <div className="content">
        {latestNews.map((topic) => (
          <NewsBlock key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
};

export default LatestNews;
