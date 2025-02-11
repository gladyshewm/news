import { useState } from 'react';
import { handleImageError, isImageLoaded } from '../../utils/isImageLoaded';
import './NewsBlock.css';
import { PhotoIcon } from '../../icons';
import { formatTopicDate } from '../../utils/formatDate';
import { Topic } from '../../types';
import { searchService } from '../../services/searchService';
import TopicModal from '../TopicModal/TopicModal';

interface NewsBlockProps {
  topic: Topic;
  extraHeaderContent?: React.ReactNode;
}

const NewsBlock = ({ topic, extraHeaderContent }: NewsBlockProps) => {
  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<string>>(
    new Set(),
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await searchService.registerClick(topic.id);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="news-block" onClick={handleOpenModal}>
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
          {isImageLoaded(loadedThumbnails, topic.publisher.favicon) ? (
            <PhotoIcon />
          ) : (
            <img
              src={topic.publisher.favicon}
              alt="favicon"
              onError={() =>
                handleImageError(setLoadedThumbnails, topic.publisher.favicon)
              }
            />
          )}
          <div>
            <abbr title={topic.publisher.name}>{topic.publisher.name}</abbr>
          </div>
          <span>•</span>
          <div>{topic.topicId}</div>
          {extraHeaderContent && (
            <div className="extra-content">{extraHeaderContent}</div>
          )}
        </header>
        <div className="body">
          <abbr title={topic.title}>
            <p className="title">{topic.title}</p>
          </abbr>
          <p className="brief">{topic.excerpt}</p>
        </div>
        <footer>
          <p>{formatTopicDate(topic.date)}</p>
          <a
            href={topic.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleClick(e)}
          >
            Read more
          </a>
        </footer>
      </div>
      {isModalOpen && (
        <TopicModal topic={topic} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default NewsBlock;
