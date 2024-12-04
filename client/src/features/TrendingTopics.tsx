import { Topic } from '../types';
import './TrendingTopics.css';

interface TrendingTopicsProps {
  topics: Topic[];
}

const TrendingTopics = ({ topics }: TrendingTopicsProps) => {
  return (
    <div className="trending-topics">
      <h2>Trending Topics</h2>
      <ul>
        {topics.map((topic) => (
          <li key={topic.id}>{topic.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingTopics;
