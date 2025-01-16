import { Link } from 'react-router-dom';
import './LatestNews.css';
import NewsBlock from '../../features/NewsBlock/NewsBlock';

const LatestNews = () => {
  return (
    <div className="latest-news">
      <header>
        <h2>Latest news</h2>
        <Link to="#">See all {'>'}</Link>
      </header>
      <div className="content">
        <NewsBlock />
        <NewsBlock />
        <NewsBlock />
      </div>
    </div>
  );
};

export default LatestNews;
