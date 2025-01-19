import { useParams } from 'react-router-dom';
import './TopicPage.css';
import { useEffect, useState } from 'react';
import { Topic } from '../../types';
import { searchService } from '../../services/searchService';
import Loader from '../../components/Loader/Loader';
import TrendingTopics from '../../widgets/TrendingTopics/TrendingTopics';
import { formatTopic } from '../../utils/formatTopic';
import LatestNews from '../../widgets/LatestNews/LatestNews';

const TopicPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [latestNews, setLatestNews] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { topic, language, country } = useParams<{
    topic: string;
    language: string;
    country?: string;
  }>();

  useEffect(() => {
    if (!topic || !language) return;
    const formattedTopic = formatTopic(topic);

    searchService
      .getTrendingTopics(
        language,
        formattedTopic,
        1,
        5,
        'date',
        country ?? undefined,
      )
      .then((data) => setTopics(data));

    searchService
      .getLatestNews(language, 3, formattedTopic)
      .then((data) => setLatestNews(data))
      .finally(() => setIsLoading(false));
  }, [topic, language, country]);

  return (
    <main className="topic-page">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <TrendingTopics topics={topics} />
          <LatestNews latestNews={latestNews} />
        </>
      )}
    </main>
  );
};

export default TopicPage;
