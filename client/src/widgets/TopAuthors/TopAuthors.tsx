import { Link } from 'react-router-dom';
import './TopAuthors.css';
import { useEffect, useState } from 'react';
import { AuthorStats } from '../../types';
import { searchService } from '../../services/searchService';
import Loader from '../../components/Loader/Loader';

interface TopAuthorsProps {
  limit: number;
}

const TopAuthors = ({ limit }: TopAuthorsProps) => {
  const [topAuthors, setTopAuthors] = useState<AuthorStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchService
      .getTopAuthors(limit)
      .then((data) => setTopAuthors(data))
      .finally(() => setIsLoading(false));
  }, [limit]);

  return (
    <div className="top-authors">
      <header>
        <h2>Top Authors</h2>
        <Link to={`#`}>See all</Link>
      </header>
      <div className="content">
        {isLoading ? (
          <Loader />
        ) : (
          <>
            {topAuthors.map((author) => (
              <div key={author.id} className="author-block">
                <abbr title={author.publisher.name}>
                  <a
                    href={author.publisher.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={author.publisher.favicon} alt="favicon" />
                  </a>
                </abbr>
                <a
                  href={author.publisher.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <abbr title={author.publisher.name}>
                    {author.publisher.name}
                  </abbr>
                </a>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default TopAuthors;
