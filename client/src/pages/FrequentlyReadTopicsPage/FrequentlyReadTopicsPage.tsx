import { useEffect, useState } from 'react';
import './FrequentlyReadTopicsPage.css';
import Loader from '../../components/Loader/Loader';
import { Link } from 'react-router-dom';
import { FrequentlyReadNews } from '../../types';
import { searchService } from '../../services/searchService';
import NewsBlock from '../../features/NewsBlock/NewsBlock';
import { EyeIcon } from '../../icons';
import Pagination from '../../features/Pagination/Pagination';

const FrequentlyReadTopicsPage = () => {
  const LIMIT = 100;
  const [frequentlyReadNews, setFrequentlyReadNews] = useState<
    FrequentlyReadNews[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;
  const MAX_PAGE_BUTTONS = 9;
  const totalPages = Math.ceil(frequentlyReadNews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentNews = frequentlyReadNews.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    searchService
      .getFrequentlyReadNews(LIMIT)
      .then((news) => {
        setFrequentlyReadNews(news);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const ViewCounter = ({ viewsCount }: { viewsCount: number }) => {
    return (
      <div className="view-counter">
        <abbr title="Views">
          <EyeIcon />
          <span>{viewsCount}</span>
        </abbr>
      </div>
    );
  };

  return (
    <div className="frequently-read-topics-page">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <div className="frequently-read-topics-header__title">
              <h1>Frequently Read News</h1>
            </div>
            <Link to="/en/general" className="back-button">
              Back
            </Link>
          </header>
          <div className="news-list">
            {currentNews.map((news) => (
              <NewsBlock
                key={news.id}
                topic={news}
                extraHeaderContent={
                  <ViewCounter viewsCount={news.clicksCount} />
                }
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              maxPageButtons={MAX_PAGE_BUTTONS}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FrequentlyReadTopicsPage;
