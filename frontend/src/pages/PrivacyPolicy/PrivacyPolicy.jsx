import { ShieldAlert, KeyRound, Database, FileCheck, CheckCircle2, HelpCircle, Network } from 'lucide-react';
import SEO from '../../components/SEO';
import '../Home/Home.css';

const PrivacyPolicy = () => {
  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - Stock Price Prediction System",
    "description": "Read DeepStock's privacy policy. Learn about our TLS encryption, JWT token management, session storage configuration, and data protection compliance."
  };

  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
      <SEO 
        title="Privacy Policy & Encryption Standards"
        description="Learn how DeepStock secures your personal credentials and trading simulation histories. Detailed information on TLS, JWT session structures, and GDPR rights."
        keywords="privacy policy deepstock, secure JWT storage, TLS 1.3 encryption, right to erasure, data protection simulation"
        schema={privacySchema}
      />

      {/* HERO SECTION */}
      <section className="ds-hero-react" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <h1 className="ds-hero-title-react" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Privacy Policy & Security Standards
        </h1>
        <p className="ds-hero-subtitle-react" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-secondary)' }}>
          At DeepStock Analytics, we treat privacy and system security as foundational values. This document details our cryptographic policies, data collection limits, token lifecycles, and your privacy rights.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
          Last Updated: June 3, 2026
        </p>
      </section>

      {/* PRIVACY OVERVIEW */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert className="text-primary" size={28} /> 1. Data Protection Overview
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          This Privacy Policy governs the collection, processing, transmission, and storage of user information on the DeepStock Analytics Stock Price Prediction platform. As a simulated virtual exchange and machine learning education interface, we do not handle live bank deposits, credit card payments, or authentic securities transactions. However, because we verify user identities and store simulated portfolios, we maintain security standards equivalent to professional commercial interfaces.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          Our primary security philosophy is one of data minimization. We collect only the information necessary to maintain a secure terminal session, prevent registration spam, and segment our system diagnostic logs. We never sell, lease, or distribute your email addresses, phone records, or virtual trading ledger data to third-party marketing firms or advertising networks. All data is processed using encrypted connections, protecting your inputs against interception.
        </p>
      </section>

      {/* TYPES OF DATA COLLECTED */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Database className="text-purple" size={28} style={{ color: 'var(--accent-purple)' }} /> 2. Information We Collect
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          To support account authentication, screener usage, and virtual portfolio updates, the platform records several categories of parameters:
        </p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
          <li>
            <strong>Registration Identifiers:</strong> Your full name, verified email address, optional contact number, date of birth, and professional category. These inputs validate unique account creations and prevent bot registration loops.
          </li>
          <li>
            <strong>Simulated Transaction Ledgers:</strong> Record details of paper orders executed on the virtual exchange, including symbol names, transaction types (buy/sell), volumes, transaction timestamps, and portfolio calculations.
          </li>
          <li>
            <strong>Web Server Audit Metrics:</strong> Client IP addresses, browser user-agents, active operating system versions, and page request timestamps are recorded in telemetry logs to monitor API performance and troubleshoot connection issues.
          </li>
        </ul>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          We do not require, collect, or store any sensitive financial credentials, credit card details, demat accounts, or bank routing numbers. Any email or system communication requesting such inputs should be treated as unauthorized phishing; please report it to our security desk immediately.
        </p>
      </section>

      {/* CRYPTOGRAPHIC ARCHITECTURES */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <KeyRound className="text-pink" size={28} style={{ color: 'var(--accent-pink)' }} /> 3. Cryptographic Protections & TLS Encryption
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          All communications between your browser client and our backend API gateways are fully encrypted using Transport Layer Security (TLS 1.3), which enforces modern cipher suites to prevent network eavesdropping. Passwords submitted during registration or recovery are processed using one-way cryptographic hashing (bcrypt) combined with randomized salt inputs. Our databases do not store plain-text passwords, protecting credentials even in the event of an infrastructure breach.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          Furthermore, our servers deploy HTTP Strict Transport Security (HSTS) headers, which mandate that client browsers connect only over secure HTTPS, preventing downgrade attacks. Background database operations utilize AES-256 standards to encrypt persistent records at rest, keeping user profiles and historical ledgers highly secure.
        </p>
      </section>

      {/* JWT & TOKEN SECURITY */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileCheck className="text-green" size={28} style={{ color: 'var(--success)' }} /> 4. JSON Web Token (JWT) Lifecycle & Storage Choice
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          DeepStock validates sessions using stateless JSON Web Tokens (JWTs). Once you submit valid credentials, the authorization server issues a signed cryptotoken containing a unique user key and expiration timestamp. This token must accompany every subsequent API request, validating your session limits.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          To prevent Cross-Site Scripting (XSS) extractions, session tokens can be stored in browser sessionStorage. Because sessionStorage is bound to the lifespan of the active tab, it is destroyed the moment the window is closed, preventing session hijacking on shared or public computers.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          Additionally, our servers employ strict rate limiting against brute force attempts, enforcing temporary IP blocks after repeated verification failures. Clicking "Log Out" immediately revokes the JWT session marker on our authorization servers, preventing token reuse.
        </p>
      </section>

      {/* THIRD-PARTY INTEGRATIONS */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network className="text-primary" size={28} style={{ color: 'var(--primary)' }} /> 5. Third-Party Integrations & Data Streams
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          DeepStock streams equity metrics and candlestick historical records from external public financial API providers. When requesting price parameters, we transmit only public stock symbols and lookback interval indices. We never transmit user identifiers, email addresses, or virtual portfolio keys to external API servers.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          Our application interface integrates Google Web Fonts and Lucide Icons to provide a premium design. These static resources are served securely, and their providers do not collect profile metadata or credential details from your active dashboard sessions.
        </p>
      </section>

      {/* RIGHTS TO ERASURE */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 className="text-primary" size={28} /> 6. Privacy Rights & Right to Erasure
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1rem' }}>
          We respect user sovereignty over personal data. In compliance with modern global privacy regulations (such as GDPR and local data protection rules), we grant you full access to modify or delete your account records. Your privacy controls include:
        </p>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
          <li>
            <strong>Right to Access & Portability:</strong> You can request a structural file containing your profile parameters and simulated transaction logs.
          </li>
          <li>
            <strong>Right to Erasure (Deletion):</strong> You can delete your profile at any time. Submit a request specifying "Account Erasure" on the Contact page, and our support team will purge your record within 3 business days.
          </li>
          <li>
            <strong>Right to Modification:</strong> You can adjust details, including phone numbers, date of birth, and profession, directly inside your profile settings.
          </li>
        </ul>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
          Data purges are permanent and cannot be undone. Once deleted, historical paper trading achievements and virtual balance histories cannot be recovered.
        </p>
      </section>

      {/* POLICY FAQ */}
      <section className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <HelpCircle size={28} style={{ color: 'var(--accent-pink)' }} />
          <h2 style={{ fontSize: '1.5rem' }}>Security & Policy FAQ</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Are cookies used on the platform?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              We use minimal functional cookie configurations to store operational states. These include session identifiers that maintain routing paths and user layout preferences. We do not use third-party tracking or advertising cookies.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>How is transaction telemetry processed?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Order details placed on the simulated trading floor are processed locally by our API servers. We analyze transaction patterns anonymously to study model execution slippages and optimize load management.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Do you share IP addresses?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              IP addresses are logged for security diagnostics and rate-limiting validation. These logs are stored in encrypted system partitions and automatically deleted after 30 days, unless flagged for security investigations.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Is student research data public?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              No. Student profile details and custom test metrics are private. Academic teams using our sandboxes receive private database segments that are not accessible to public users or crawlers.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>What happens during policy updates?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              We review our privacy parameters annually to align with new regulations. Material changes to processing limits are announced via notification banners on the login screen, prompting review.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>How do I report security bugs?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              If you identify security anomalies or JWT validation bypass bugs, submit a detailed ticket on our Contact page. Our quantitative engineering team will verify and address reports promptly.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Is my profile phone number public?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              No. Optional phone numbers are stored strictly to support secondary multi-factor verification tests. They are never displayed to other users or crawlers.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Are database back-ups encrypted?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Yes. All secondary database backups are automatically encrypted using AES-256 protocols and stored on isolated storage endpoints to prevent unauthorized access.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
