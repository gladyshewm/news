import { NavLink } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <div className="header">
      <h1>GLOBAL TIMES</h1>
      <div className="caption">
        <NavLink to="/" className="caption__left">
          <span>BREAKING NEWS</span>
          <div>
            <span>Live Updates</span>
          </div>
          <span>TOP STORIES</span>
        </NavLink>
        <div className="caption__right">
          <div>
            <span>NEWS. INSIGHTS. ANALYSIS.</span>
            <span>exclusive report</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
