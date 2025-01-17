import { Link } from 'react-router-dom';
import './LatestNews.css';
import NewsBlock from '../../features/NewsBlock/NewsBlock';
import { Topic } from '../../types';

interface LatestNewsProps {
  latestNews: Topic[];
}

const LatestNews = ({ latestNews }: LatestNewsProps) => {
  return (
    <div className="latest-news">
      <header>
        <h2>Latest News</h2>
        <Link to="/latest-news">See all</Link>
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
