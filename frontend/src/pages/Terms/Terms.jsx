import { ShieldAlert, Activity, Scale, Award, Info, HelpCircle } from 'lucide-react';
import SEO from '../../components/SEO';
import '../Home/Home.css';

const Terms = () => {
  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service - Stock Price Prediction System",
    "description": "Read DeepStock's terms of service. Guidelines on simulated trading, paper margins, virtual leverage thresholds, and liability disclaimers."
  };

  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      <SEO 
        title="Terms of Service & Simulator Rules"
        description="Review the terms governing DeepStock. Learn about simulated exchange limits, virtual leverage margins, user conduct rules, and financial advice exclusions."
        keywords="terms of service deepstock, virtual trading terms, paper margin regulations, simulated brokerage code, no investment advice"
        schema={termsSchema}
      />

      {/* HERO SECTION */}
      <section className="ds-hero-react" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <h1 className="ds-hero-title-react" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Terms of Service & Simulator Regulations
        </h1>
        <p className="ds-hero-subtitle-react" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          Please review the operational terms governing DeepStock. By accessing our screens, analyzing historical data, or running simulated trades, you agree to comply with these rules.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
          Last Updated: June 3, 2026
        </p>
      </section>

      {/* TERMS AGREEMENT */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scale className="text-primary" size={28} /> 1. Binding Agreement & License Scope
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          These Terms of Service ("Terms") represent a binding legal agreement between you as the user and DeepStock Analytics. By creating an account, authenticating a session, or utilizing the stock price screener and LSTM forecasting networks, you acknowledge that you have read, understood, and agreed to be bound by these clauses. If you are accessing this application on behalf of an academic institution, research group, or student body, you represent that you have the authority to accept these guidelines for that group.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          If you do not agree to these terms, you must not create an account or use our forecasting dashboards. We grant you a revocable, non-exclusive, non-transferable license to access our platform for educational, training, and academic research purposes. Commercial distribution of our LSTM output, scraping our endpoints for proprietary algorithms, or reverse engineering our prediction server configurations is strictly prohibited.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          We reserve the right to modify these Terms at any time without prior individual notice. Your continued use of the platform after updates are published constitutes acceptance of the new guidelines. We recommend reviewing this document periodically to stay informed of changes to virtual leverage parameters or compliance standards.
        </p>
      </section>

      {/* SIMULATED PLATFORM */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info className="text-purple" size={28} style={{ color: 'var(--accent-purple)' }} /> 2. Nature of the Simulated Paper Exchange
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          DeepStock is an educational time-series forecasting sandbox. The virtual exchange, simulated brokerage balances, and trading charts are gamified systems. Every asset, stock position, rupee balance, and order execution displayed in your dashboard is virtual and holds zero monetary value. We connect with standard public financial APIs to stream historic closing ticks; however, we do not promise real-time execution speeds. Pricing feeds may lag live market data due to API limits or server processing times.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          The digital capital allocated to your profile is simulated and cannot be withdrawn, transferred to bank accounts, or redeemed for physical currency. This environment is designed to help users study historical equity curves, practice basic trade execution strategies, and analyze neural network patterns.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          Any attempt to use simulated portfolios for commercial indicators, real wealth creation, or unauthorized advisory services violates our licensing agreement. We do not provide custody for real capital, and we accept no responsibility for user trading strategies applied to real-world brokerage environments.
        </p>
      </section>

      {/* MARGIN & LEVERAGE REGULATIONS */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity className="text-pink" size={28} style={{ color: 'var(--accent-pink)' }} /> 3. Paper Leverage & Virtual Margin Rules
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          To replicate the dynamics of professional trading environments, our simulator enforces margin and leverage rules. Users can buy simulated assets on leverage up to a maximum ratio of 1:5. While leverage increases potential simulated returns, it also amplifies simulated losses.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Leverage Cap</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              Virtual leverage is restricted to a maximum ratio of 5x. This limit is aligned with the margin rules of major exchanges to provide an authentic trading experience.
            </p>
          </div>
          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Margin Call Warning</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              If your account's equity falls below 40% of your open leveraged positions, a margin warning is flagged on the dashboard to prompt adjustment.
            </p>
          </div>
          <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>Simulated Liquidation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5' }}>
              If your equity falls below the 30% maintenance threshold, our engine triggers a simulated liquidation, closing out positions at current rates to prevent a simulated balance deficit.
            </p>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          These rules demonstrate the importance of risk management in trading. Users should monitor their margin levels closely to prevent automated liquidations. All simulated trades must respect the available virtual margin, and the system automatically rejects orders exceeding these parameters.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          By participating in the virtual simulator, you accept that virtual balances can fluctuate based on market movements. If your simulated account goes into a deficit, you can request a margin reset through our Contact page, allowing you to restart your training progress.
        </p>
      </section>

      {/* USER CONDUCT */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award className="text-green" size={28} style={{ color: 'var(--success)' }} /> 4. User Conduct & Platform Limitations
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Users must interact with DeepStock in an ethical manner. Actions that degrade platform performance or interfere with other users' experiences are prohibited. These restrictions include:
        </p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
          <li>
            <strong>API Abuse & Rate Limits:</strong> Enforcing rate-limiting policies to prevent automated scrapers from overwhelming our databases. API requests must use approved developer keys.
          </li>
          <li>
            <strong>Simulator Manipulation:</strong> Attempting to manipulate simulated prices or exploit lag to alter leaderboard rankings is prohibited.
          </li>
          <li>
            <strong>Reverse Engineering:</strong> Decompiling or reverse engineering our LSTM forecasting models or backend configurations violates our license terms.
          </li>
          <li>
            <strong>Account Integrity:</strong> Creating multiple accounts to bypass API quotas or spam the support helpdesk violates operational policies.
          </li>
        </ul>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          We monitor telemetry logs for patterns indicating automated abuse or script-based execution. Accounts violating these guidelines will be suspended or permanently deactivated.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          Additionally, users agree not to distribute offensive content in support tickets or community forums. We reserve the right to terminate access for users who exhibit abusive behavior toward our support operations or engineering staff.
        </p>
      </section>

      {/* EXCLUSION OF LIABILITY */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert className="text-danger" size={28} style={{ color: 'var(--error)' }} /> 5. Exclusion of Liability & Disclaimers
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          <strong>DEEPSTOCK ANALYTICS DOES NOT PROVIDE INVESTMENT ADVICE OR CERTIFIED FINANCIAL PLANNING SERVICES.</strong> The forecasting lines, historical indicators, search results, and portfolio telemetry are provided strictly for educational and training purposes.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          Stock markets involve high risk and volatility. Past performance is not a guarantee of future returns. DeepStock Analytics accepts no liability for financial losses, opportunity costs, or damages resulting from the use of our technical indicators. Users must conduct independent research or consult with a registered investment advisor before committing real capital to the financial markets.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          Our LSTM model predictions are technical metrics based on past pattern sequences. They should not be interpreted as certified broker recommendations. We do not guarantee the completeness, accuracy, or timeliness of our data feeds.
        </p>
      </section>

      {/* TERMS FAQ */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <HelpCircle size={28} style={{ color: 'var(--accent-pink)' }} />
          <h2 style={{ fontSize: '1.5rem' }}>Simulator & Terms FAQ</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Who is eligible to open an account?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Registration is open to all users who are at least 18 years of age. Accounts are intended for personal, non-commercial education and research.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Is leverage applied to all stock symbols?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Yes, leverage can be set up on major equities. High-volatility symbols may be subject to stricter margin maintenance requirements.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>How does simulated execution work?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Simulated orders use live stock pricing feeds and are subject to simulated brokerage costs and bid-ask spreads to model market conditions realistically.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Can I use custom API endpoints?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Yes. Researchers can request custom API keys for time-series analysis by contacting support with their project details.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>What happens if my account is suspended?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Suspended accounts lose access to the dashboard and portfolios. You can appeal suspensions by submitting a ticket on our Contact page.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>How do I report system bugs?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Please report platform bugs or data lag on our Contact page. Our operations team reviews tickets and updates the system regularly.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Are there data usage limits?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              To ensure platform stability, we enforce daily request limits on chart rendering and forecasting endpoints. Accounts exceeding these parameters will face rate limits.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Is student project integration allowed?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Yes, academic integration is allowed. Students can connect their research pipelines to our forecasting nodes for educational projects under academic licenses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
