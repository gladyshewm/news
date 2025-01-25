import './TopicModal.css';
import { Topic } from '../../types';
import { formatTopicDate } from '../../utils/formatDate';
import { useState } from 'react';
import { handleImageError, isImageLoaded } from '../../utils/isImageLoaded';
import { PhotoIcon } from '../../icons';

interface TopicModalProps {
  topic: Topic;
  onClose: () => void;
}

const TopicModal = ({ topic, onClose }: TopicModalProps) => {
  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<string>>(
    new Set(),
  );
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
  };

  return (
    <div
      className={`modal-overlay ${isClosing ? 'fade-out' : 'fade-in'}`}
      onClick={handleClose}
      onAnimationEnd={() => {
        if (isClosing) {
          onClose();
        }
      }}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-thumbnail">
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
        <div className="modal-body">
          <div className="modal-publisher">
            <button className="modal-close" onClick={handleClose}>
              Back
            </button>
            {isImageLoaded(loadedThumbnails, topic.publisher.favicon) ? (
              <div className="modal-stub">
                <PhotoIcon />
              </div>
            ) : (
              <img
                src={topic.publisher.favicon}
                alt={topic.publisher.name}
                onError={() =>
                  handleImageError(setLoadedThumbnails, topic.publisher.favicon)
                }
              />
            )}
            <abbr title={topic.publisher.name}>
              <a
                href={topic.publisher.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {topic.publisher.name}
              </a>
            </abbr>
          </div>
          <main>
            <h2>{topic.title}</h2>
            <p>{topic.excerpt}</p>
          </main>
          <footer>
            <span>{formatTopicDate(topic.date)}</span>
            <a
              href={topic.url}
              target="_blank"
              rel="noopener noreferrer"
              className="read-full-article-link"
            >
              Read full article
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TopicModal;
