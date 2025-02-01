import './AuthorSearch.css';
import { useEffect, useState } from 'react';
import { searchService } from '../../../../services/searchService';

interface AuthorSearchProps {
  selectedAuthors: string[];
  setSelectedAuthors: React.Dispatch<React.SetStateAction<string[]>>;
}

const AuthorSearch = ({
  selectedAuthors,
  setSelectedAuthors,
}: AuthorSearchProps) => {
  const [query, setQuery] = useState('');
  const [suggestedAuthors, setSuggestedAuthors] = useState<string[]>([]);

  useEffect(() => {
    if (!query) return;

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await searchService.searchPublishers({ name: query });
        setSuggestedAuthors(response.map((author) => author.name));
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const addAuthor = (author: string) => {
    if (!selectedAuthors.includes(author)) {
      setSelectedAuthors((prev) => [...prev, author]);
    }
    setQuery('');
    setSuggestedAuthors([]);
  };

  const removeAuthor = (author: string) => {
    setSelectedAuthors(selectedAuthors.filter((a) => a !== author));
  };

  return (
    <div className="filter-section author-search">
      <div className="filter-section__authors">
        <h4>Select Authors</h4>
        <div className="selected-authors">
          {selectedAuthors.map((author) => (
            <span
              key={author}
              className="tag"
              onClick={() => removeAuthor(author)}
            >
              {author}
            </span>
          ))}
        </div>
      </div>
      <input
        type="text"
        placeholder="Type author names..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {suggestedAuthors.length > 0 && (
        <ul className="dropdown">
          {suggestedAuthors.map((author) => (
            <li key={author} onClick={() => addAuthor(author)}>
              {author}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuthorSearch;
