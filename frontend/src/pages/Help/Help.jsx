import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Mail, User, BookOpen, MessageSquare, Send, Loader2, Info, Clock, Shield, FileText, Layers, HelpCircle, Code, School } from 'lucide-react';
import './Help.css';

const Help = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const { name, email, message } = formData;
    if (!name || !email || !message) {
      setErrorMsg('Name, email, and message are required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/contact', formData);
      setSuccessMsg('Your support ticket has been logged successfully. Check your email for updates.');
      setFormData({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="help-page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <header className="page-section-header">
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: 0 }}>Terminal Support & Helpdesk</h1>
        <p style={{ color: 'var(--db-text-variant)', fontSize: '0.88rem', margin: '4px 0 0' }}>
          Open a support ticket, check technical SLAs, review bug reporting guidelines, or browse help articles.
        </p>
      </header>

      {successMsg && <div className="kpi-change-tag pl-profit accent-blue-badge" style={{ padding: '10px 16px', borderRadius: '8px' }}>{successMsg}</div>}
      {errorMsg && <div className="kpi-change-tag pl-loss accent-red-badge" style={{ padding: '10px 16px', borderRadius: '8px' }}>{errorMsg}</div>}

      <div className="help-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* DISPATCH SUPPORT TICKET */}
        <section className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} style={{ color: 'var(--db-primary)' }} />
            <span>Submit a Ticket</span>
          </h3>

          <form onSubmit={handleFormSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="help-name-input">Full Name</label>
              <div className="form-input-icon-wrap" style={{ position: 'relative' }}>
                <User size={16} className="form-input-icon" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--db-text-variant)' }} />
                <input
                  id="help-name-input"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="help-email-input">Email Address</label>
              <div className="form-input-icon-wrap" style={{ position: 'relative' }}>
                <Mail size={16} className="form-input-icon" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--db-text-variant)' }} />
                <input
                  id="help-email-input"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="help-subject-input">Subject Topic</label>
              <div className="form-input-icon-wrap" style={{ position: 'relative' }}>
                <BookOpen size={16} className="form-input-icon" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--db-text-variant)' }} />
                <input
                  id="help-subject-input"
                  name="subject"
                  type="text"
                  className="form-input"
                  placeholder="e.g. LSTM Neural Network errors"
                  value={formData.subject}
                  onChange={handleInputChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="help-msg-input">Description</label>
              <div className="form-input-icon-wrap" style={{ position: 'relative' }}>
                <MessageSquare size={16} className="form-input-icon" style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--db-text-variant)' }} />
                <textarea
                  id="help-msg-input"
                  name="message"
                  className="form-input"
                  rows="4"
                  placeholder="Provide parameters to help us troubleshoot..."
                  value={formData.message}
                  onChange={handleInputChange}
                  style={{ paddingLeft: '2.5rem', resize: 'vertical' }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span>{loading ? 'Sending ticket...' : 'Send Message'}</span>
            </button>
          </form>
        </section>

        {/* SLAs & SYSTEM ESCALATION */}
        <section className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: '#8b5cf6' }} />
              <span>SLA Resolution Matrix</span>
            </h3>
            <p style={{ color: 'var(--db-text-variant)', fontSize: '0.82rem', lineHeight: '1.4', margin: 0 }}>
              Our operations helpdesk tracks server uptime and API feed availability 24/7. Ticket response metrics:
            </p>
            <ul style={{ color: 'var(--db-text-variant)', fontSize: '0.8rem', paddingLeft: '1.2rem', margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong>Critical Outage:</strong> Less than 2 hours.</li>
              <li><strong>API Connection Fails:</strong> Less than 12 hours.</li>
              <li><strong>Simulation Updates:</strong> Less than 24 hours.</li>
            </ul>
          </div>

          <div style={{ borderTop: '1px solid var(--db-border-glass)', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} style={{ color: '#3b82f6' }} />
              <span>Support Escalation Tiers</span>
            </h3>
            <ul style={{ color: 'var(--db-text-variant)', fontSize: '0.8rem', paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li><strong>Tier 1:</strong> Access controls, password resets.</li>
              <li><strong>Tier 2:</strong> Options pricing feeds, database lockouts.</li>
              <li><strong>Tier 3:</strong> LSTM model weights re-training anomalies.</li>
            </ul>
          </div>
        </section>

        {/* FAQs */}
        <section className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} style={{ color: '#eab308' }} />
            <span>Troubleshooting FAQ</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { q: 'How do I reset my virtual balance?', a: 'Go to Settings inside your dashboard and click "Reset Wallet Capital" to restore your simulated funds.' },
              { q: 'Why are some charts lagging?', a: 'Real-time quotes are streamed from public endpoints. Lags may occur due to temporary exchange API rate limits.' },
              { q: 'How does LSTM prediction accuracy work?', a: 'It represents testing accuracy on historical splits. A high rating (e.g. 87%) means lower RMSE loss.' }
            ].map((f, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--db-outline)', padding: '10px', borderRadius: '8px' }}>
                <strong style={{ color: '#fff', fontSize: '0.82rem', display: 'block' }}>{f.q}</strong>
                <p style={{ color: 'var(--db-text-variant)', fontSize: '0.78rem', margin: '4px 0 0', lineHeight: '1.4' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Help;
