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
import ProblemSolver from './pages/ProblemPage.jsx'
import Signal0 from './pages/Signal0.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx'
import PaymentFailurePage from './pages/PaymentFailurePage.jsx'
import TermsAndConditions from './pages/TermsConditions.jsx'
import FAQ from './pages/FaqPages.jsx'

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
        path: '/reset-password/:token',
        element: <ResetPassword />,
      },
      {
        path: '/profile/:userId',
        element: <Profile />,
      },
      {
        path: '/problems',
        element: <ProblemsPage />,
      },
      // {
      //   path: '/signal0',
      //   element: <Signal0 />,
      // },
      {
        path: '/problems/:id',
        element: <ProblemSolver />,
      },
       {
        path: '/terms-and-conditions',
        element: <TermsAndConditions />,
      },
       {
        path: '/faqPage',
        element: <FAQ />,
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
      // {
      //   path: '/dashboard',
      //   element: <AdminDashboard />,
      // },
      {
        path: '/premium-success/:session_id?',
        element: <PaymentSuccessPage />,
      },
        {
        path: '/premium-cancel',
        element: <PaymentFailurePage />,
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
