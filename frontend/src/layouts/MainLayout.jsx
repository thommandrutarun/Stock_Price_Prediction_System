import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MarketTicker from '../components/MarketTicker';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="app-container">
      {/* Skip to Content accessibility link */}
      <a href="#main-content" className="skip-link">Skip to Content</a>

      {/* Optimized Background Video */}
      <video className="bg-video" autoPlay muted loop playsInline preload="none">
        <source src="/assets/stock_price_prediction_system_for_a_web.mp4" type="video/mp4" />
      </video>

      {/* Navigation Header */}
      <Navbar />

      {/* Real-time Indices/Commodities Banner */}
      <MarketTicker />

      {/* Central Routing Panel */}
      <main id="main-content" className="content-wrapper" tabIndex="-1">
        <Outlet />
      </main>

      {/* Unified Brand Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
