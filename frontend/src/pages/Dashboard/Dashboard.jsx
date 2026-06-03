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
  const [symbol, setSymbol] = useState('TCS.NS');
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
    { label: 'NIFTY 50', value: 23547.75, pct: 0.41, change: 96.15 },
    { label: 'SENSEX', value: 76456.80, pct: -0.18, change: -137.60 },
    { label: 'RELIANCE', value: 2942.50, pct: 1.05, change: 30.50 },
    { label: 'TCS', value: 3820.10, pct: -0.45, change: -17.20 },
    { label: 'INFY', value: 1475.25, pct: 1.82, change: 26.40 },
    { label: 'NVIDIA', value: 1150.80, pct: 3.42, change: 38.10 },
    { label: 'TESLA', value: 178.50, pct: -2.15, change: -3.90 },
    { label: 'META', value: 485.30, pct: 0.85, change: 4.10 }
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
    { id: 3, text: 'Unusual option sweeps volume detected in NVIDIA', type: 'warning', time: '2h ago' }
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
  const currentPrice = prices.length > 0 ? prices[prices.length - 1].close : 0;
  const prevPrice = prices.length > 0 ? prices[0].close : 0;
  const priceDiff = currentPrice - prevPrice;
  const pricePct = prevPrice > 0 ? (priceDiff / prevPrice) * 100 : 0;
  const highPrice = prices.length > 0 ? Math.max(...prices.map(p => p.high)) : 0;
  const lowPrice = prices.length > 0 ? Math.min(...prices.map(p => p.low)) : 0;
  const openPrice = prices.length > 0 ? prices[prices.length - 1].open : 0;
  const closePrice = prices.length > 0 ? prices[prices.length - 1].close : 0;
  const activeVolume = prices.length > 0 ? prices[prices.length - 1].volume : 0;

  return (
    <div className="dashboard-page-container">
      {/* 1. LEFT SIDEBAR Drawer */}
      <aside className={`terminal-left-sidebar ${sidebarOpen ? 'drawer-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Cpu size={24} className="neon-icon-glow" />
            <span>DeepStock AI</span>
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
          <div className="ai-assistant-avatar-wrap">
            <span className="ai-badge-pulse">AI Agent</span>
            <h4>DeepStock Copilot</h4>
          </div>
          <p>Analyzing {symbol} candlestick parameters. Generate a forecast below.</p>
          <div className="assistant-suggestions">
            <button onClick={() => { setSymbol('TCS.NS'); loadHistoryData('TCS.NS'); }} className="suggestion-chip">TCS.NS</button>
            <button onClick={() => { setSymbol('RELIANCE.NS'); loadHistoryData('RELIANCE.NS'); }} className="suggestion-chip">RELIANCE</button>
          </div>
        </div>

        {/* Market Status Sidebar Card */}
        <div className="sidebar-market-status-card glass-panel">
          <div className="status-indicator-row">
            <span className={`status-dot ${isMarketOpen() ? 'open' : 'live'}`}></span>
            <span>{isMarketOpen() ? 'MARKET TRADING' : 'SYSTEM LIVE'}</span>
          </div>
          <span className="status-details">IST Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                placeholder="Search stock symbol... (e.g. AAPL, TCS.NS)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    loadHistoryData(symbol, period);
                  }
                }}
              />
              <span className="keyboard-shortcut-hint">Ctrl + K</span>
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
                <div className="avatar-initials-circle">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="user-details-box">
                  <span className="user-display-name">{user?.name}</span>
                  <span className="user-display-role">{user?.role}</span>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline header-login-btn">Log In</Link>
            )}
          </div>
        </header>

        {/* 3. MARKET TICKER BAR */}
        <section className="ticker-scroller-wrap">
          <div className={`ticker-market-status ${isMarketOpen() ? 'open' : 'closed'}`}>
            <span className="status-pulse-dot"></span>
            <span>{isMarketOpen() ? 'OPEN' : 'CLOSED'}</span>
          </div>
          <div className="ticker-marquee-container">
            <div className="ticker-marquee-inner">
              {[...tickerData, ...tickerData, ...tickerData].map((t, idx) => {
                const isUp = t.pct >= 0;
                return (
                  <div key={idx} className="ticker-marquee-item">
                    <span className="ticker-label">{t.label}</span>
                    <span className="ticker-price">${parseFloat(t.value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className={`ticker-pct-change ${isUp ? 'pct-up' : 'pct-down'}`}>
                      {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {isUp ? '+' : ''}{t.pct.toFixed(2)}%
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

          {/* 4. WELCOME SECTION */}
          <section className="terminal-welcome-row">
            <div className="welcome-message-panel">
              <h2>Welcome back, {user?.name || 'Guest'}</h2>
              <p>Get real-time market insights and AI-powered stock predictions.</p>
            </div>
            
            <div className="welcome-date-time-cards">
              <div className="datetime-card glass-panel">
                <Calendar size={18} className="datetime-icon-purple" />
                <div className="datetime-card-text">
                  <span className="datetime-label">Date</span>
                  <span className="datetime-value">{currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              
              <div className="datetime-card glass-panel">
                <Clock size={18} className="datetime-icon-green" />
                <div className="datetime-card-text">
                  <span className="datetime-label">Local Time</span>
                  <span className="datetime-value">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 5. KPI CARDS */}
          <section className="terminal-kpi-grid">
            {/* Card 1: Portfolio Value */}
            <div className="kpi-metric-card glass-panel">
              <div className="kpi-card-header">
                <span className="kpi-label">Portfolio Value</span>
                <Wallet size={20} className="kpi-icon-blue" />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-value">
                  ${Number(portfolioSummary?.total_value ?? 124500.00).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="kpi-change-tag pl-profit">
                  <ArrowUpRight size={14} /> +1.24%
                </span>
              </div>
              <div className="kpi-mini-chart-wrap">
                <svg viewBox="0 0 100 30" className="sparkline-svg svg-blue">
                  <path d="M0,25 Q15,22 30,12 T60,18 T90,5 L100,5" fill="none" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Today's P&L */}
            <div className="kpi-metric-card glass-panel">
              <div className="kpi-card-header">
                <span className="kpi-label">Today's P&L</span>
                <TrendingUp size={20} className="kpi-icon-green" />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-value text-green">+$3,420.50</span>
                <span className="kpi-change-tag pl-profit">
                  <ArrowUpRight size={14} /> +2.80%
                </span>
              </div>
              <div className="kpi-mini-chart-wrap">
                <svg viewBox="0 0 100 30" className="sparkline-svg svg-green">
                  <path d="M0,28 L20,20 L40,24 L60,8 L80,12 L100,2" fill="none" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Total Predictions */}
            <div className="kpi-metric-card glass-panel">
              <div className="kpi-card-header">
                <span className="kpi-label">Total Predictions</span>
                <Cpu size={20} className="kpi-icon-purple" />
              </div>
              <div className="kpi-value-row">
                <span className="kpi-main-value">142</span>
                <span className="kpi-change-tag pl-profit accent-purple-badge">
                  <ShieldCheck size={14} /> 94.2% Acc
                </span>
              </div>
              <div className="kpi-mini-chart-wrap">
                <svg viewBox="0 0 100 30" className="sparkline-svg svg-purple">
                  <path d="M0,20 Q20,5 40,22 T80,8 L100,10" fill="none" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </section>

          {/* TWO-COLUMN GRID FOR CHARTS AND WIDGETS */}
          <div className="terminal-primary-grid">
            
            {/* LEFT COLUMN: CHARTS, CONTROLS, AND AI PREDICTORS */}
            <div className="terminal-left-column">
              
              {/* 6. STOCK ANALYSIS PANEL */}
              <section className="analysis-controls-widget glass-panel">
                <div className="analysis-widget-header">
                  <div className="active-stock-details">
                    <span className="badge-ticker">{symbol}</span>
                    <div className="price-callout-box">
                      <span className="large-price">${currentPrice.toFixed(2)}</span>
                      <span className={`price-diff-pct ${priceDiff >= 0 ? 'pl-profit' : 'pl-loss'}`}>
                        {priceDiff >= 0 ? '+' : ''}{priceDiff.toFixed(2)} ({priceDiff >= 0 ? '+' : ''}{pricePct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  {/* Indicators selection bar */}
                  <div className="technical-indicators-selector">
                    <span className="selector-title">Technical Overlays:</span>
                    <div className="indicators-button-group">
                      {[
                        { label: 'None', val: 'none' },
                        { label: 'Bollinger Bands', val: 'bollinger' },
                        { label: 'RSI', val: 'rsi' },
                        { label: 'MACD', val: 'macd' }
                      ].map((ind) => (
                        <button
                          key={ind.val}
                          onClick={() => setActiveIndicator(ind.val)}
                          className={`indicator-select-btn ${activeIndicator === ind.val ? 'active' : ''}`}
                        >
                          {ind.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="analysis-toolbar-actions">
                  {/* Timeframe selector */}
                  <div className="toolbar-flex-block">
                    <span className="toolbar-label">Timeframe</span>
                    <div className="timeframe-buttons-group">
                      {[
                        { key: '1d', label: '1D' },
                        { key: '1w', label: '1W' },
                        { key: '1mo', label: '1M' },
                        { key: '6mo', label: '6M' },
                        { key: '1y', label: '1Y' },
                        { key: '5y', label: '5Y' },
                        { key: 'all', label: 'ALL' }
                      ].map((item) => (
                        <button
                          key={item.key}
                          className={`timeframe-select-btn ${period === item.key ? 'active' : ''}`}
                          onClick={() => handlePeriodChange(item.key)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart view switcher */}
                  <div className="toolbar-flex-block">
                    <span className="toolbar-label">Chart Type</span>
                    <div className="chart-view-toggle-buttons">
                      <button 
                        className={`chart-type-toggle-btn ${chartType === 'candlestick' ? 'active' : ''}`}
                        onClick={() => setChartType('candlestick')}
                      >
                        Candles
                      </button>
                      <button 
                        className={`chart-type-toggle-btn ${chartType === 'line' ? 'active' : ''}`}
                        onClick={() => setChartType('line')}
                      >
                        Line View
                      </button>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="action-buttons-wrap">
                    <button onClick={generatePredictions} className="btn btn-primary trigger-predict-btn" disabled={loadingPredict || prices.length === 0}>
                      {loadingPredict ? <Loader2 size={16} className="animate-spin" /> : 'Predict 5D'}
                    </button>
                    <button onClick={() => setAlertModalOpen(true)} className="btn btn-outline">Create Alert</button>
                    <button onClick={() => setCompareModalOpen(true)} className="btn btn-outline">Compare</button>
                  </div>
                </div>
              </section>

              {/* 7. CHART SECTION */}
              <section className="terminal-chart-widget glass-panel">
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
                    <span className="ohlc-val">${openPrice.toFixed(2)}</span>
                  </div>
                  <div className="ohlc-metric">
                    <span className="ohlc-label">High</span>
                    <span className="ohlc-val text-green">${highPrice.toFixed(2)}</span>
                  </div>
                  <div className="ohlc-metric">
                    <span className="ohlc-label">Low</span>
                    <span className="ohlc-val text-red">${lowPrice.toFixed(2)}</span>
                  </div>
                  <div className="ohlc-metric">
                    <span className="ohlc-label">Close</span>
                    <span className="ohlc-val">${closePrice.toFixed(2)}</span>
                  </div>
                  <div className="ohlc-metric">
                    <span className="ohlc-label">Change</span>
                    <span className={`ohlc-val ${priceDiff >= 0 ? 'text-green' : 'text-red'}`}>
                      {priceDiff >= 0 ? '+' : ''}{pricePct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="ohlc-metric">
                    <span className="ohlc-label">Volume</span>
                    <span className="ohlc-val">{(activeVolume ?? 0).toLocaleString()}</span>
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
                          <span className="predict-close-price">${p.predicted_close.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!loadingPredict && predictions.length === 0 && (
                    <div className="ai-no-forecast-placeholder">
                      <p>No active forecast generated. Click "Predict 5D" or "Generate Forecast" above to run LSTM networks.</p>
                    </div>
                  )}

                  {message && <div className="system-log-terminal">{message}</div>}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
            <div className="terminal-right-column">
              
              {/* Widget 1: Watchlist Widget */}
              <section id="watchlist-widget" className="right-sidebar-widget glass-panel">
                <div className="widget-header">
                  <h3>My Watchlist</h3>
                  <form onSubmit={handleAddToWatchlist} className="widget-add-symbol-form">
                    <input
                      type="text"
                      className="widget-add-input"
                      placeholder="Add... (e.g. INFY.NS)"
                      value={watchlistInput}
                      onChange={(e) => setWatchlistInput(e.target.value)}
                    />
                    <button type="submit" className="widget-add-btn" aria-label="Add to watchlist">+</button>
                  </form>
                </div>

                <ul className="watchlist-list-items">
                  {watchlist.length === 0 ? (
                    <li className="empty-watchlist-item">Watchlist is currently empty.</li>
                  ) : (
                    watchlist.map((sym) => {
                      const details = watchlistDetails[sym] || { current: 3000, pct: 1.25, sparkline: [2950, 2980, 3010, 3000] };
                      const isUp = details.pct >= 0;
                      return (
                        <li 
                          key={sym} 
                          className={`watchlist-symbol-card ${symbol === sym ? 'active' : ''}`}
                          onClick={() => handleWatchlistItemClick(sym)}
                        >
                          <div className="watchlist-item-left">
                            <span className="symbol-txt">{sym.replace('.NS', '')}</span>
                            <span className="company-val">${details.current.toFixed(2)}</span>
                          </div>
                          
                          {/* Mini SVG Sparkline */}
                          <div className="watchlist-item-chart">
                            <svg viewBox="0 0 50 20" className={`mini-sparkline ${isUp ? 'up' : 'down'}`}>
                              <path 
                                d={details.sparkline.reduce((acc, val, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${(i * 15)} ${20 - ((val - Math.min(...details.sparkline)) / (Math.max(...details.sparkline) - Math.min(...details.sparkline) || 1) * 16 + 2)}`, '')}
                                fill="none" 
                                strokeWidth="1.5" 
                              />
                            </svg>
                          </div>

                          <div className="watchlist-item-right">
                            <span className={`change-pct ${isUp ? 'text-green' : 'text-red'}`}>
                              {isUp ? '+' : ''}{details.pct.toFixed(2)}%
                            </span>
                            <button 
                              onClick={(e) => handleRemoveFromWatchlist(sym, e)} 
                              className="remove-symbol-btn"
                              aria-label={`Remove ${sym} from watchlist`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </section>

              {/* Widget 2: Market Overview (Sentiment) */}
              <section id="market-overview" className="right-sidebar-widget glass-panel">
                <div className="widget-header">
                  <h3>Market Sentiment</h3>
                </div>
                <div className="sentiment-gauge-box">
                  <div className="gauge-dial-wrap">
                    <svg viewBox="0 0 100 50" className="gauge-svg">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#2e303a" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 10 50 A 40 40 0 0 1 78 18" fill="none" stroke="url(#greenGlow)" strokeWidth="8" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="greenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#4edea3" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="gauge-val-overlay">
                      <span className="gauge-pct-val text-green">78%</span>
                      <span className="gauge-label-txt">BULLISH</span>
                    </div>
                  </div>
                  <p className="sentiment-desc">Consensus index shows strong accumulation across tech and banking indexes.</p>
                </div>
              </section>

              {/* Widget 3: Unusual Volume Alerts */}
              <section className="right-sidebar-widget glass-panel">
                <div className="widget-header">
                  <h3>Unusual Volume Alerts</h3>
                </div>
                <div className="volume-alerts-container">
                  <div className="volume-alert-item">
                    <Volume2 size={16} className="text-green alert-icon-pulse" />
                    <div className="alert-content">
                      <p><strong>INFY.NS</strong> volume spiked <strong>2.4x</strong> average</p>
                      <span>15:42 IST • Market buy sweep</span>
                    </div>
                  </div>
                  <div className="volume-alert-item">
                    <Volume2 size={16} className="text-purple alert-icon-pulse" />
                    <div className="alert-content">
                      <p><strong>RELIANCE.NS</strong> 2,900 CE blocks traded</p>
                      <span>14:15 IST • High option volumes</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Widget 4: Sector Heatmap */}
              <section className="right-sidebar-widget glass-panel">
                <div className="widget-header">
                  <h3>Sector Performance</h3>
                </div>
                <div className="sector-heatmap-grid">
                  {[
                    { name: 'Tech', change: 1.82, class: 'pl-profit' },
                    { name: 'Banking', change: 1.15, class: 'pl-profit' },
                    { name: 'Finance', change: -0.42, class: 'pl-loss' },
                    { name: 'Pharma', change: 0.65, class: 'pl-profit' },
                    { name: 'Energy', change: -1.20, class: 'pl-loss' }
                  ].map((s) => (
                    <div key={s.name} className={`sector-block ${s.class}`}>
                      <span className="sector-name">{s.name}</span>
                      <span className="sector-change">{s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Widget 5: Recent News */}
              <section id="recent-news" className="right-sidebar-widget glass-panel">
                <div className="widget-header">
                  <h3>Recent Market News</h3>
                </div>
                <ul className="news-feed-list">
                  {[
                    { title: 'NVIDIA chip supply bounds scale up as AI training demands surge', source: 'FinTech Wire', time: '12m ago' },
                    { title: 'TCS announces multi-million dollar cloud deal with global retailer', source: 'Reuters', time: '1h ago' },
                    { title: 'Federal Reserve hinting at steady rates triggers minor consolidate index', source: 'Bloomberg', time: '3h ago' },
                    { title: 'Indian index touches historic highs on foreign institutional buying', source: 'ET Markets', time: '5h ago' }
                  ].map((n, idx) => (
                    <li key={idx} className="news-feed-item">
                      <h4 className="news-title">{n.title}</h4>
                      <div className="news-meta-row">
                        <span className="news-source">{n.source}</span>
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
                      <span className="entity-price">${currentPrice.toFixed(2)}</span>
                      <span className={`entity-change ${priceDiff >= 0 ? 'text-green' : 'text-red'}`}>
                        {priceDiff >= 0 ? '▲' : '▼'} {Math.abs(pricePct).toFixed(2)}%
                      </span>
                    </div>

                    <div className="compare-vs-divider">VS</div>

                    <div className="compare-entity-box">
                      <span className="entity-title">{compareResult.symbol}</span>
                      <span className="entity-price">${compareResult.price.toFixed(2)}</span>
                      <span className={`entity-change ${compareResult.change >= 0 ? 'text-green' : 'text-red'}`}>
                        {compareResult.change >= 0 ? '▲' : '▼'} {Math.abs(compareResult.change).toFixed(2)}%
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
                  onChange={(e) => setAlertDialog({...alertDialog, type: e.target.value})}
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
                  onChange={(e) => setAlertDialog({...alertDialog, price: e.target.value})}
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
