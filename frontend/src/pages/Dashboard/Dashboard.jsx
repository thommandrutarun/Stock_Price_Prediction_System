import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ApexChartComponent from '../../components/ApexChartComponent';
import { Search, Loader2, Play, Plus, Trash2, Award } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
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

  // Sync search parameter from Global Nav Search
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
        const oldDefault = ['TCS.NS', 'AAPL', 'TSLA', 'RELIANCE.NS'];
        const isOldDefault = Array.isArray(parsed) && 
          parsed.length === oldDefault.length && 
          parsed.every((val, index) => val === oldDefault[index]);

        if (isOldDefault) {
          localStorage.setItem('watchlist', JSON.stringify([]));
          setWatchlist([]);
        } else {
          setWatchlist(parsed);
        }
      } catch (e) {
        setWatchlist([]);
      }
    } else {
      const defaultWatch = [];
      localStorage.setItem('watchlist', JSON.stringify(defaultWatch));
      setWatchlist(defaultWatch);
    }
  }, []);

  const loadHistoryData = async (sym = symbol, per = period) => {
    if (!sym || !sym.trim()) {
      return;
    }
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
          return false; // Keep polling
        } else {
          setPredictions(res.data.predictions || []);
          setIsTraining(false);
          setLoadingPredict(false);
          if (res.data.message) {
            setMessage(res.data.message);
          } else {
            setMessage('');
          }
          return true; // Stop polling
        }
      } catch (err) {
        setMessage(err.message || 'AI prediction generation failed');
        setPredictions([]);
        setLoadingPredict(false);
        setIsTraining(false);
        return true; // Stop polling
      }
    };

    // First attempt immediately
    const completed = await executePredictionQuery();
    if (!completed) {
      // Set up a polling interval every 4 seconds to retrieve model compilation outcome
      const pollTimer = setInterval(async () => {
        const done = await executePredictionQuery();
        if (done) {
          clearInterval(pollTimer);
        }
      }, 4000);
    }
  };

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

  const handleRemoveFromWatchlist = (sym, e) => {
    e.stopPropagation(); // prevent loading the stock on delete click
    const updated = watchlist.filter((w) => w !== sym);
    setWatchlist(updated);
    localStorage.setItem('watchlist', JSON.stringify(updated));
  };

  const handleWatchlistItemClick = (sym) => {
    setSymbol(sym);
    loadHistoryData(sym, period);
  };

  const handlePeriodChange = (per) => {
    setPeriod(per);
    loadHistoryData(symbol, per);
  };

  return (
    <div className="dashboard-page-container">
      <header className="dashboard-top-header">
        <h1>Stock Intelligence Terminal</h1>
        <p>Analyze technical charts, historical price timelines, and run optimized AI-powered LSTM forecasts.</p>
      </header>

      <div className="dashboard-grid-layout">
        {/* MAIN TERMINAL */}
        <section className="terminal-main-panel glass-panel">
          <div className="terminal-controls-card">
            <div className="screener-input-group">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="stock-symbol-input">Stock Symbol</label>
                <div className="symbol-search-input-wrap">
                  <Search size={16} className="search-symbol-icon" />
                  <input
                    id="stock-symbol-input"
                    type="text"
                    className="form-input symbol-input"
                    placeholder="e.g. TCS.NS or AAPL"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
              <button 
                onClick={() => loadHistoryData(symbol, period)} 
                className="btn btn-primary load-history-btn"
                disabled={loadingHistory}
              >
                {loadingHistory ? <Loader2 size={16} className="animate-spin" /> : 'Load Chart'}
              </button>
            </div>

            <div className="terminal-toolbar">
              <div className="timeframe-buttons">
                {['1d', '1w', '1mo', '3mo', '6mo', '1y', '3y', '5y', 'all'].map((per) => (
                  <button
                    key={per}
                    className={`timeframe-btn ${period === per ? 'active' : ''}`}
                    onClick={() => handlePeriodChange(per)}
                  >
                    {per.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="chart-view-toggles">
                <button
                  className={`toggle-btn ${chartType === 'candlestick' ? 'active' : ''}`}
                  onClick={() => setChartType('candlestick')}
                >
                  Candlesticks
                </button>
                <button
                  className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
                  onClick={() => setChartType('line')}
                >
                  Line View
                </button>
              </div>
            </div>
          </div>

          {/* DYNAMIC CHART SCREEN */}
          <div className="terminal-chart-screen glass-panel">
            {loadingHistory ? (
              <div className="chart-screen-loader">
                <Loader2 size={36} className="animate-spin text-primary" />
                <p>Downloading real-time feed and compiling historical index...</p>
              </div>
            ) : (
              <ApexChartComponent
                prices={prices}
                chartType={chartType}
                symbol={symbol}
              />
            )}
          </div>

          {/* AI PREDICTION MODULE */}
          <div className="terminal-ai-module-card glass-panel">
            <div className="ai-module-header">
              <div className="ai-module-title">
                <Award size={20} className="ai-medal-icon" />
                <h3>DeepStock Predictor AI</h3>
              </div>
              <p className="ai-module-subtitle">
                Deploy cached LSTM Neural Networks to forecast the next 5 intervals based on technical indicators.
              </p>
            </div>

            <div className="ai-controls-bar">
              <div className="ai-interval-selector">
                <span className="selector-title">Prediction Interval:</span>
                <div className="interval-btn-group">
                  {['1d', '1m', '5m', '15m'].map((intVal) => (
                    <button
                      key={intVal}
                      className={`int-btn ${interval === intVal ? 'active' : ''}`}
                      onClick={() => setIntervalVal(intVal)}
                    >
                      {intVal === '1d' ? '1 Day' : intVal === '1m' ? '1 Min' : intVal === '5m' ? '5 Min' : '15 Min'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generatePredictions}
                className="btn btn-primary run-ai-btn"
                disabled={loadingPredict || prices.length === 0}
              >
                {loadingPredict ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Compiling Tensor Network...
                  </>
                ) : (
                  <>
                    Generate Forecast <Play size={14} />
                  </>
                )}
              </button>
            </div>

            {loadingPredict && (
              <div className="ai-prediction-loading">
                <Loader2 size={24} className="animate-spin text-accent-purple" />
                <p>Initializing TensorFlow. Executing feed-forward prediction sequences...</p>
              </div>
            )}

            {!loadingPredict && predictions.length > 0 && (
              <div className="ai-predictions-display">
                <h4 className="forecast-results-title">AI Projected Outcomes</h4>
                <div className="forecast-outcomes-grid">
                  {predictions.map((p, idx) => (
                    <div className="forecast-outcome-card glass-panel" key={idx}>
                      <span className="outcome-step">STEP {idx + 1}</span>
                      <span className="outcome-date">{p.date}</span>
                      <span className="outcome-price">${p.predicted_close.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {message && <div className="terminal-log-banner">{message}</div>}
          </div>
        </section>

        {/* SIDEBAR WATCHLIST */}
        <aside className="terminal-sidebar">
          <div className="watchlist-card glass-panel">
            <h3 className="sidebar-section-title">My Watchlist</h3>
            
            <form onSubmit={handleAddToWatchlist} className="watchlist-add-form">
              <input
                type="text"
                className="form-input watchlist-add-input"
                placeholder="Symbol (e.g. INFY.NS)"
                value={watchlistInput}
                onChange={(e) => setWatchlistInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary add-watchlist-submit-btn">
                <Plus size={16} />
              </button>
            </form>

            <ul className="watchlist-items-list">
              {watchlist.map((sym) => (
                <li
                  key={sym}
                  className={`watchlist-item ${symbol === sym ? 'active' : ''}`}
                  onClick={() => handleWatchlistItemClick(sym)}
                >
                  <span className="watchlist-sym-txt">{sym}</span>
                  <button
                    onClick={(e) => handleRemoveFromWatchlist(sym, e)}
                    className="watchlist-item-delete-btn"
                    aria-label="Delete symbol"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
