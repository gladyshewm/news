import { useParams } from 'react-router-dom';
import './TopicPage.css';
import { useEffect, useState } from 'react';
import { SupportedTopics, Topic } from '../../types';
import { searchService } from '../../services/searchService';
import Loader from '../../components/Loader/Loader';
import TrendingTopics from '../../features/TrendingTopics/TrendingTopics';
import { formatTopic } from '../../utils/formatTopic';

const TopicPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { topic } = useParams<{ topic: SupportedTopics }>();

  useEffect(() => {
    if (topic) {
      const formattedTopic = formatTopic(topic);
      searchService
        .getTrendingTopics('en', formattedTopic, 1, 5, 'date')
        .then((data) => setTopics(data))
        .then(() => setIsLoading(false));
    }
  }, [topic]);

  return (
    <main className="topic-page">
      {isLoading ? <Loader /> : <TrendingTopics topics={topics} />}
    </main>
  );
};

export default TopicPage;
