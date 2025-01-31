import { useParams } from 'react-router-dom';
import './TopicPage.css';
import { useEffect, useState } from 'react';
import { GetTrendingTopics, Topic } from '../../types';
import { searchService } from '../../services/searchService';
import Loader from '../../features/Loader/Loader';
import TrendingTopics from '../../widgets/TrendingTopics/TrendingTopics';
import { formatTopic } from '../../utils/formatTopic';
import LatestNews from '../../widgets/LatestNews/LatestNews';

const TopicPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { topic, language, country } = useParams<{
    topic: string;
    language: string;
    country?: string;
  }>();

  useEffect(() => {
    if (!topic || !language) return;
    const formattedTopic = formatTopic(topic);
    const query: GetTrendingTopics = {
      language,
      topic: [formattedTopic],
      page: 1,
      limit: 5,
      sort: 'date',
      country: country ?? undefined,
    };

    searchService
      .getTrendingTopics(query)
      .then((data) => setTopics(data))
      .finally(() => setIsLoading(false));
  }, [topic, language, country]);

  return (
    <main className="topic-page">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <TrendingTopics topics={topics} />
          <LatestNews limit={3} />
        </>
      )}
    </main>
  );
};

export default TopicPage;
