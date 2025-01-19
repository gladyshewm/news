import { Link } from 'react-router-dom';
import './FrequentlyReadNews.css';

const FrequentlyReadNews = () => {
  return (
    <div className="frequently-read-news">
      <header>
        <h2>Frequently Read</h2>
        <Link to={`#`}>See all</Link>
      </header>
      <div className="content">News Block</div>
    </div>
  );
};

export default FrequentlyReadNews;
