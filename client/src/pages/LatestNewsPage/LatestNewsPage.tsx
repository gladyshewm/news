import './LatestNewsPage.css';
import { Link } from 'react-router-dom';
import { Topic } from '../../types';
import { useEffect, useState } from 'react';
import { searchService } from '../../services/searchService';
import Loader from '../../components/Loader/Loader';
import NewsBlock from '../../features/NewsBlock/NewsBlock';
import Pagination from '../../features/Pagination/Pagination';

const ITEMS_PER_PAGE = 9;
const MAX_PAGE_BUTTONS = 9;

const LatestNewsPage = () => {
  const [latestNews, setLatestNews] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    searchService
      .getLatestNews('en', 100)
      .then((data) => setLatestNews(data))
      .then(() => setIsLoading(false));
  }, []);

  const totalPages = Math.ceil(latestNews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentNews = latestNews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="latest-news-page">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header className="latest-news-header">
            <h1>Latest News</h1>
            <Link to="/" className="back-button">
              Back
            </Link>
          </header>
          <div className="news-list">
            {currentNews.map((news) => (
              <NewsBlock key={news.id} topic={news} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            maxPageButtons={MAX_PAGE_BUTTONS}
          />
        </>
      )}
    </div>
  );
};

export default LatestNewsPage;
