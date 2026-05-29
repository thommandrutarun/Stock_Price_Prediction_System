import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminLayout = () => {
  return (
    <div className="app-container admin-layout-wrap">
      {/* Background Video */}
      <video className="bg-video" autoPlay muted loop playsInline>
        <source src="/assets/stock_price_prediction_system_for_a_web (1).mp4" type="video/mp4" />
      </video>

      {/* Navigation Header */}
      <Navbar />

      {/* Central Routing Panel */}
      <main className="content-wrapper" style={{ marginTop: '20px' }}>
        <Outlet />
      </main>

      {/* Unified Brand Footer */}
      <Footer />
    </div>
  );
};

export default AdminLayout;
