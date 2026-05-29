import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Mail, Phone, Calendar, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import '../Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    profession: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { name, email, password, phone, dob, profession } = formData;
    if (!name || !email || !password) {
      setErrorMsg('Please specify Name, Email, and Password details');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone, dob, profession);
      setSuccessMsg('Account registered successfully. Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container register-page-wrap">
      <div className="auth-card glass-panel register-card">
        <div className="auth-header">
          <h2>Create account</h2>
          <p>India’s leading AI-powered stock prediction platform</p>
        </div>

        {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}
        {successMsg && <div className="auth-success-banner">{successMsg}</div>}

        <form onSubmit={handleFormSubmit} className="auth-form register-form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full name</label>
            <div className="form-input-icon-wrap">
              <User size={16} className="form-input-icon" />
              <input
                id="reg-name"
                name="name"
                type="text"
                className="form-input form-input-with-icon"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <div className="form-input-icon-wrap">
              <Mail size={16} className="form-input-icon" />
              <input
                id="reg-email"
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
            <label className="form-label" htmlFor="reg-phone">Phone number</label>
            <div className="form-input-icon-wrap">
              <Phone size={16} className="form-input-icon" />
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                className="form-input form-input-with-icon"
                placeholder="+91 9999999999"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-dob">Date of birth</label>
            <div className="form-input-icon-wrap">
              <Calendar size={16} className="form-input-icon" />
              <input
                id="reg-dob"
                name="dob"
                type="date"
                className="form-input form-input-with-icon"
                value={formData.dob}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-profession">Profession</label>
            <div className="form-input-icon-wrap">
              <Briefcase size={16} className="form-input-icon" />
              <input
                id="reg-profession"
                name="profession"
                type="text"
                className="form-input form-input-with-icon"
                placeholder="e.g. Software Engineer"
                value={formData.profession}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-pass">Password</label>
            <div className="form-input-icon-wrap">
              <Lock size={16} className="form-input-icon" />
              <input
                id="reg-pass"
                name="password"
                type="password"
                className="form-input form-input-with-icon"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full auth-submit-btn register-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Enrolling user...
              </>
            ) : (
              <>
                Register Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>Already have an account? </span>
          <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
