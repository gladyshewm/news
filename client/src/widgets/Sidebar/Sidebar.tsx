import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { CATEGORIES, CATEGORY_CONFIG } from '../../constants/category';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>CATEGORIES</h2>
      <ul className="nav-links">
        <li key="news-filter">
          <NavLink
            to="en/news-filter" /* to="/${language}/news-filter" */
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            News Filter
          </NavLink>
        </li>
        {CATEGORIES.map((category) => {
          const { language, country } = CATEGORY_CONFIG[category] || {
            language: 'en',
          };
          const link = country
            ? `/${language}/${category}?country=${country}`
            : `/${language}/${category}`;

          return (
            <li key={category}>
              <NavLink
                to={link}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
