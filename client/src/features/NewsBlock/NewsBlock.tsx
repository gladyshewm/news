import './NewsBlock.css';

const NewsBlock = () => {
  return (
    <div className="news-block">
      <div className="thumbnail">
        <img src="#" alt="thumbnail" />
      </div>
      <div className="news-block__content">
        <header>News title</header>
        <p>News content</p>
      </div>
    </div>
  );
};

export default NewsBlock;
