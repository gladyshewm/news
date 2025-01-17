import { useState } from 'react';
import { handleImageError, isImageLoaded } from '../../utils/isImageLoaded';
import './NewsBlock.css';
import { PhotoIcon } from '../../icons';
import { formatTopicDate } from '../../utils/formatDate';
import { Topic } from '../../types';

interface NewsBlockProps {
  topic: Topic;
}

const NewsBlock = ({ topic }: NewsBlockProps) => {
  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<string>>(
    new Set(),
  );

  return (
    <div className="news-block">
      <div className="thumbnail">
        {isImageLoaded(loadedThumbnails, topic.thumbnail) ? (
          <PhotoIcon />
        ) : (
          <img
            src={topic.thumbnail}
            alt="thumbnail"
            onError={() =>
              handleImageError(setLoadedThumbnails, topic.thumbnail)
            }
          />
        )}
      </div>
      <div className="news-block__content">
        <header>
          <div>{topic.publisher.name}</div>
          <span>•</span>
          <div>{topic.topicId}</div>
        </header>
        <div className="body">
          <p className="title">{topic.title}</p>
          <p className="brief">{topic.excerpt}</p>
        </div>
        <footer>
          <p>{formatTopicDate(topic.date)}</p>
          <a href={topic.url}>Read more</a>
        </footer>
      </div>
    </div>
  );
};

export default NewsBlock;
