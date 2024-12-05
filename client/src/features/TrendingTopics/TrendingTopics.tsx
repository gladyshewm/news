import { ChevronLeftIcon } from '../../icons';
import { Topic } from '../../types';
import { formatTopicDate } from '../../utils/formatDate';
import './TrendingTopics.css';

interface TrendingTopicsProps {
  topics: Topic[];
}

const TrendingTopics = ({ topics }: TrendingTopicsProps) => {
  const mainTopic = topics[0];
  const otherTopics = topics.slice(1);

  return (
    <div className="trending-topics">
      <div className="main-topic">
        <img src={mainTopic.thumbnail} alt="thumbnail" />
        <div className="main-topic__content">
          <header>
            <img src={mainTopic.publisher.favicon} alt="favicon" />
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
              <button disabled>
                <ChevronLeftIcon />
              </button>
              <button>
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
              <img src={topic.thumbnail} alt="thumbnail" />
              <div className="topic-content">
                <header>
                  <img src={topic.publisher.favicon} alt="favicon" />
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
