import Loader from '../../features/Loader/Loader';
import NewsBlock from '../../features/NewsBlock/NewsBlock';
import Pagination from '../../features/Pagination/Pagination';
import { searchService } from '../../services/searchService';
import { GetTrendingTopics, Topic } from '../../types';
import { formatTopic } from '../../utils/formatTopic';
import './NewsFilterPage.css';
import { useState } from 'react';
import NewsFilterPageHeader from './NewsFilterPageHeader/NewsFilterPageHeader';

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
        selectedAuthors={selectedAuthors}
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
