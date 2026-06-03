import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, LineChart, BrainCircuit, ShieldCheck, Cpu, Database, Award, ArrowUpRight, CheckCircle2, AlertTriangle, HelpCircle, Activity } from 'lucide-react';
import SEO from '../../components/SEO';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  // JSON-LD Structured Data Schema for Search Engines
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Stock Price Prediction System",
    "operatingSystem": "All",
    "applicationCategory": "FinanceApplication",
    "description": "AI-powered stock forecasting platform leveraging optimized LSTM neural networks for technical analysis and virtual trading simulation.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeepStock Analytics",
      "logo": "https://stockpredict.ai/favicon.svg"
    }
  };

  return (
    <div className="home-container">
      {/* Dynamic SEO Injector */}
      <SEO 
        title="Stock Analysis & AI Prediction" 
        description="India's leading AI-powered stock forecasting platform. Screen equities, view live technical timelines, and generate predictive price sequences with optimized LSTM neural networks."
        keywords="stock price prediction, AI trading floor, share market LSTM neural networks, virtual stock exchange, Indian equities screener, portfolio tracker"
        schema={homeSchema}
      />

      {/* HERO SECTION */}
      <section className="ds-hero-react">
        <h1 className="ds-hero-title-react">Stock Analysis & AI Prediction</h1>
        <p className="ds-hero-subtitle-react">
          India’s leading AI-powered stock forecasting platform. Screen companies, analyze histories,
          and leverage institutional-grade LSTM neural predictions to find your next big investment.
        </p>
        <div className="ds-cta-buttons-react">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg">Go to Dashboard <ArrowUpRight size={18} /></Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">Create free account <ArrowUpRight size={18} /></Link>
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
          <p>Analyze technical closing timelines, adjust history views, and display candlestick charts with precision indicators.</p>
        </div>

        <div className="ds-feature-card-react glass-panel">
          <div className="ds-feature-icon-react ic-purple">
            <BrainCircuit size={24} />
          </div>
          <h3>AI Price Predictor</h3>
          <p>Generate precise short-term price forecast sequences leveraging optimized LSTM networks trained on decades of historic market ticks.</p>
        </div>

        <div className="ds-feature-card-react glass-panel">
          <div className="ds-feature-icon-react ic-pink">
            <LineChart size={24} />
          </div>
          <h3>Portfolio Analytics</h3>
          <p>Track weighted average investment returns, visualize capital allocations, and monitor profit summaries across holdings.</p>
        </div>

        <div className="ds-feature-card-react glass-panel">
          <div className="ds-feature-icon-react ic-green">
            <ShieldCheck size={24} />
          </div>
          <h3>Virtual Exchange</h3>
          <p>Practice trading on a high-fidelity gamified exchange with standard Indian and Global equities using virtual capital.</p>
        </div>
      </section>

      {/* DEEP TECHNICAL GUIDE (LSTM NEURAL NETWORKS) - Content Expansion */}
      <section className="home-technical-guide glass-panel" style={{ marginTop: '2.5rem', padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
          <Cpu className="text-primary" size={32} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.8rem' }}>LSTM Neural Networks in Financial Modeling</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Predicting equity price movement is one of the most complex challenges in mathematical finance due to the non-linear, chaotic nature of stock market dynamics. Traditional statistics, such as autoregressive moving averages (ARIMA) or linear regressions, often fail because they assume stationary relationships and fail to remember long-term temporal dependencies.
        </p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Our platform addresses this limitation by deploying <strong>Long Short-Term Memory (LSTM)</strong> networks, a specialized category of Recurrent Neural Networks (RNNs). LSTMs are uniquely capable of learning sequence dependencies over long periods. In an LSTM cell, special gates (the forget gate, the input gate, and the output gate) regulate the flow of information. These gates allow the model to retain historical context (such as a multi-week momentum build-up or key support levels) while discarding short-term noise and outliers.
        </p>
        
        <h3 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: 'var(--accent-pink)' }} /> Mathematical Structure of LSTM Cell Gates
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          An LSTM cell preserves its state through mathematical equations that manage information update sequences. The cell state acts as a conveyor belt, carrying relevant info through the processing chain. First, the <strong>Forget Gate</strong> decides what information from the previous hidden state and the current input should be thrown away, utilizing a sigmoid activation function that scales values between 0 (completely forget) and 1 (completely keep).
        </p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Second, the <strong>Input Gate</strong> determines what new information to store in the cell state. This involves a sigmoid layer to decide which values to update, and a tanh layer to create a vector of new candidate values. These values are combined to compute the new cell state. Finally, the <strong>Output Gate</strong> determines the next hidden state. The output is based on the cell state, passed through a tanh activation and multiplied by the sigmoid output of the gate, regulating the sequence trajectory of predicted stock prices.
        </p>
        
        <h3 style={{ fontSize: '1.25rem', marginTop: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} style={{ color: 'var(--accent-purple)' }} /> How the AI Prediction Pipeline Works
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Our forecasting pipeline goes through several rigorous phases to generate the predictions shown on your dashboard:
        </p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>
            <strong>Data Preprocessing:</strong> Historical asset prices (Open, High, Low, Close, and Volume) are fetched and cleaned. Outliers resulting from corporate actions like splits or bonus issuances are normalized.
          </li>
          <li>
            <strong>Feature Engineering & Scaling:</strong> Features are normalized using MinMaxScaler to scale value bounds between 0 and 1. This prevents variables with larger magnitudes from dominating the network weights.
          </li>
          <li>
            <strong>Sequence Creation:</strong> The historical matrix is restructured into 3D tensors representing sliding windows (e.g., using the past 60 trading days to predict the next day's close).
          </li>
          <li>
            <strong>Neural Inference:</strong> The LSTM architecture consists of stacked recurrent layers, dropout regularization to prevent overfitting, and a dense output layer. It outputs a relative forecast trajectory.
          </li>
          <li>
            <strong>Inverse Scaling:</strong> The normalized tensor outputs are transformed back into absolute rupee values, matching current trading limits.
          </li>
        </ul>

        <div className="alert-box-info" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid var(--border-glass)', padding: '1.25rem', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Award size={24} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>High-Accuracy Sequential Memory</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              By looking at historical price actions as sequences rather than individual independent events, the LSTM model identifies cyclical patterns, support test sequences, and moving average crossovers that are invisible to standard analysis tools.
            </p>
          </div>
        </div>
      </section>

      {/* DETAILED FAQ SECTION - SEO Content Booster */}
      <section className="home-faq-section glass-panel" style={{ marginTop: '2.5rem', padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <HelpCircle className="text-pink" size={32} style={{ color: 'var(--accent-pink)' }} />
          <h2 style={{ fontSize: '1.8rem' }}>Frequently Asked Questions (FAQ)</h2>
        </div>
        
        <div className="faq-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="faq-item" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>1. What is the Stock Price Prediction System?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              The Stock Price Prediction System is an advanced financial analytics platform that combines real-time equity market data with modern machine learning models. Users can screen historical performance, track virtual portfolios, execute simulated trades, and view short-term future price trends generated by recurrent neural network (LSTM) architectures.
            </p>
          </div>

          <div className="faq-item" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>2. How accurate are the AI price predictions?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              While LSTM models are highly proficient at mapping sequence relationships and capturing historical trends, financial markets are influenced by unexpected events, earnings results, political announcements, and macroeconomic shifts. Therefore, our model's predictions should be treated as technical indicators based on past patterns, not as guaranteed financial advice or concrete trade recommendations.
            </p>
          </div>

          <div className="faq-item" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>3. Which stock markets are supported by the platform?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              We support a wide array of equity markets, focusing on major Indian listed corporations (National Stock Exchange - NSE) and key global indices. You can type symbols such as RELIANCE, TCS, INFYS, HDFCBANK, or AAPL into the screener on the main dashboard to immediately load charts and prediction arrays.
            </p>
          </div>

          <div className="faq-item" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>4. Do I need real capital to use the virtual exchange?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              No, the Virtual Exchange is completely gamified and designed to support risk-free learning. Every registered user receives a default allocation of simulated virtual cash when creating an account. You can use this balance to execute buy and sell orders, test trading strategies, and track simulated profits without exposing yourself to financial losses.
            </p>
          </div>

          <div className="faq-item" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>5. How does the technical screener generate candlestick charts?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Our platform connects directly with reliable financial APIs to stream open, high, low, and close parameters. These parameters are rendered dynamically using React ApexCharts. Users can switch between timeframe scales, zoom in to examine intraday fluctuations, and see how historical consolidation phases precede model predicted breakouts.
            </p>
          </div>

          <div className="faq-item" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>6. How often is the AI model updated and retrained?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Our systems pull closing data at the end of every active trading day. The background neural servers automatically update the feature arrays and run incremental training iterations (epochs) to adjust weighting parameters to reflect the latest market trends, ensuring tomorrow's predictions incorporate today's price movements.
            </p>
          </div>

          <div className="faq-item" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>7. Can I customize the hyperparameters of the neural networks?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Currently, the public dashboard uses a pre-configured, optimized set of hyperparameters (such as a 60-day window size, 2 stacked LSTM layers with 50 units each, a 0.2 dropout rate, and Adam optimizer) to ensure stability and latency control. Advanced enterprise users can contact our helpdesk to request custom sandboxes where learning rates, batch sizes, and neural layer configurations can be adjusted.
            </p>
          </div>
        </div>
      </section>

      {/* PLATFORM VOLATILITY & RISK DISCLAIMER */}
      <section className="home-disclaimer glass-panel" style={{ marginTop: '2.5rem', padding: '2rem', borderLeft: '4px solid var(--error)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
          <AlertTriangle className="text-danger" size={24} style={{ color: 'var(--error)' }} />
          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Regulatory Compliance & Risk Disclosure</h4>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
          Simulated trading, historical screening, and machine learning price predictions are provided strictly for educational and training purposes. All trades executed on the virtual exchange utilize fake digital balances and do not represent actual market positions or cash transactions. Past performance is not a guarantee of future returns. Stock markets are subject to high volatility and risk. DeepStock Analytics does not provide certified financial planning, brokerage services, or investment advice. Users must conduct independent research or consult with a registered investment advisor before committing real capital to the financial markets.
        </p>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="ds-cta-react glass-panel" style={{ marginTop: '2.5rem' }}>
        <h2>Ready to get started?</h2>
        <p>Unlock high-accuracy machine learning predictions, visual history timelines, and virtual portfolios.</p>
        <div className="ds-cta-buttons-react cta-group-react">
          <Link to="/register" className="btn btn-primary">Get started free <CheckCircle2 size={16} /></Link>
          <Link to="/dashboard" className="btn btn-outline">Preview dashboard</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
