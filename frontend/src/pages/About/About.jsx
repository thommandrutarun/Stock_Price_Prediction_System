import { Cpu, BrainCircuit, Activity, LineChart, ShieldCheck, Award, HelpCircle, GraduationCap } from 'lucide-react';
import SEO from '../../components/SEO';
import '../Home/Home.css';

const About = () => {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "About Stock Analysis & AI Prediction - AI Stock Analytics & Predictions",
    "description": "Learn about Stock Analysis & AI Prediction's advanced LSTM neural network configurations, simulated broker mechanics, and India's leading AI financial forecasting platform."
  };

  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      <SEO 
        title="About Our AI Forecasting Platform"
        description="Discover the technology powering Stock Analysis & AI Prediction. Learn about our recurrent neural network architectures, LSTM hyperparameters, and simulated trading systems."
        keywords="about Stock Analysis & AI Prediction, LSTM stock prediction technology, quantitative finance AI, virtual share market india, neural network checkpoints"
        schema={aboutSchema}
      />

      {/* HERO SECTION */}
      <section className="ds-hero-react" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <h1 className="ds-hero-title-react" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          About Stock Analysis & AI Prediction Analytics
        </h1>
        <p className="ds-hero-subtitle-react" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          We bridge the gap between complex artificial intelligence research and retail trading education. Stock Analysis & AI Prediction provides quantitative price forecasting models alongside a high-fidelity virtual exchange, enabling risk-free training and deep temporal sequence analysis.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
          Last Updated: June 3, 2026
        </p>
      </section>

      {/* ORGANIZATIONAL MISSION */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award className="text-primary" size={28} /> Our Core Organizational Mission
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Stock Analysis & AI Prediction Analytics was founded with a singular, clear objective: to democratize quantitative financial modeling and make advanced sequential neural networks understandable for developers, students, and retail market participants. Historically, high-frequency forecasting algorithms and deep-learning trading systems have been the exclusive domain of institutional hedge funds and elite proprietary trading desks. These institutions possess the capital to recruit quantitative PhDs and maintain high-performance GPU server grids.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          We believe that financial literacy in the modern era must include technical literacy in machine learning. By creating an open, interactive platform that combines real-time Indian equities screening with daily-updated Long Short-Term Memory (LSTM) network forecasts, we offer users a practical sandbox to study temporal dynamics, evaluate model training checkpoints, and learn simulated portfolio management. We aim to inspire academic research and promote risk-free learning by removing real capital from the training equation.
        </p>
      </section>

      {/* TECHNICAL ARCHITECTURE */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
          <Cpu className="text-purple" size={32} style={{ color: 'var(--accent-purple)' }} />
          <h2 style={{ fontSize: '1.8rem' }}>LSTM Neural Network Architecture</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Predicting stock price movements requires modeling temporal dependencies across multiple scales. Unlike standard feedforward neural networks or convolutional architectures, which treat inputs as independent events, Recurrent Neural Networks (RNNs) introduce feedback loops that allow information to persist. However, standard RNNs suffer from vanishing and exploding gradient problems during backpropagation, rendering them unable to learn relationships spanning more than a few steps.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1.25rem' }}>
          Stock Analysis & AI Prediction addresses this limitation by deploying <strong>Long Short-Term Memory (LSTM)</strong> networks, a specialized RNN design first introduced by Hochreiter and Schmidhuber. Our core neural network models use stacked LSTM layers containing 50 memory cells each, accompanied by dropout layers configured to a rate of 0.2 to prevent overfitting on historical noise. The memory flow inside each cell is regulated by three distinct mathematical gates:
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>1. The Forget Gate</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Determines what percentage of the historical cell state should be discarded. It computes a sigmoid threshold based on the previous hidden layer state and the current input parameter, mapping inputs to a scale between 0 (forget) and 1 (keep).
            </p>
          </div>
          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>2. The Input Gate</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Decides what new sequence details should be written to the cell state. A sigmoid layer selects which values to update, while a tanh activation layer creates a vector of new candidate values, combining to form the new memory.
            </p>
          </div>
          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>3. The Output Gate</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Generates the next hidden state, which acts as the network's short-term memory block. It passes the updated cell state through a tanh function and scales it using a sigmoid activator, regulating the forecast value.
            </p>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          During training, historical closing data is normalized using MinMaxScaler to bound value parameters between 0 and 1, ensuring stable weights optimization. Our models are retrained daily at the close of active market trading, using the Adam optimization algorithm to minimize Mean Squared Error (MSE) loss functions. This pipeline ensures that our inference engine adapts to macro shifts and daily volatility patterns.
        </p>
      </section>

      {/* MODEL VALIDATION */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BrainCircuit className="text-pink" size={28} style={{ color: 'var(--accent-pink)' }} /> Quantitative Model Validation
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Predictive performance is continuously measured against out-of-sample data splits. Our quantitative engineering staff enforces strict backtesting validation, utilizing Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE) to gauge accuracy. If a specific equity model exhibits a sudden rise in validation loss, the training engine adjusts dropout rates, increases epoch iterations, or scales back the lookback window size to prevent model drift.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          It is critical to note that financial markets are highly dynamic systems influenced by non-technical variables, including corporate earnings releases, geopolitical developments, monetary policy modifications, and investor sentiment shifts. Because neural networks identify patterns in historical price curves, they cannot anticipate sudden external shocks. Thus, Stock Analysis & AI Prediction predictions are designed as indicators for time-series analysis study, rather than recommendations to execute real transactions.
        </p>
      </section>

      {/* VIRTUAL EXCHANGE MECHANICS */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck className="text-green" size={28} style={{ color: 'var(--success)' }} /> Virtual Simulator & Execution Mechanics
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          To allow users to test their mathematical insights and model analyses without financial exposure, Stock Analysis & AI Prediction incorporates a high-fidelity Paper Trading Simulator. Every registered user is allocated a virtual cash balance upon account creation. The simulator interfaces directly with live equity pricing feeds, enabling simulated market orders to execute close to actual trading parameters.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          To maintain realism, the execution engine simulates transaction costs, including brokerage fees and standard bid-ask spreads. This makes paper trading an authentic representation of live execution, highlighting the impact of transaction costs on overall returns. The simulator also features portfolio tracking modules, calculating weighted average buy prices, asset allocation percentages, and live profit-loss indicators for each holding.
        </p>
      </section>

      {/* ACADEMIC COLLABORATION */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GraduationCap className="text-primary" size={28} style={{ color: 'var(--primary)' }} /> Academic Partnerships & Open Science
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Stock Analysis & AI Prediction Analytics partners with universities, financial engineering labs, and computer science research groups around the world. We believe that public progress in machine learning requires open sharing of datasets and model checkpoints. We supply pre-processed historical price tensors and trained LSTM network weights (.h5 formats) to academic partners for educational, non-commercial purposes.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          If you are an academic advisor, quantitative researcher, or student organization working on time-series prediction models, you can apply for research sandbox access. Approved research teams receive priority access to our model inference nodes, enabling custom hyperparameter evaluations and detailed data exports. We actively support thesis research in mathematical finance and sequence modeling.
        </p>
      </section>

      {/* ABOUT FAQ */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <HelpCircle size={28} style={{ color: 'var(--accent-pink)' }} />
          <h2 style={{ fontSize: '1.5rem' }}>Technology FAQ & Platform Guidelines</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>How often are predictions updated?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Our background forecasting systems process equity price movements once daily, shortly after the market closing hours. The system updates feature arrays, retrains model layers using incremental epochs, and publishes updated forecast sequences for the next trading session.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Are the models 100% accurate?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              No. Stock markets are subject to chaotic systems, policy changes, and unexpected events. While LSTM models Excel at finding temporal structures in historical data, they cannot predict random external factors. Predictions should be evaluated as secondary technical indicators, not financial suggestions.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Which indicators are in the screener?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              The interactive screener streams raw pricing data and computes core indicators, including candlestick structures, historical moving averages, and support thresholds. Users can zoom in and inspect specific intervals to study consolidation phases before model-predicted breakouts.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Can I customize model properties?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              The public dashboard runs on a pre-optimized set of hyperparameters (stacked layers, lookback window size of 60 days, 0.2 dropout rate) to ensure latency and compute controls. Custom training models are available for academic institutions and researchers upon verification.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>What is the margin reset rate?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Simulated balances can be reset to default values at any time. Simply open a request ticket on the Contact page, and our administrative desk will restore your virtual cash configuration, allowing you to re-evaluate strategies from a clean slate.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Can I download the forecast datasets?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Yes. Registered users can request historical predictions in CSV format for academic research. Submit a ticket specifying the stock symbol, time window, and study goals, and our Tier 2 operations team will generate the data dump.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Do you charge for API keys?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              No. General access is entirely free. Academic research keys are issued without charge upon project validation. Enterprise support plans are evaluated on a case-by-case basis.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Are international stocks supported?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              We support a selection of global equities alongside core Indian listed corporations. You can search for international indices to test predictive models across different market structures.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
