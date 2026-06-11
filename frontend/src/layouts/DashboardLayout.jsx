import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Search, Loader2, LayoutDashboard, Wallet, UserCheck, Settings,
  HelpCircle, Sun, Moon, Bell, Menu, X, ArrowUpRight, ArrowDownRight,
  Activity, TrendingUp, Cpu, ShieldCheck, Clock, Calendar
} from 'lucide-react';
import '../pages/Dashboard/Dashboard.css'; // Leverage Dashboard styles globally for layout consistency

const DashboardLayout = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Mobile menu drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keyboard shortcut focus
  const searchInputRef = useRef(null);
  const [searchSymbol, setSearchSymbol] = useState('');

  // Clock & Date state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Global Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Ticker Data Simulation state
  const [tickerData, setTickerData] = useState([
    { label: 'NIFTY', value: 22547.80, pct: 1.02, change: 228.10, currency: '' },
    { label: 'SENSEX', value: 74313.69, pct: 0.89, change: 650.20, currency: '' },
    { label: 'NVIDIA', value: 117.39, pct: 0.93, change: 1.08, currency: '$' },
    { label: 'TESLA', value: 360.59, pct: -5.42, change: -20.65, currency: '$' },
    { label: 'META', value: 574.16, pct: -0.82, change: -4.75, currency: '$' }
  ]);

  // Notifications dropdown
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'TCS.NS price forecast generated successfully', type: 'success', time: '5m ago' },
    { id: 2, text: 'NIFTY 50 touched daily resistance at 23,600', type: 'info', time: '1h ago' },
    { id: 3, text: 'Unusual option sweeps volume detected in NVIDIA', type: 'warning', time: '2h ago' },
    { id: 4, text: 'RBI keeps interest rate unchanged at 6.5%', type: 'info', time: '3h ago' },
    { id: 5, text: 'Reliance Industries volume anomaly detected', type: 'warning', time: '4h ago' }
  ]);

  // Sync clock date & time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync search input with query params
  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal) {
      setSearchSymbol(searchVal.toUpperCase());
    }
  }, [searchParams]);

  // Sync global theme toggling
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

  // Ticker Simulator updates
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerData((prev) =>
        prev.map((item) => {
          const changeFactor = (Math.random() - 0.5) * 0.05;
          const newValue = item.value * (1 + changeFactor);
          const newChange = item.change + (newValue - item.value);
          const newPct = (newChange / (newValue - newChange)) * 100;
          return { ...item, value: newValue, change: newChange, pct: newPct };
        })
      );
    }, 4000);
    return () => clearInterval(tickerInterval);
  }, []);

  // Keyboard shortcut listener (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchSymbol.trim()) return;
    const query = searchSymbol.toUpperCase().trim();
    if (location.pathname === '/dashboard' || location.pathname === '/trade') {
      navigate(`${location.pathname}?search=${encodeURIComponent(query)}`);
    } else {
      navigate(`/dashboard?search=${encodeURIComponent(query)}`);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const isMarketOpen = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (3600000 * 5.5));
    const day = istTime.getDay();
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const timeVal = hours * 100 + minutes;
    const isWeekday = day >= 1 && day <= 5;
    const isTradingHours = timeVal >= 915 && timeVal <= 1530;
    return isWeekday && isTradingHours;
  };

  return (
    <div className="dashboard-page-container">
      {/* 1. LEFT SIDEBAR */}
      <aside className={`terminal-left-sidebar ${sidebarOpen ? 'drawer-open' : ''}`}>
        <div className="sidebar-brand">
          <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
            <TrendingUp size={24} className="neon-icon-glow" style={{ color: '#3b82f6' }} />
            <div className="logo-brand-text">
              <span className="logo-main-text">Stock Price</span>
              <span className="logo-sub-text">Prediction System</span>
            </div>
          </Link>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {[
            { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { label: 'Trade', path: '/trade', icon: Wallet },
            { label: 'Portfolio', path: '/portfolio', icon: UserCheck },
            { label: 'Watchlist', path: '/watchlist', icon: TrendingUp },
            { label: 'AI Predictions', path: '/predictions', icon: Cpu },
            { label: 'Market Insights', path: '/insights', icon: Activity },
            { label: 'News', path: '/news', icon: Bell },
            { label: 'Settings', path: '/settings', icon: Settings },
            { label: 'Help', path: '/help', icon: HelpCircle },
            ...(isAdmin ? [{ label: 'Admin Panel', path: '/admin', icon: ShieldCheck }] : [])
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`menu-item-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Sidebar Card */}
        <div className="sidebar-ai-assistant-card glass-panel">
          <div className="ai-assistant-header">
            <div className="ai-assistant-icon-box">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="neon-icon-glow">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="15" x2="8.01" y2="15" />
                <line x1="16" y1="15" x2="16.01" y2="15" />
              </svg>
            </div>
            <div className="ai-assistant-titles">
              <h4>AI Assistant</h4>
              <p>Your smart trading companion</p>
            </div>
          </div>
          <button className="open-assistant-btn" onClick={() => navigate('/help')}>
            <span>Open Assistant</span>
            <span className="arrow-btn">→</span>
          </button>
        </div>

        {/* Market Status Sidebar Card */}
        <div className="sidebar-market-status-card glass-panel">
          <div className="status-label">Market Status</div>
          <div className="status-indicator-row">
            <span className={`status-dot ${isMarketOpen() ? 'open' : 'live'}`}></span>
            <span className="status-text">{isMarketOpen() ? 'Market Open' : 'System Live'}</span>
          </div>
          <div className="status-details">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} IST
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && <div className="sidebar-backdrop-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* MAIN CONTAINER FOR HEADER AND CONTENTS */}
      <div className="terminal-main-viewport">
        {/* 2. TOP HEADER */}
        <header className="terminal-top-header">
          <div className="header-left">
            <button className="header-hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu">
              <Menu size={24} />
            </button>

            <form onSubmit={handleSearchSubmit} className="header-search-box">
              <Search size={18} className="search-icon-header" />
              <input
                ref={searchInputRef}
                type="text"
                className="header-search-input"
                placeholder="Search stock symbols (e.g. TCS, RELIANCE)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
              />
              <span className="keyboard-shortcut-hint">Ctrl K</span>
            </form>

            <button onClick={handleSearchSubmit} className="btn btn-primary header-search-btn">
              Search
            </button>
          </div>

          <div className="header-right">
            <button onClick={toggleTheme} className="header-action-icon-btn" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Dropdown */}
            <div className="notifications-dropdown-container">
              <button
                onClick={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}
                className="header-action-icon-btn relative-badge-btn"
                aria-label="View notifications"
              >
                <Bell size={20} />
                <span className="notification-badge-red">{notifications.length}</span>
              </button>

              {notificationsDropdownOpen && (
                <div className="notifications-dropdown-menu glass-panel">
                  <div className="dropdown-title-row">
                    <h3>Notifications</h3>
                    <button onClick={() => setNotifications([])} className="clear-notifications-btn">Clear All</button>
                  </div>
                  <ul className="notifications-list">
                    {notifications.length === 0 ? (
                      <li className="no-notifications-item">No new updates.</li>
                    ) : (
                      notifications.map(n => (
                        <li key={n.id} className="notification-item">
                          <p>{n.text}</p>
                          <span>{n.time}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* User Profile */}
            {isAuthenticated ? (
              <div className="header-user-profile-badge">
                <div className="avatar-initials-circle" style={{ background: '#10b981', color: '#fff' }}>
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'TH'}
                </div>
                <div className="user-details-box" onClick={() => navigate('/settings')} style={{ cursor: 'pointer' }}>
                  <span className="user-display-name">{user?.name || 'thommandra'}</span>
                  <span className="user-display-role" style={{ color: '#10b981', fontWeight: 'bold' }}>Premium</span>
                </div>
                {/* Profile Hover Dropdown */}
                <div className="profile-hover-dropdown glass-panel">
                  <div className="profile-dropdown-header">
                    <p className="profile-dropdown-name">{user?.name}</p>
                    <p className="profile-dropdown-email">{user?.email}</p>
                  </div>
                  <button onClick={() => navigate('/settings')} className="profile-dropdown-item">Settings</button>
                  <button onClick={handleLogoutClick} className="profile-dropdown-item logout-btn">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline header-login-btn">Log In</Link>
            )}
          </div>
        </header>

        {/* 3. MARKET TICKER BAR */}
        <section className="ticker-scroller-wrap">
          <div className={`ticker-market-status ${isMarketOpen() ? 'open' : 'live'}`}>
            <span className="status-pulse-dot"></span>
            <span>• {isMarketOpen() ? 'MARKET OPEN' : 'SYSTEM LIVE'}</span>
          </div>
          <div className="ticker-marquee-container">
            <div className="ticker-marquee-inner">
              {[...tickerData, ...tickerData, ...tickerData].map((t, idx) => {
                const isUp = t.pct >= 0;
                return (
                  <div key={idx} className="ticker-marquee-item">
                    <span className="ticker-label">{t.label}</span>
                    <span className="ticker-price">
                      {t.currency || ''}{Number(t?.value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`ticker-pct-change ${isUp ? 'pct-up' : 'pct-down'}`}>
                      {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {isUp ? '+' : ''}{Number(t?.pct ?? 0).toFixed(2)}%
                    </span>
                    <span className="ticker-item-separator">|</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CORE CONTENTS SCROLLER */}
        <main className="terminal-contents-viewport">
          <Outlet />
        </main>
      </div>

      {/* Dynamic Bottom Navigation Bar for Mobile */}
      {isAuthenticated && (
        <nav className="ds-bottom-navigation">
          {[
            { label: 'Terminal', path: '/dashboard', icon: LayoutDashboard },
            { label: 'Trade', path: '/trade', icon: Wallet },
            { label: 'Portfolio', path: '/portfolio', icon: UserCheck },
            { label: 'Watchlist', path: '/watchlist', icon: TrendingUp },
            { label: 'Settings', path: '/settings', icon: Settings },
            ...(isAdmin ? [{ label: 'Admin', path: '/admin', icon: ShieldCheck }] : [])
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.label} to={item.path} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default DashboardLayout;
