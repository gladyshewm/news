import { useState } from 'react';
import { ChevronLeftIcon, PhotoIcon } from '../../icons';
import { Topic } from '../../types';
import { formatTopicDate } from '../../utils/formatDate';
import './TrendingTopics.css';

interface TrendingTopicsProps {
  topics: Topic[];
}

const TrendingTopics = ({ topics }: TrendingTopicsProps) => {
  const [mainIndex, setMainIndex] = useState(0);
  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<string>>(
    new Set(),
  );
  const [loadedFavicons, setLoadedFavicons] = useState<Set<string>>(new Set());

  const mainTopic = topics[mainIndex];
  const otherTopics = topics.filter((_, idx) => idx !== mainIndex);

  const handlePrevious = () =>
    setMainIndex(
      (prevIndex) => (prevIndex - 1 + topics.length) % topics.length,
    );
  const handleNext = () =>
    setMainIndex((prevIndex) => (prevIndex + 1) % topics.length);

  const handleImageError = (
    setLoaded: React.Dispatch<React.SetStateAction<Set<string>>>,
    url: string,
  ) => {
    setLoaded((prev) => new Set([...prev, url]));
  };
  const isImageLoaded = (loaded: Set<string>, url: string) => loaded.has(url);

  return (
    <div className="trending-topics">
      <div className="main-topic">
        {isImageLoaded(loadedThumbnails, mainTopic.thumbnail) ? (
          <PhotoIcon />
        ) : (
          <img
            src={mainTopic.thumbnail}
            alt="thumbnail"
            onError={() =>
              handleImageError(setLoadedThumbnails, mainTopic.thumbnail)
            }
          />
        )}
        <div className="main-topic__content">
          <header>
            {isImageLoaded(loadedFavicons, mainTopic.publisher.favicon) ? (
              <PhotoIcon />
            ) : (
              <img
                src={mainTopic.publisher.favicon}
                alt="favicon"
                onError={() =>
                  handleImageError(
                    setLoadedFavicons,
                    mainTopic.publisher.favicon,
                  )
                }
              />
            )}
            <span>{mainTopic.publisher.name}</span>
          </header>
          <div className="content">
            <div className="title">
              <p>{mainTopic.title}</p>
            </div>
            <div className="excerpt">
              <p>{mainTopic.excerpt}</p>
              <a href={mainTopic.url}>Read more</a>
            </div>
          </div>
          <footer>
            <span>{formatTopicDate(mainTopic.date)}</span>
            <div className="main-topic__buttons">
              <button onClick={handlePrevious} disabled={topics.length <= 1}>
                <ChevronLeftIcon />
              </button>
              <button onClick={handleNext} disabled={topics.length <= 1}>
                <ChevronLeftIcon />
              </button>
            </div>
          </footer>
        </div>
      </div>
      <div className="topics-list">
        <ul>
          {otherTopics.map((topic) => (
            <li key={topic.id} onClick={() => window.open(topic.url)}>
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
              <div className="topic-content">
                <header>
                  {isImageLoaded(loadedFavicons, topic.publisher.favicon) ? (
                    <PhotoIcon />
                  ) : (
                    <img
                      src={topic.publisher.favicon}
                      alt="favicon"
                      onError={() =>
                        handleImageError(
                          setLoadedFavicons,
                          topic.publisher.favicon,
                        )
                      }
                    />
                  )}
                  <span>{topic.publisher.name}</span>
                </header>
                <div className="excerpt">
                  <p>{topic.title}</p>
                </div>
                <footer>
                  <span>{formatTopicDate(topic.date)}</span>
                </footer>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrendingTopics;
