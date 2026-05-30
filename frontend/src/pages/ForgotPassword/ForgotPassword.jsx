import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Phone, Calendar, Lock, Loader2, ArrowRight } from 'lucide-react';
import authService from '../../services/authService';
import '../Auth.css';

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    dob: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePasswordStrength = (password) => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[@$!%*?&#^()_+\-=]/.test(password)) return false;
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { email, phone, dob, newPassword, confirmPassword } = formData;

    if (!email || !phone || !dob || !newPassword || !confirmPassword) {
      setErrorMsg('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match');
      return;
    }

    if (!validatePasswordStrength(newPassword)) {
      setErrorMsg(
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
      );
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email, phone, dob, newPassword);
      setSuccessMsg('Password reset successful. Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container register-page-wrap">
      <div className="auth-card glass-panel register-card">
        <div className="auth-header">
          <h2>Reset password</h2>
          <p>Verify your credentials to secure a new password</p>
        </div>

        {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}
        {successMsg && <div className="auth-success-banner">{successMsg}</div>}

        <form onSubmit={handleFormSubmit} className="auth-form register-form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="reset-email">Email address</label>
            <div className="form-input-icon-wrap">
              <Mail size={16} className="form-input-icon" />
              <input
                id="reset-email"
                name="email"
                type="email"
                className="form-input form-input-with-icon"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-phone">Phone number</label>
            <div className="form-input-icon-wrap">
              <Phone size={16} className="form-input-icon" />
              <input
                id="reset-phone"
                name="phone"
                type="tel"
                className="form-input form-input-with-icon"
                placeholder="+91 9999999999"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-dob">Date of birth</label>
            <div className="form-input-icon-wrap">
              <Calendar size={16} className="form-input-icon" />
              <input
                id="reset-dob"
                name="dob"
                type="date"
                className="form-input form-input-with-icon"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-pass">New password</label>
            <div className="form-input-icon-wrap">
              <Lock size={16} className="form-input-icon" />
              <input
                id="reset-pass"
                name="newPassword"
                type="password"
                className="form-input form-input-with-icon"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" htmlFor="reset-confirm-pass">Confirm new password</label>
            <div className="form-input-icon-wrap">
              <Lock size={16} className="form-input-icon" />
              <input
                id="reset-confirm-pass"
                name="confirmPassword"
                type="password"
                className="form-input form-input-with-icon"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full auth-submit-btn register-submit" style={{ gridColumn: 'span 2' }} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Reset Password <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>Remember your credentials? </span>
          <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
