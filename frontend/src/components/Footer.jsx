import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="ds-footer-react">
      <div className="ds-footer-inner-react">
        <div className="ds-footer-top-react">
          <div className="ds-footer-brand-col-react">
            <span className="ds-footer-logo-react">Stock Price Prediction System</span>
            <p className="ds-footer-desc-react">
              Advanced AI-driven analytics for smarter trading decisions.
              Empowering investors with real-time data and predictive insights.
            </p>
            <div className="ds-footer-socials-react">
              <a href="#" className="ds-footer-social-link-react">𝕏</a>
              <a href="#" className="ds-footer-social-link-react">in</a>
              <a href="#" className="ds-footer-social-link-react">f</a>
            </div>
          </div>

          <div className="ds-footer-links-col-react">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/dashboard">Market Overview</Link></li>
              <li><Link to="/dashboard">Predictor AI</Link></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>

          <div className="ds-footer-links-col-react">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">API Reference</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Community</a></li>
            </ul>
          </div>

          <div className="ds-footer-links-col-react">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Legal</a></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="ds-footer-bottom-react">
          <div className="ds-footer-copyright-react">
            © 2026 Stock Price Prediction System. All rights reserved.
          </div>
          <div className="ds-footer-legal-react">
            <a href="#">Privacy Policy</a>
            <span className="footer-pipe-divider">|</span>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
