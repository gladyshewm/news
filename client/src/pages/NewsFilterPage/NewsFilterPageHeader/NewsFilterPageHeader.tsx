import './NewsFilterPageHeader.css';
import { CATEGORIES } from '../../../constants/category';
import Select from '../../../features/Select/Select';
import AuthorSearch from './AuthorSearch/AuthorSearch';

interface NewsFilterPageProps {
  selectedCategories: string[];
  selectedAuthors: string[];
  setSelectedAuthors: React.Dispatch<React.SetStateAction<string[]>>;
  sortOption: string;
  setSortOption: React.Dispatch<React.SetStateAction<string>>;
  handleCategoryChange: (category: string) => void;
  handleSubmit: () => void;
}

const NewsFilterPageHeader = ({
  selectedCategories,
  selectedAuthors,
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
          <ul className="filter-section__categories">
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
        <AuthorSearch
          selectedAuthors={selectedAuthors}
          setSelectedAuthors={setSelectedAuthors}
        />

        <div className="filter-section">
          <h3>Sort By</h3>
          <Select
            options={SORT_OPTIONS}
            selectedOption={sortOption}
            setSelectedOption={setSortOption}
          />
        </div>
      </div>

      <button className="apply-filters" onClick={handleSubmit}>
        Apply Filters
      </button>
    </div>
  );
};

export default NewsFilterPageHeader;
