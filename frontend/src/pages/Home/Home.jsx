import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, LineChart, BrainCircuit, ShieldCheck } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="ds-hero-react">
        <h1 className="ds-hero-title-react">Stock Analysis & AI Prediction</h1>
        <p className="ds-hero-subtitle-react">
          India’s leading AI-powered stock forecasting platform. Screen companies, analyze histories,
          and leverage institutional-grade LSTM neural predictions to find your next big investment.
        </p>
        <div className="ds-cta-buttons-react">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Create free account</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Sign in</Link>
            </>
          )}
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="ds-features-react">
        <div className="ds-feature-card-react glass-panel">
          <div className="ds-feature-icon-react ic-blue">
            <BarChart3 size={24} />
          </div>
          <h3>Interactive Screener</h3>
          <p>Analyze technical closing timelines, adjust history views, and display candlestick charts.</p>
        </div>

        <div className="ds-feature-card-react glass-panel">
          <div className="ds-feature-icon-react ic-purple">
            <BrainCircuit size={24} />
          </div>
          <h3>AI Price Predictor</h3>
          <p>Generate precise short-term price forecast sequences leveraging optimized LSTM networks.</p>
        </div>

        <div className="ds-feature-card-react glass-panel">
          <div className="ds-feature-icon-react ic-pink">
            <LineChart size={24} />
          </div>
          <h3>Portfolio Analytics</h3>
          <p>Track weighted average investment returns and detailed profit summaries across holdings.</p>
        </div>

        <div className="ds-feature-card-react glass-panel">
          <div className="ds-feature-icon-react ic-green">
            <ShieldCheck size={24} />
          </div>
          <h3>Virtual Exchange</h3>
          <p>Practice trading on a high-fidelity gamified exchange with standard Indian and Global equities.</p>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="ds-cta-react glass-panel">
        <h2>Ready to get started?</h2>
        <p>Unlock high-accuracy machine learning predictions, visual history timelines, and virtual portfolios.</p>
        <div className="ds-cta-buttons-react cta-group-react">
          <Link to="/register" className="btn btn-primary">Get started free</Link>
          <Link to="/dashboard" className="btn btn-outline">Preview dashboard</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
