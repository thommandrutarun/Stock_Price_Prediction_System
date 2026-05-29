import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import '../Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please specify both email and password credentials');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login details are incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>Login to secure your trading terminal session</p>
        </div>

        {errorMsg && <div className="auth-error-banner">{errorMsg}</div>}

        <form onSubmit={handleFormSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email-login">Email address</label>
            <div className="form-input-icon-wrap">
              <Mail size={16} className="form-input-icon" />
              <input
                id="email-login"
                type="email"
                className="form-input form-input-with-icon"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pass-login">Password</label>
            <div className="form-input-icon-wrap">
              <Lock size={16} className="form-input-icon" />
              <input
                id="pass-login"
                type="password"
                className="form-input form-input-with-icon"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Authenticating...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>New to the platform? </span>
          <Link to="/register">Create a free account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
