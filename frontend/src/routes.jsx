import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Dashboard layout-scoped components
import DashboardLayout from './layouts/DashboardLayout';
import Watchlist from './pages/Watchlist/Watchlist';
import AIPredictions from './pages/AIPredictions/AIPredictions';
import MarketInsights from './pages/MarketInsights/MarketInsights';
import NewsPage from './pages/News/NewsPage';
import SettingsPage from './pages/Settings/Settings';
import Help from './pages/Help/Help';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicy />,
      },
      {
        path: 'terms',
        element: <Terms />,
      },
      {
        path: '',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'trade',
            element: <Trade />,
          },
          {
            path: 'portfolio',
            element: <Portfolio />,
          },
          {
            path: 'watchlist',
            element: <Watchlist />,
          },
          {
            path: 'predictions',
            element: <AIPredictions />,
          },
          {
            path: 'insights',
            element: <MarketInsights />,
          },
          {
            path: 'news',
            element: <NewsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
          {
            path: 'help',
            element: <Help />,
          },
          {
            path: 'admin',
            element: (
              <AdminRoute>
                <Admin />
              </AdminRoute>
            ),
          },
        ]
      },
    ],
  },
  {
    path: '*',
    element: <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}><h2>404 Not Found</h2></div>,
  }
]);
