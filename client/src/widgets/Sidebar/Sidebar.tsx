import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const CATEGORIES = [
    'russia',
    'world',
    'politics',
    'business',
    'entertainment',
    'health',
    'sports',
  ];

  return (
    <div className="sidebar">
      <h2>CATEGORIES</h2>
      <ul className="nav-links">
        {CATEGORIES.map((category) => (
          <li key={category}>
            <NavLink
              to={`/${category}`}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </NavLink>
          </li>
        ))}
      </ul>
      {/* <div className="search">
        <MagnifyingGlassIcon />
      </div> */}
    </div>
  );
};

export default Sidebar;
