import { SetStateAction, useState } from 'react';
import './TrendingTopics.css';
import { ChevronLeftIcon, PhotoIcon } from '../../icons';
import { Topic } from '../../types';
import { formatTopicDate } from '../../utils/formatDate';
import { handleImageError, isImageLoaded } from '../../utils/isImageLoaded';

interface MainTopicProps {
  topics: Topic[];
  mainIndex: number;
  setMainIndex: React.Dispatch<React.SetStateAction<number>>;
  loadedThumbnails: Set<string>;
  setLoadedThumbnails: React.Dispatch<SetStateAction<Set<string>>>;
  loadedFavicons: Set<string>;
  setLoadedFavicons: React.Dispatch<SetStateAction<Set<string>>>;
}

const MainTopic = ({
  topics,
  mainIndex,
  setMainIndex,
  loadedThumbnails,
  setLoadedThumbnails,
  loadedFavicons,
  setLoadedFavicons,
}: MainTopicProps) => {
  const mainTopic = topics[mainIndex];

  const handlePrevious = () =>
    setMainIndex(
      (prevIndex) => (prevIndex - 1 + topics.length) % topics.length,
    );
  const handleNext = () =>
    setMainIndex((prevIndex) => (prevIndex + 1) % topics.length);

  return (
    <div className="main-topic">
      <div className="main-topic__thumbnail">
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
        <div className="main-topic__overlay">
          <h2>
            TOP STORY <span>{formatTopicDate(mainTopic.date)}</span>
          </h2>
          <div className="main-topic__title">
            <p>{mainTopic.title}</p>
          </div>
          <div className="main-topic__publisher">
            <span>{mainTopic.publisher.name.toUpperCase()}</span>
          </div>
          <div className="main-topic__buttons">
            <button onClick={handlePrevious} disabled={topics.length <= 1}>
              <ChevronLeftIcon />
            </button>
            <button onClick={handleNext} disabled={topics.length <= 1}>
              <ChevronLeftIcon />
            </button>
          </div>
        </div>
      </div>
      <div className="main-topic__content">
        <p>{mainTopic.excerpt}</p>
        <a href={mainTopic.url}>Read more</a>
      </div>
    </div>
  );
};

interface TrendingTopicsProps {
  topics: Topic[];
}

const TrendingTopics = ({ topics }: TrendingTopicsProps) => {
  const [mainIndex, setMainIndex] = useState(0);
  // const otherTopics = topics.filter((_, idx) => idx !== mainIndex);

  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<string>>(
    new Set(),
  );
  const [loadedFavicons, setLoadedFavicons] = useState<Set<string>>(new Set());

  return (
    <div className="trending-topics">
      {topics.length === 0 ? (
        <div className="loader">No results</div>
      ) : (
        <>
          <MainTopic
            topics={topics}
            mainIndex={mainIndex}
            setMainIndex={setMainIndex}
            loadedThumbnails={loadedThumbnails}
            setLoadedThumbnails={setLoadedThumbnails}
            loadedFavicons={loadedFavicons}
            setLoadedFavicons={setLoadedFavicons}
          />
        </>
      )}
    </div>
  );
};

export default TrendingTopics;
