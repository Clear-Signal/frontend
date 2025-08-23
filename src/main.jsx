import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home.jsx'
import PageNotFound from './pages/PageNotFound.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Profile from './pages/Profile.jsx'
import ProblemsPage from './pages/Problems.jsx'
import SubscriptionPage from './pages/Subscription.jsx'
import LeaderboardPage from './pages/Leaderboard.jsx'
import CollectionsPage from './pages/Collections.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/sign-in',
        element: <AuthPage />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/problems',
        element: <ProblemsPage />,
      },
      {
        path: '/subscription',
        element: <SubscriptionPage />,
      },
      {
        path: '/leaderboard',
        element: <LeaderboardPage />,
      },
      {
        path: '/collections',
        element: <CollectionsPage />,
      },
      {
        path: '*',
        element: <PageNotFound />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
