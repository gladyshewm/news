import {
  createBrowserRouter,
  Navigate,
  RouteObject,
  RouterProvider,
} from 'react-router-dom';
import HomePage from '../../pages/HomePage/HomePage';
import TopicPage from '../../pages/TopicPage/TopicPage';
import AppLayout from '../../layouts/AppLayout/AppLayout';
import LatestNewsPage from '../../pages/LatestNewsPage/LatestNewsPage';
import FrequentlyReadTopicsPage from '../../pages/FrequentlyReadTopicsPage/FrequentlyReadTopicsPage';
import TopAuthorsPage from '../../pages/TopAuthorsPage/TopAuthorsPage';

const AppRouter = () => {
  const routes: RouteObject[] = [
    {
      element: <AppLayout />,
      children: [
        {
          path: ':language/general',
          element: <HomePage />,
        },
        {
          path: ':language/:topic',
          element: <TopicPage />,
        },
        {
          path: ':language/:topic/latest-news',
          element: <LatestNewsPage />,
        },
        {
          path: ':language/:topic/frequently-read',
          element: <FrequentlyReadTopicsPage />,
        },
        {
          path: ':language/top-authors',
          element: <TopAuthorsPage />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/en/general" />,
    },
  ];
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default AppRouter;
