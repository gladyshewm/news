import { useEffect, useState } from 'react';
import './TopAuthorsPage.css';
import Loader from '../../features/Loader/Loader';
import { Link } from 'react-router-dom';
import { searchService } from '../../services/searchService';
import { AuthorStats } from '../../types';
import { formatTopicDate } from '../../utils/formatDate';
import { handleImageError, isImageLoaded } from '../../utils/isImageLoaded';
import { EyeIcon, NewspaperIcon, PhotoIcon } from '../../icons';
import Pagination from '../../features/Pagination/Pagination';

const TopAuthorsPage = () => {
  const LIMIT = 100;
  const [topAuthors, setTopAuthors] = useState<AuthorStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<string>>(
    new Set(),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  const MAX_PAGE_BUTTONS = 9;
  const totalPages = Math.ceil(topAuthors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAuthors = topAuthors.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    searchService
      .getTopAuthors({ limit: LIMIT })
      .then((data) => setTopAuthors(data))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="top-authors-page">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <div className="top-authors-header__title">
              <h1>Top Authors</h1>
            </div>
            <Link to="/en/general" className="back-button">
              Back
            </Link>
          </header>
          <div className="top-authors">
            {currentAuthors.map((author) => (
              <div key={author.id} className="author-block">
                <div className="author-info">
                  {isImageLoaded(loadedThumbnails, author.publisher.favicon) ? (
                    <PhotoIcon />
                  ) : (
                    <img
                      className="author-favicon"
                      src={author.publisher.favicon}
                      alt={`${author.publisher.name} favicon`}
                      onError={() =>
                        handleImageError(
                          setLoadedThumbnails,
                          author.publisher.favicon,
                        )
                      }
                    />
                  )}

                  <div className="author-details">
                    <abbr title={author.publisher.name}>
                      <a
                        href={author.publisher.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="author-link"
                      >
                        {author.publisher.name}
                      </a>
                    </abbr>
                  </div>
                </div>
                <div className="author-stats">
                  <div>
                    <Link to={`#`}>
                      {/* /en/authors/${author.id} */}
                      Total Articles: <span>{author.totalArticles}</span>
                      <NewspaperIcon />
                    </Link>
                  </div>
                  <div>
                    Total Views: <span>{author.totalClicks}</span>
                    <EyeIcon />
                  </div>
                  <div>
                    Last Updated:
                    <span>{formatTopicDate(author.lastUpdated)}</span>
                  </div>
                </div>
              </div>
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

export default TopAuthorsPage;
