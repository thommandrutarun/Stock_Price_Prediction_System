import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, TrendingUp, LogOut, LayoutDashboard, Wallet, UserCheck, ShieldAlert, Home, Search, Sun, Moon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();

  // Dark/Light Theme state initialized safely with localStorage & media fallbacks
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="ds-navbar">
      <div className="ds-navbar-left">
        <Link to="/" className="ds-logo">
          <span className="ds-logo-icon">
            <TrendingUp size={24} className="logo-pulse-icon" />
          </span>
          <span className="ds-logo-text">Stock Price Prediction System</span>
        </Link>
        
        <form onSubmit={handleSearchSubmit} className="ds-search-wrapper">
          <Search size={18} className="search-icon-nav" />
          <input
            type="text"
            className="ds-search-input"
            placeholder="Search stocks..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>
      </div>

      {/* Desktop Navigation */}
      <nav className="ds-navbar-right-desktop">
        {isAuthenticated ? (
          <div className="nav-user-links">
            <span className="user-greeting-nav">
              Hello, <span className="greeting-name">{user?.name}</span>
            </span>
            <NavLink to="/" end className={({ isActive }) => `ds-nav-link ${isActive ? 'active' : ''}`}>
              <Home size={16} /> Home
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `ds-nav-link admin-nav-link ${isActive ? 'active' : ''}`}>
                <ShieldAlert size={16} /> Admin Panel
              </NavLink>
            )}
            {!isAdmin && (
              <>
                <NavLink to="/dashboard" className={({ isActive }) => `ds-nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={16} /> Dashboard
                </NavLink>
                <NavLink to="/trade" className={({ isActive }) => `ds-nav-link ${isActive ? 'active' : ''}`}>
                  <Wallet size={16} /> Trade
                </NavLink>
                <NavLink to="/portfolio" className={({ isActive }) => `ds-nav-link ${isActive ? 'active' : ''}`}>
                  <UserCheck size={16} /> Portfolio
                </NavLink>
              </>
            )}
            <button onClick={handleLogoutClick} className="btn btn-outline nav-logout-btn">
              <LogOut size={14} /> Log out
            </button>
          </div>
        ) : (
          <div className="nav-guest-links">
            <Link to="/login" className="btn btn-outline btn-nav">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-nav">Sign up</Link>
          </div>
        )}
        
        {/* Unified Theme Toggle Button */}
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme" title="Toggle Dark/Light Mode">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>

      {/* Mobile Toggle Button */}
      <button className="ds-navbar-toggle" onClick={toggleMobileMenu} aria-label="Toggle Menu">
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar Navigation */}
      <div className={`ds-navbar-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        {isAuthenticated ? (
          <div className="nav-mobile-wrapper">
            <div className="user-mobile-profile">
              <span className="user-greet-mob">Session active</span>
              <span className="user-name-mob">{user?.name}</span>
              <span className="user-role-mob">{user?.role.toUpperCase()}</span>
            </div>
            
            <NavLink to="/" end className="ds-nav-link-mob" onClick={toggleMobileMenu}>
              <Home size={18} /> Home
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="ds-nav-link-mob admin-mob" onClick={toggleMobileMenu}>
                <ShieldAlert size={18} /> Admin Panel
              </NavLink>
            )}
            {!isAdmin && (
              <>
                <NavLink to="/dashboard" className="ds-nav-link-mob" onClick={toggleMobileMenu}>
                  <LayoutDashboard size={18} /> Dashboard
                </NavLink>
                <NavLink to="/trade" className="ds-nav-link-mob" onClick={toggleMobileMenu}>
                  <Wallet size={18} /> Trade
                </NavLink>
                <NavLink to="/portfolio" className="ds-nav-link-mob" onClick={toggleMobileMenu}>
                  <UserCheck size={18} /> Portfolio
                </NavLink>
              </>
            )}
            
            <button onClick={toggleTheme} className="theme-toggle-btn-mob" aria-label="Toggle Theme">
              {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
            </button>
            
            <button onClick={handleLogoutClick} className="btn btn-outline logout-mob-btn w-full">
              <LogOut size={16} /> Log out
            </button>
          </div>
        ) : (
          <div className="nav-mobile-wrapper guest-mob-wrapper">
            <Link to="/login" className="btn btn-outline w-full" onClick={toggleMobileMenu}>Log in</Link>
            <Link to="/register" className="btn btn-primary w-full" onClick={toggleMobileMenu}>Sign up</Link>
            
            <button onClick={toggleTheme} className="theme-toggle-btn-mob w-full" aria-label="Toggle Theme">
              {theme === 'dark' ? <><Sun size={16} /> Light Mode</> : <><Moon size={16} /> Dark Mode</>}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
