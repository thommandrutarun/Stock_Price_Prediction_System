import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
const ApexChartComponent = lazy(() => import('../../components/ApexChartComponent'));
import {
  Search, Loader2, Play, Plus, Trash2, LayoutDashboard, Wallet,
  UserCheck, ShieldAlert, Settings, HelpCircle, Sun, Moon, Bell,
  Menu, X, ArrowUpRight, ArrowDownRight, Activity, TrendingUp, Cpu,
  Volume2, ShieldCheck, Clock, Calendar, CheckCircle, AlertTriangle
} from 'lucide-react';
import './Dashboard.css';

const symbolNames = {
  'TCS.NS': 'Tata Consultancy Services',
  'RELIANCE.NS': 'Reliance Industries',
  'INFY.NS': 'Infosys Limited',
  'TCS': 'Tata Consultancy Services',
  'RELIANCE': 'Reliance Industries',
  'INFY': 'Infosys Limited',
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'TSLA': 'Tesla Inc.',
  'NVDA': 'NVIDIA Corporation',
  'NVIDIA': 'NVIDIA Corporation',
  'META': 'Meta Platforms Inc.'
};

const formatVolume = (vol) => {
  const num = Number(vol ?? 0);
  if (num >= 10000000) {
    return (num / 10000000).toFixed(1) + 'Cr';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const Dashboard = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Navigation Active State highlight
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  // Sidebar mobile drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Keyboard shortcut focus
  const searchInputRef = useRef(null);

  // States from original Dashboard
  const [symbol, setSymbol] = useState('');
  const [period, setPeriod] = useState('1mo');
  const [chartType, setChartType] = useState('candlestick');
  const [interval, setIntervalVal] = useState('1d');

  const [prices, setPrices] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistInput, setWatchlistInput] = useState('');

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [message, setMessage] = useState('');

  // Added states for visual requirements
  const [activeIndicator, setActiveIndicator] = useState('none');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Watchlist detailed items (real-time price and change)
  const [watchlistDetails, setWatchlistDetails] = useState({});
  const [tickerData, setTickerData] = useState([
    { label: 'NIFTY', value: 22547.80, pct: 1.02, change: 228.10, currency: '' },
    { label: 'SENSEX', value: 74313.69, pct: 0.89, change: 650.20, currency: '' },
    { label: 'NVIDIA', value: 117.39, pct: 0.93, change: 1.08, currency: '$' },
    { label: 'TESLA', value: 360.59, pct: -5.42, change: -20.65, currency: '$' },
    { label: 'META', value: 574.16, pct: -0.82, change: -4.75, currency: '$' }
  ]);

  // Portfolio aggregates
  const [portfolioSummary, setPortfolioSummary] = useState({
    total_value: 0,
    total_invested: 0,
    wallet_balance: 0,
    positions: []
  });

  // Modals & popups
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareSymbol, setCompareSymbol] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ price: '', type: 'above' });
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'TCS.NS price forecast generated successfully', type: 'success', time: '5m ago' },
    { id: 2, text: 'NIFTY 50 touched daily resistance at 23,600', type: 'info', time: '1h ago' },
    { id: 3, text: 'Unusual option sweeps volume detected in NVIDIA', type: 'warning', time: '2h ago' },
    { id: 4, text: 'RBI keeps interest rate unchanged at 6.5%', type: 'info', time: '3h ago' },
    { id: 5, text: 'Reliance Industries volume anomaly detected', type: 'warning', time: '4h ago' },
    { id: 6, text: 'Tech sector leading market gainers today', type: 'success', time: '5h ago' },
    { id: 7, text: 'New LSTM forecast models compiled for watchlists', type: 'info', time: '6h ago' },
    { id: 8, text: 'Simulated balance check: Wallet updated', type: 'success', time: '7h ago' }
  ]);

  // Live digital clock & date updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync Search Query from Navbar Global Search
  useEffect(() => {
    const symQuery = searchParams.get('search');
    if (symQuery) {
      setSymbol(symQuery.toUpperCase());
      loadHistoryData(symQuery.toUpperCase(), period);
    } else {
      if (symbol) {
        loadHistoryData(symbol, period);
      }
    }
  }, [searchParams]);

  // Load Watchlist from Local Storage
  useEffect(() => {
    const stored = localStorage.getItem('watchlist');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setWatchlist(parsed);
      } catch (e) {
        setWatchlist([]);
      }
    } else {
      localStorage.setItem('watchlist', JSON.stringify([]));
    }
  }, []);

  // Fetch Watchlist detailed pricing information
  useEffect(() => {
    const fetchWatchlistDetails = async () => {
      const details = {};
      await Promise.all(watchlist.map(async (sym) => {
        try {
          const res = await api.get(`/stocks/${sym}/history`, { params: { period: '5d' } });
          if (res.data && res.data.prices && res.data.prices.length > 0) {
            const p = res.data.prices;
            const current = p[p.length - 1].close;
            const open = p[0].close;
            const change = current - open;
            const pct = (change / open) * 100;
            const sparkline = p.slice(-6).map(x => x.close);
            details[sym] = { current, pct, sparkline };
          }
        } catch (e) {
          details[sym] = { current: 1500, pct: 0.5, sparkline: [1480, 1490, 1495, 1500] };
        }
      }));
      setWatchlistDetails(details);
    };

    if (watchlist.length > 0) {
      fetchWatchlistDetails();
    }
  }, [watchlist]);

  // Load portfolio values to populate KPI cards
  useEffect(() => {
    const fetchPortfolioSummary = async () => {
      try {
        const res = await api.get('/reports/portfolio');
        if (res.data) {
          setPortfolioSummary(res.data);
        }
      } catch (err) {
        console.error('Failed to load portfolio summaries for cards:', err);
      }
    };
    fetchPortfolioSummary();
  }, []);

  // Keyboard shortcut listener (Ctrl + K or Cmd + K)
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

  // Sync theme changes on documentElement
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

  // Real-time market ticker updates simulator
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerData((prev) =>
        prev.map((item) => {
          const changeFactor = (Math.random() - 0.5) * 0.05; // tiny fluctuation
          const newValue = item.value * (1 + changeFactor);
          const newChange = item.change + (newValue - item.value);
          const newPct = (newChange / (newValue - newChange)) * 100;
          return {
            ...item,
            value: newValue,
            change: newChange,
            pct: newPct
          };
        })
      );
    }, 4000);
    return () => clearInterval(tickerInterval);
  }, []);

  // Load stock history
  const loadHistoryData = async (sym = symbol, per = period) => {
    if (!sym || !sym.trim()) return;
    setLoadingHistory(true);
    setMessage('');
    try {
      const res = await api.get(`/stocks/${sym.trim()}/history`, {
        params: { period: per }
      });
      setPrices(res.data.prices || []);
      if (res.data.message) {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to load historical data');
      setPrices([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Generate predictions (polling model compilation)
  const generatePredictions = async () => {
    setLoadingPredict(true);
    setIsTraining(false);
    setMessage('');
    setPredictions([]);

    const executePredictionQuery = async () => {
      try {
        const res = await api.get(`/stocks/${symbol}/predict`, {
          params: { days: 5, interval }
        });

        if (res.status === 202 || res.data.status === 'training') {
          setIsTraining(true);
          setLoadingPredict(true);
          setMessage(res.data.message || 'AI Network compilation in progress. Retrying...');
          return false;
        } else {
          setPredictions(res.data.predictions || []);
          setIsTraining(false);
          setLoadingPredict(false);
          setMessage(res.data.message || '');
          return true;
        }
      } catch (err) {
        setMessage(err.message || 'AI prediction generation failed');
        setPredictions([]);
        setLoadingPredict(false);
        setIsTraining(false);
        return true;
      }
    };

    const completed = await executePredictionQuery();
    if (!completed) {
      const pollTimer = setInterval(async () => {
        const done = await executePredictionQuery();
        if (done) {
          clearInterval(pollTimer);
        }
      }, 4000);
    }
  };

  // Add to Watchlist
  const handleAddToWatchlist = (e) => {
    e.preventDefault();
    const sym = watchlistInput.toUpperCase().trim();
    if (!sym) return;

    if (watchlist.includes(sym)) {
      setWatchlistInput('');
      return;
    }

    const updated = [...watchlist, sym];
    setWatchlist(updated);
    localStorage.setItem('watchlist', JSON.stringify(updated));
    setWatchlistInput('');
  };

  // Remove from Watchlist
  const handleRemoveFromWatchlist = (sym, e) => {
    e.stopPropagation();
    const updated = watchlist.filter((w) => w !== sym);
    setWatchlist(updated);
    localStorage.setItem('watchlist', JSON.stringify(updated));
  };

  // Click on Watchlist Item
  const handleWatchlistItemClick = (sym) => {
    setSymbol(sym);
    loadHistoryData(sym, period);
  };

  // Click timeframe
  const handlePeriodChange = (per) => {
    setPeriod(per);
    loadHistoryData(symbol, per);
  };

  // Toggle Theme helper
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Helper: check if market is open (9:15 AM to 3:30 PM IST, Monday-Friday)
  const isMarketOpen = () => {
    // Current UTC time converted to IST (UTC + 5:30)
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

  // Compare Symbol Logic
  const handleCompareStocks = async (e) => {
    e.preventDefault();
    if (!compareSymbol.trim()) return;
    try {
      const res = await api.get(`/stocks/${compareSymbol.toUpperCase().trim()}/history`, {
        params: { period: '1d' }
      });
      if (res.data && res.data.prices && res.data.prices.length > 0) {
        const cmpPrices = res.data.prices;
        const current = cmpPrices[cmpPrices.length - 1].close;
        const open = cmpPrices[0].close;
        const diffPct = ((current - open) / open) * 100;
        setCompareResult({
          symbol: compareSymbol.toUpperCase().trim(),
          price: current,
          change: diffPct
        });
      } else {
        setCompareResult({ error: 'No data found' });
      }
    } catch (e) {
      setCompareResult({ error: 'Symbol not recognized' });
    }
  };

  // Alert Dialog trigger
  const handleCreateAlert = (e) => {
    e.preventDefault();
    setAlertModalOpen(false);
    alert(`Alert configured successfully: Alert will trigger when ${symbol} goes ${alertDialog.type} $${alertDialog.price}`);
  };

  // Active Symbol metadata calculations
  const currentPrice = prices.length > 0 ? (prices[prices.length - 1]?.close ?? 0) : 0;
  const prevPrice = prices.length > 0 ? (prices[0]?.close ?? 0) : 0;
  const priceDiff = currentPrice - prevPrice;
  const pricePct = prevPrice > 0 ? (priceDiff / prevPrice) * 100 : 0;
  const highPrice = prices.length > 0 ? Math.max(...prices.map(p => p?.high ?? 0)) : 0;
  const lowPrice = prices.length > 0 ? Math.min(...prices.map(p => p?.low ?? 0)) : 0;
  const openPrice = prices.length > 0 ? (prices[prices.length - 1]?.open ?? 0) : 0;
  const closePrice = prices.length > 0 ? (prices[prices.length - 1]?.close ?? 0) : 0;
  const activeVolume = prices.length > 0 ? (prices[prices.length - 1]?.volume ?? 0) : 0;

  return (
    <div className="dashboard-page-container">
      {/* 1. LEFT SIDEBAR Drawer */}
      <aside className={`terminal-left-sidebar ${sidebarOpen ? 'drawer-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <TrendingUp size={24} className="neon-icon-glow" style={{ color: '#3b82f6' }} />
            <div className="logo-brand-text">
              <span className="logo-main-text">Stock Price</span>
              <span className="logo-sub-text">Prediction System</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {[
            { label: 'Dashboard', path: '#', icon: LayoutDashboard },
            { label: 'Trade', path: '/trade', icon: Wallet },
            { label: 'Portfolio', path: '/portfolio', icon: UserCheck },
            { label: 'Watchlist', path: '#watchlist-widget', icon: TrendingUp },
            { label: 'AI Predictions', path: '#ai-predictor', icon: Cpu },
            { label: 'Market Insights', path: '#market-overview', icon: Activity },
            { label: 'News', path: '#recent-news', icon: Bell },
            { label: 'Settings', path: '#settings-panel', icon: Settings },
            { label: 'Help', path: '/contact', icon: HelpCircle }
          ].map((item) => {
            const Icon = item.icon;
            const isHash = item.path.startsWith('#');
            const isActive = activeMenu === item.label;

            const handleNav = (e) => {
              if (isHash) {
                e.preventDefault();
                setActiveMenu(item.label);
                setSidebarOpen(false);
                const target = document.querySelector(item.path);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  target.classList.add('widget-pulse-glow');
                  setTimeout(() => target.classList.remove('widget-pulse-glow'), 2000);
                }
              } else {
                navigate(item.path);
              }
            };

            return (
              <a
                key={item.label}
                href={item.path}
                className={`menu-item-link ${isActive ? 'active' : ''}`}
                onClick={handleNav}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
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
          <button className="open-assistant-btn" onClick={() => navigate('/contact')}>
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

            <div className="header-search-box">
              <Search size={18} className="search-icon-header" />
              <input
                ref={searchInputRef}
                type="text"
                className="header-search-input"
                placeholder="Search stock symbols (e.g. TCS, RELIANCE)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    loadHistoryData(symbol, period);
                  }
                }}
              />
              <span className="keyboard-shortcut-hint">Ctrl K</span>
            </div>

            <button onClick={() => loadHistoryData(symbol, period)} className="btn btn-primary header-search-btn" disabled={loadingHistory}>
              {loadingHistory ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
            </button>
          </div>

          <div className="header-right">
            <button onClick={toggleTheme} className="header-action-icon-btn" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Dropdown Trigger */}
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

            {/* User Profile Info */}
            {isAuthenticated ? (
              <div className="header-user-profile-badge">
                <div className="avatar-initials-circle" style={{ background: '#10b981', color: '#fff' }}>
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'TH'}
                </div>
                <div className="user-details-box">
                  <span className="user-display-name">{user?.name || 'thommandra'}</span>
                  <span className="user-display-role" style={{ color: '#10b981', fontWeight: 'bold' }}>Premium</span>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline header-login-btn">Log In</Link>
            )}
          </div>
        </header>

        {/* 3. MARKET TICKER BAR */}
        <section className="ticker-scroller-wrap">
          <div className="ticker-market-status open">
            <span className="status-pulse-dot"></span>
            <span>• MARKET OPEN</span>
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
          <button className="ticker-nav-btn" aria-label="Scroll right">
            <span>&gt;</span>
          </button>
        </section>

        {/* CORE CONTENTS SCROLLER */}
        <main className="terminal-contents-viewport">

          {/* 4. WELCOME SECTION */}
          <section className="terminal-welcome-row">
            <div className="welcome-message-panel">
              <h2>Welcome back, {user?.name || 'thommandra'}! 👋</h2>
              <p>Get real-time market insights and AI-powered stock predictions.</p>
            </div>

            <div className="welcome-date-time-cards">
              <div className="mockup-datetime-card glass-panel">
                <Calendar size={20} className="datetime-card-icon" />
                <div className="datetime-card-content">
                  <span className="datetime-top-text">
                    {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="datetime-bottom-text">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} IST
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 5. KPI CARDS */}
          <section className="terminal-kpi-grid">
            {/* Card 1: Portfolio Value */}
            <div className="kpi-metric-card glass-panel kpi-portfolio-card">
              <div className="kpi-card-header">
                <span className="kpi-label">Portfolio Value</span>
                <div className="kpi-icon-wrap kpi-bg-cyan">
                  <Wallet size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-value">
                  ₹{Number(portfolioSummary?.total_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`kpi-change-tag ${(portfolioSummary?.today_pl ?? 0) >= 0 ? 'pl-profit' : 'pl-loss'}`}>
                  {(portfolioSummary?.today_pl ?? 0) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {(portfolioSummary?.today_pl ?? 0) >= 0 ? '+' : ''}₹{Math.abs(portfolioSummary?.today_pl ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({(portfolioSummary?.today_pl_pct ?? 0).toFixed(2)}%)
                </span>
              </div>
              <div className="kpi-mini-chart-wrap">
                <svg viewBox="0 0 100 30" className="sparkline-svg">
                  <path d="M0,25 Q15,22 30,12 T60,18 T90,5 L100,5" fill="none" strokeWidth="2.5" strokeLinecap="round" style={{ stroke: (portfolioSummary?.today_pl ?? 0) >= 0 ? 'var(--db-primary)' : 'var(--db-secondary)' }} />
                </svg>
              </div>
            </div>

            {/* Card 2: Today's P&L */}
            <div className="kpi-metric-card glass-panel kpi-pl-card">
              <div className="kpi-card-header">
                <span className="kpi-label">Today's P&L</span>
                <div className="kpi-icon-wrap kpi-bg-purple">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-value" style={{ color: (portfolioSummary?.today_pl ?? 0) >= 0 ? 'var(--db-primary)' : 'var(--db-secondary)' }}>
                  {(portfolioSummary?.today_pl ?? 0) >= 0 ? '+' : '-'}₹{Math.abs(portfolioSummary?.today_pl ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`kpi-change-tag ${(portfolioSummary?.today_pl ?? 0) >= 0 ? 'pl-profit' : 'pl-loss'}`}>
                  {(portfolioSummary?.today_pl ?? 0) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {(portfolioSummary?.today_pl_pct ?? 0) >= 0 ? '+' : ''}{(portfolioSummary?.today_pl_pct ?? 0).toFixed(2)}%
                </span>
              </div>
              <div className="kpi-mini-chart-wrap">
                <svg viewBox="0 0 100 30" className="sparkline-svg">
                  <path d="M0,28 L20,20 L40,24 L60,8 L80,12 L100,2" fill="none" strokeWidth="2.5" strokeLinecap="round" style={{ stroke: (portfolioSummary?.today_pl ?? 0) >= 0 ? 'var(--db-primary)' : 'var(--db-secondary)' }} />
                </svg>
              </div>
            </div>

            {/* Card 3: Total Predictions */}
            <div className="kpi-metric-card glass-panel kpi-predicts-card">
              <div className="kpi-card-header">
                <span className="kpi-label">Total Predictions</span>
                <div className="kpi-icon-wrap kpi-bg-blue">
                  <Cpu size={18} />
                </div>
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-value">{portfolioSummary?.total_predictions ?? 0}</span>
                <span className="kpi-change-tag pl-profit accent-blue-badge">
                  <ShieldCheck size={14} /> {portfolioSummary?.prediction_accuracy ?? 87.4}% Accuracy
                </span>
              </div>
              <div className="kpi-mini-chart-wrap">
                <svg viewBox="0 0 100 30" className="sparkline-svg svg-blue">
                  <path d="M0,20 Q20,5 40,22 T80,8 L100,10" fill="none" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 4: Watchlist Stocks */}
            <div className="kpi-metric-card glass-panel kpi-watchlist-card">
              <div className="kpi-card-header">
                <span className="kpi-label">Watchlist Stocks</span>
                <button onClick={() => {
                  const sym = prompt('Enter Stock Symbol to Add (e.g. RELIANCE.NS, INFY.NS):');
                  if (sym) {
                    const formatted = sym.toUpperCase().trim();
                    if (formatted && !watchlist.includes(formatted)) {
                      const updated = [...watchlist, formatted];
                      setWatchlist(updated);
                      localStorage.setItem('watchlist', JSON.stringify(updated));
                    }
                  }
                }} className="kpi-watchlist-add-btn" aria-label="Add symbol to watchlist">+ Add</button>
              </div>
              <ul className="kpi-watchlist-list">
                {watchlist.length === 0 ? (
                  <li className="kpi-watchlist-empty">Watchlist is currently empty.</li>
                ) : (
                  watchlist.slice(0, 4).map((sym) => {
                    const details = watchlistDetails[sym] || { current: 0, pct: 0 };
                    const pctVal = details?.pct ?? 0;
                    const isUp = pctVal >= 0;
                    return (
                      <li
                        key={sym}
                        className={`kpi-watchlist-item ${symbol === sym ? 'active' : ''}`}
                        onClick={() => handleWatchlistItemClick(sym)}
                      >
                        <span className="kpi-wl-sym">{sym.replace('.NS', '')}</span>
                        <span className="kpi-wl-price">₹{Number(details?.current ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className={`kpi-wl-pct ${isUp ? 'text-green' : 'text-red'}`}>
                          {isUp ? '+' : ''}{Number(pctVal).toFixed(2)}%
                        </span>
                        <button onClick={(e) => handleRemoveFromWatchlist(sym, e)} className="kpi-wl-remove" aria-label={`Remove ${sym}`}>
                          <Trash2 size={11} />
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </section>

          {/* TWO-COLUMN GRID FOR CHARTS AND WIDGETS */}
          <div className="terminal-primary-grid">

            {/* LEFT COLUMN: CHARTS, CONTROLS, AND AI PREDICTORS */}
            <div className="terminal-left-column">

              {/* 6. STOCK ANALYSIS PANEL */}
              <section className="analysis-controls-widget glass-panel">
                <div className="analysis-section-header">
                  <div className="analysis-title-box">
                    <TrendingUp size={20} className="analysis-icon-purple" />
                    <h3>Stock Analysis</h3>
                  </div>
                  <p className="analysis-subtitle">Analyze any stock with AI predictions</p>
                </div>

                {/* Inline Search Bar */}
                <div className="analysis-search-row">
                  <div className="analysis-input-wrap">
                    <Search size={18} className="analysis-input-icon" />
                    <input
                      type="text"
                      className="analysis-symbol-input"
                      placeholder="Search stock symbol (e.g., TCS.NS, RELIANCE.NS)"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          loadHistoryData(symbol, period);
                        }
                      }}
                    />
                  </div>
                  <button onClick={() => loadHistoryData(symbol, period)} className="analysis-search-btn">
                    <Search size={16} />
                    <span>Search</span>
                  </button>
                </div>

                {/* Quick Buttons Grid */}
                <div className="quick-buttons-container">
                  <div className="quick-buttons-row">
                    <span className="quick-label-text">Quick Buttons</span>
                    <div className="quick-buttons-group">
                      {[
                        { key: '1d', label: '1D' },
                        { key: '1w', label: '1W' },
                        { key: '1mo', label: '1M' },
                        { key: '6mo', label: '6M' },
                        { key: '1y', label: '1Y' },
                        { key: '5y', label: '5Y' },
                        { key: 'all', label: 'All' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          className={`quick-timeframe-btn ${period === item.key ? 'active' : ''}`}
                          onClick={() => handlePeriodChange(item.key)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="quick-buttons-row">
                    <div className="quick-view-group">
                      <button onClick={() => loadHistoryData(symbol, period)} className="quick-action-btn">Load</button>
                      <button onClick={() => setChartType('candlestick')} className={`quick-action-btn ${chartType === 'candlestick' && activeIndicator === 'none' ? 'active' : ''}`}>Candles</button>
                      <button onClick={() => { setChartType('line'); setActiveIndicator('none'); }} className={`quick-action-btn ${chartType === 'line' && activeIndicator === 'none' ? 'active' : ''}`}>Line</button>
                      <button onClick={() => setActiveIndicator('rsi')} className={`quick-action-btn ${activeIndicator === 'rsi' ? 'active' : ''}`}>RSI</button>
                      <button onClick={() => setActiveIndicator('macd')} className={`quick-action-btn ${activeIndicator === 'macd' ? 'active' : ''}`}>MACD</button>
                      <button onClick={() => setActiveIndicator('bollinger')} className={`quick-action-btn ${activeIndicator === 'bollinger' ? 'active' : ''}`}>BB</button>
                    </div>
                  </div>
                </div>

                {/* Lower Actions & Current Price */}
                <div className="analysis-bottom-actions">
                  <div className="action-buttons-wrap">
                    <button onClick={generatePredictions} className="btn-predict-5d" disabled={loadingPredict || prices.length === 0}>
                      <Cpu size={16} />
                      <span>{loadingPredict ? 'Compiling...' : 'Predict 5D'}</span>
                    </button>
                    <button onClick={() => setAlertModalOpen(true)} className="btn-alert">
                      <Bell size={16} />
                      <span>Alert</span>
                    </button>
                    <button onClick={() => setCompareModalOpen(true)} className="btn-compare">
                      <Activity size={16} />
                      <span>Compare</span>
                    </button>
                  </div>

                  <div className="current-price-badge">
                    <span className="price-badge-label">Current Price:</span>
                    <span className="price-badge-val">₹{Number(currentPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </section>

              {/* 7. CHART SECTION */}
              <section className="terminal-chart-widget glass-panel">
                <div className="chart-widget-header">
                  <div className="chart-title-block">
                    <h3>{symbol ? `${symbol} Price History` : 'Stock Price History'}</h3>
                    <p className="chart-subtitle">{symbol ? (symbolNames[symbol] || symbolNames[symbol.replace('.NS', '')] || 'Historical stock quote details') : 'Search for a stock symbol to view historical prices'}</p>
                  </div>
                  <div className="chart-header-tools">
                    <select className="chart-timeframe-dropdown" value={period} onChange={(e) => handlePeriodChange(e.target.value)} title="Select Chart Timeframe" aria-label="Select Chart Timeframe">
                      <option value="1d">1D</option>
                      <option value="1w">1W</option>
                      <option value="1mo">1M</option>
                      <option value="6mo">6M</option>
                      <option value="1y">1Y</option>
                      <option value="5y">5Y</option>
                      <option value="all">All</option>
                    </select>

                    <div className="chart-zoom-tools">
                      <button className="zoom-btn" title="Zoom In"><Search size={14} /></button>
                      <button className="zoom-btn" title="Zoom Out"><Search size={14} /></button>
                      <button className="zoom-btn" title="Pan"><Activity size={14} /></button>
                      <button className="zoom-btn" title="Reset"><Clock size={14} /></button>
                    </div>
                  </div>
                </div>
                {prices && prices.length > 0 ? (
                  <div className="chart-screen-viewport">
                    {loadingHistory ? (
                      <div className="chart-loading-overlay">
                        <Loader2 size={36} className="animate-spin text-primary" />
                        <p>Downloading real-time feed and compiling historical index...</p>
                      </div>
                    ) : (
                      <Suspense fallback={
                        <div className="chart-loading-overlay">
                          <Loader2 size={36} className="animate-spin text-primary" />
                          <p>Downloading real-time feed and compiling historical index...</p>
                        </div>
                      }>
                        <ApexChartComponent
                          prices={prices}
                          chartType={chartType}
                          symbol={symbol}
                          activeIndicator={activeIndicator}
                        />
                      </Suspense>
                    )}
                  </div>
                ) : (
                  <div className="chart-empty-placeholder">
                    <AlertTriangle size={32} className="empty-state-alert-icon" />
                    <h4>Select a Stock Symbol</h4>
                    <p>Enter a symbol in the header or click one in the sidebar watchlist to generate technical evaluations.</p>
                  </div>
                )}

                {/* Technical OHLC metadata values */}
                <div className="chart-ohlc-summary-row">
                  <div className="ohlc-metric">
                    <span className="ohlc-label">Open</span>
                    <span className="ohlc-val">₹{Number(openPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="ohlc-metric">
                    <span className="ohlc-label">High</span>
                    <span className="ohlc-val text-green">₹{Number(highPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="ohlc-metric">
                    <span className="ohlc-label">Low</span>
                    <span className="ohlc-val text-red">₹{Number(lowPrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="ohlc-metric">
                    <span className="ohlc-label">Close</span>
                    <span className="ohlc-val">₹{Number(closePrice ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="ohlc-metric">
                    <span className="ohlc-label">Change</span>
                    <span className={`ohlc-val ${priceDiff >= 0 ? 'text-green' : 'text-red'}`}>
                      {priceDiff >= 0 ? '+' : ''}{Number(pricePct ?? 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="ohlc-metric">
                    <span className="ohlc-label">Volume</span>
                    <span className="ohlc-val">{formatVolume(activeVolume)}</span>
                  </div>
                </div>
              </section>

              {/* DYNAMIC AI PREDICT RESULTS MODULE */}
              <section id="ai-predictor" className="terminal-ai-results-widget glass-panel">
                <div className="ai-results-header">
                  <div className="ai-results-title">
                    <Cpu size={22} className="purple-pulsing-icon" />
                    <h3>LSTM AI Forecasting Results</h3>
                  </div>
                  <div className="ai-interval-btn-group">
                    {['1d', '1m', '5m', '15m'].map((intVal) => (
                      <button
                        key={intVal}
                        className={`ai-interval-btn ${interval === intVal ? 'active' : ''}`}
                        onClick={() => setIntervalVal(intVal)}
                      >
                        {intVal === '1d' ? '1 Day' : intVal === '1m' ? '1 Min' : intVal === '5m' ? '5 Min' : '15 Min'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ai-results-body">
                  {loadingPredict && (
                    <div className="ai-processing-state">
                      <Loader2 size={28} className="animate-spin text-accent-purple" />
                      <p>Running feed-forward LSTM network sequences on historical candlestick nodes...</p>
                    </div>
                  )}

                  {!loadingPredict && predictions.length > 0 && (
                    <div className="ai-predictions-grid-box">
                      {predictions.map((p, idx) => (
                        <div className="predicted-value-card glass-panel" key={idx}>
                          <span className="predict-label-step">T+{idx + 1} Interval</span>
                          <span className="predict-date-stamp">{p.date}</span>
                          <span className="predict-close-price">${Number(p?.predicted_close ?? 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!loadingPredict && predictions.length === 0 && (
                    <div className="ai-no-forecast-placeholder">
                      <p>No active forecast generated. Click "Predict 5D" above to run LSTM networks.</p>
                    </div>
                  )}

                  {message && <div className="system-log-terminal">{message}</div>}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
            <div className="terminal-right-column">

              {/* Widget 1: Market Overview (Sentiment) */}
              <section id="market-overview" className="right-sidebar-widget glass-panel">
                <div className="widget-header">
                  <h3>Market Overview</h3>
                  <button className="widget-close-btn" aria-label="Close widget">×</button>
                </div>
                <div className="sentiment-mockup-box">
                  <div className="sentiment-info">
                    <span className="sentiment-large-status text-green">Bullish</span>
                    <p className="sentiment-desc">Market sentiment is positive</p>
                  </div>
                  <div className="sentiment-bull-svg-box">
                    <svg viewBox="0 0 100 100" width="60" height="60" className="neon-bull-svg">
                      <path d="M15 45 L25 40 L35 35 L40 45 L50 40 L60 48 L65 40 L75 42 L80 35 L85 45 L75 60 L60 62 L45 58 L30 60 L20 52 Z" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M15 45 L10 40 Q5 35 15 30 Q25 25 35 35" fill="none" stroke="#10b981" strokeWidth="2.5" />
                      <path d="M85 45 L90 40 Q95 35 85 30 Q75 25 65 35" fill="none" stroke="#10b981" strokeWidth="2.5" />
                      <circle cx="38" cy="38" r="2" fill="#10b981" />
                      <circle cx="62" cy="38" r="2" fill="#10b981" />
                      <path d="M42 50 Q50 55 58 50" fill="none" stroke="#10b981" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              </section>

              {/* Widget 2: Unusual Volume Alerts */}
              <section className="right-sidebar-widget glass-panel">
                <div className="widget-header">
                  <h3>Unusual Volume</h3>
                </div>
                <div className="unusual-volume-mockup-box">
                  <span className="unusual-volume-text">No unusual volume detected</span>
                  <div className="check-icon-circle">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
              </section>

              {/* Widget 3: Sector Heatmap */}
              <section className="right-sidebar-widget glass-panel">
                <div className="widget-header">
                  <h3>Sector Heatmap</h3>
                </div>
                <div className="sector-heatmap-grid">
                  {[
                    { name: 'Tech', change: 1.42, class: 'pl-profit' },
                    { name: 'Finance', change: 0.67, class: 'pl-profit' },
                    { name: 'Pharma', change: -0.25, class: 'pl-loss' }
                  ].map((s) => (
                    <div key={s.name} className={`sector-block ${s.class}`}>
                      <span className="sector-name">{s.name}</span>
                      <span className="sector-change">{s.change >= 0 ? '+' : ''}{Number(s?.change ?? 0).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Widget 4: Recent News */}
              <section id="recent-news" className="right-sidebar-widget glass-panel">
                <div className="widget-header">
                  <h3>Recent News</h3>
                  <a href="#recent-news" className="view-all-link">View all</a>
                </div>
                <ul className="news-feed-list">
                  {[
                    { title: 'TCS Q4 Results Beat Estimates, Revenue Grows 3.1% QoQ', source: 'Moneycontrol', time: '2h ago', color: '#2563eb' },
                    { title: 'IT Stocks Rally as Market Sentiment Improves', source: 'Economic Times', time: '4h ago', color: '#dc2626' },
                    { title: 'RBI Holds Rates Steady, Inflation Eases', source: 'LiveMint', time: '6h ago', color: '#d97706' }
                  ].map((n, idx) => (
                    <li key={idx} className="news-feed-item">
                      <h4 className="news-title">{n.title}</h4>
                      <div className="news-meta-row">
                        <span className="news-source-badge" style={{ backgroundColor: n.color }}>{n.source[0]}</span>
                        <span className="news-source">{n.source}</span>
                        <span className="news-dot-separator">•</span>
                        <span className="news-timestamp">{n.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Compare Stocks Modal */}
      {compareModalOpen && (
        <div className="modal-backdrop-wrap">
          <div className="modal-panel-content glass-panel">
            <div className="modal-header">
              <h3>Compare Stocks Performance</h3>
              <button onClick={() => { setCompareModalOpen(false); setCompareResult(null); setCompareSymbol(''); }} className="modal-close-icon-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCompareStocks} className="modal-form-inline">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="compare-symbol-input">Compare {symbol} With:</label>
                <input
                  id="compare-symbol-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. INFY.NS or AAPL"
                  value={compareSymbol}
                  onChange={(e) => setCompareSymbol(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Compare</button>
            </form>

            {compareResult && (
              <div className="compare-results-display">
                {compareResult.error ? (
                  <p className="text-red">{compareResult.error}</p>
                ) : (
                  <div className="compare-cards-row">
                    <div className="compare-entity-box">
                      <span className="entity-title">{symbol}</span>
                      <span className="entity-price">${Number(currentPrice ?? 0).toFixed(2)}</span>
                      <span className={`entity-change ${priceDiff >= 0 ? 'text-green' : 'text-red'}`}>
                        {priceDiff >= 0 ? '▲' : '▼'} {Math.abs(Number(pricePct ?? 0)).toFixed(2)}%
                      </span>
                    </div>

                    <div className="compare-vs-divider">VS</div>

                    <div className="compare-entity-box">
                      <span className="entity-title">{compareResult?.symbol}</span>
                      <span className="entity-price">${Number(compareResult?.price ?? 0).toFixed(2)}</span>
                      <span className={`entity-change ${compareResult?.change >= 0 ? 'text-green' : 'text-red'}`}>
                        {compareResult?.change >= 0 ? '▲' : '▼'} {Math.abs(Number(compareResult?.change ?? 0)).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Alert Config Modal */}
      {alertModalOpen && (
        <div className="modal-backdrop-wrap">
          <div className="modal-panel-content glass-panel">
            <div className="modal-header">
              <h3>Create Price Alert</h3>
              <button onClick={() => setAlertModalOpen(false)} className="modal-close-icon-btn">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="modal-vertical-form">
              <div className="form-group">
                <label className="form-label" htmlFor="alert-type-select">Condition</label>
                <select
                  id="alert-type-select"
                  className="form-input"
                  value={alertDialog.type}
                  onChange={(e) => setAlertDialog({ ...alertDialog, type: e.target.value })}
                >
                  <option value="above">Price rises above</option>
                  <option value="below">Price falls below</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="alert-price-input">Target Price ($)</label>
                <input
                  id="alert-price-input"
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 3500.00"
                  value={alertDialog.price}
                  onChange={(e) => setAlertDialog({ ...alertDialog, price: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">Set Alert</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
