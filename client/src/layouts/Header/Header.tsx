import { NavLink } from 'react-router-dom';
import { MagnifyingGlassIcon } from '../../icons';
import './Header.css';

const Header = () => {
  const CATEGORIES = [
    'russia',
    'world',
    'politics',
    'business',
    'entertainment',
    'health',
    'sport',
  ];

  return (
    <header className="main-header">
      <NavLink to="/" className="logo">
        News App
      </NavLink>
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
      <div className="search">
        <MagnifyingGlassIcon />
      </div>
    </header>
  );
};

export default Header;
