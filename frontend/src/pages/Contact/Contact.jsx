import { useState } from 'react';
import api from '../../services/api';
import { Mail, User, BookOpen, MessageSquare, Send, Loader2 } from 'lucide-react';
import '../Auth.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { name, email, message } = formData;
    if (!name || !email || !message) {
      setErrorMsg('Name, email, and message are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/contact', formData);
      setSuccessMsg('Thank you. Your message has been sent successfully. Our support desk will contact you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel register-card">
        <div className="auth-header">
          <h2>Contact Support</h2>
          <p>Have questions? Reach out to our technical helpdesk</p>
        </div>

        {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}
        {successMsg && <div className="auth-success-banner">{successMsg}</div>}

        <form onSubmit={handleFormSubmit} className="auth-form">
          <div className="register-form-grid" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="con-name">Full name</label>
              <div className="form-input-icon-wrap">
                <User size={16} className="form-input-icon" />
                <input
                  id="con-name"
                  name="name"
                  type="text"
                  className="form-input form-input-with-icon"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="con-email">Email address</label>
              <div className="form-input-icon-wrap">
                <Mail size={16} className="form-input-icon" />
                <input
                  id="con-email"
                  name="email"
                  type="email"
                  className="form-input form-input-with-icon"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="con-subj">Subject</label>
            <div className="form-input-icon-wrap">
              <BookOpen size={16} className="form-input-icon" />
              <input
                id="con-subj"
                name="subject"
                type="text"
                className="form-input form-input-with-icon"
                placeholder="e.g. Question about LSTM predictions"
                value={formData.subject}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="con-msg">Message</label>
            <div className="form-input-icon-wrap">
              <MessageSquare size={16} className="form-input-icon" style={{ top: '14px' }} />
              <textarea
                id="con-msg"
                name="message"
                className="form-input form-input-with-icon"
                rows="5"
                placeholder="Type your message here..."
                style={{ paddingLeft: '2.5rem', resize: 'vertical' }}
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Dispatching...
              </>
            ) : (
              <>
                Send Message <Send size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
