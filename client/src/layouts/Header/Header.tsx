import { MagnifyingGlassIcon } from '../../icons';
import './Header.css';

const Header = () => {
  return (
    <header className="main-header">
      <h1>News App</h1>
      <ul className="nav-links">
        <li>Russia</li>
        <li>World</li>
        <li>Politics</li>
        <li>Business</li>
        <li>Entertainment</li>
        <li>Health</li>
        <li>Sport</li>
      </ul>
      <div className="search">
        <MagnifyingGlassIcon />
      </div>
    </header>
  );
};

export default Header;
