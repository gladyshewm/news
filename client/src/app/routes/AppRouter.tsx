import {
  createBrowserRouter,
  Navigate,
  RouteObject,
  RouterProvider,
} from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import AppLayout from '../../layouts/AppLayout/AppLayout';

const AppRouter = () => {
  const routes: RouteObject[] = [
    {
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" />,
    },
  ];
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router} />;
};

export default AppRouter;
