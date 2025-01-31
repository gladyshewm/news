import { CATEGORIES } from '../../constants/category';
import Loader from '../../features/Loader/Loader';
import NewsBlock from '../../features/NewsBlock/NewsBlock';
import Pagination from '../../features/Pagination/Pagination';
import Select from '../../features/Select/Select';
import { searchService } from '../../services/searchService';
import { GetTrendingTopics, Topic } from '../../types';
import { formatTopic } from '../../utils/formatTopic';
import './NewsFilterPage.css';
import { useState } from 'react';

interface NewsFilterPageProps {
  selectedCategories: string[];
  setSelectedAuthors: React.Dispatch<React.SetStateAction<string[]>>;
  sortOption: string;
  setSortOption: React.Dispatch<React.SetStateAction<string>>;
  handleCategoryChange: (category: string) => void;
  handleSubmit: () => void;
}

const NewsFilterPageHeader = ({
  selectedCategories,
  setSelectedAuthors,
  sortOption,
  setSortOption,
  handleCategoryChange,
  handleSubmit,
}: NewsFilterPageProps) => {
  const SORT_OPTIONS = ['Date', 'Popularity'];

  return (
    <div className="news-filter-page__header">
      <h1>Filter News</h1>
      <div className="filter-section__top">
        <div className="filter-section">
          <h3>Select Categories</h3>
          <ul>
            {CATEGORIES.map((category) => (
              <li key={category}>
                <input
                  type="checkbox"
                  id={category}
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <label htmlFor={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="filter-section__bottom">
        <div className="filter-section">
          <h3>Select Authors</h3> {/* TODO:  */}
          <input
            type="text"
            placeholder="Type author names..."
            onChange={(e) => setSelectedAuthors(e.target.value.split(','))}
          />
        </div>

        <div className="filter-section">
          <h3>Sort By</h3>
          <Select
            options={SORT_OPTIONS}
            selectedOption={sortOption}
            setSelectedOption={setSortOption}
          />
        </div>
      </div>

      <button onClick={handleSubmit}>Apply Filters</button>
    </div>
  );
};

const NewsFilterPage = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('Date');
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;
  const MAX_PAGE_BUTTONS = 9;
  const totalPages = Math.ceil(topics.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTopics = topics.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleSubmit = () => {
    setIsLoading(true);

    const query: GetTrendingTopics = {
      language: 'en',
      topic: selectedCategories.map((c) => formatTopic(c)),
      publisher: selectedAuthors,
      page: 1,
      limit: 100,
      sort: sortOption.toLowerCase(),
    };

    searchService
      .getTrendingTopics(query)
      .then((data) => setTopics(data))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="news-filter-page">
      <NewsFilterPageHeader
        selectedCategories={selectedCategories}
        setSelectedAuthors={setSelectedAuthors}
        sortOption={sortOption}
        setSortOption={setSortOption}
        handleCategoryChange={handleCategoryChange}
        handleSubmit={handleSubmit}
      />
      <div className="news-list">
        {isLoading ? (
          <Loader />
        ) : (
          currentTopics.map((topic) => (
            <NewsBlock key={topic.id} topic={topic} />
          ))
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          maxPageButtons={MAX_PAGE_BUTTONS}
        />
      )}
    </div>
  );
};

export default NewsFilterPage;
