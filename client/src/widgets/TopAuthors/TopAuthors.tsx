import { Link } from 'react-router-dom';
import './TopAuthors.css';

const TopAuthors = () => {
  return (
    <div className="top-authors">
      <header>
        <h2>Top Authors</h2>
        <Link to={`#`}>See all</Link>
      </header>
      <div className="content">News Block</div>
    </div>
  );
};

export default TopAuthors;
