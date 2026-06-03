import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Wallet, TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Trash2, Loader2, RefreshCw } from 'lucide-react';
import './Portfolio.css';

const Portfolio = () => {
  const { user, resetWallet } = useAuth();
  
  const [portfolioData, setPortfolioData] = useState({
    total_value: 0,
    total_invested: 0,
    wallet_balance: 0,
    positions: []
  });
  
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    avg_price: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/reports/portfolio');
      setPortfolioData(res.data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to download user portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletReset = async () => {
    setResetting(true);
    setMessage('');
    setErrorMsg('');
    try {
      const newBal = await resetWallet();
      setPortfolioData((prev) => ({
        ...prev,
        wallet_balance: newBal
      }));
      setMessage('Virtual wallet reset to $100,000.00 successfully.');
    } catch (err) {
      setErrorMsg(err.message || 'Reset balance execution failed');
    } finally {
      setResetting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');

    const { symbol, quantity, avg_price, purchase_date } = formData;
    if (!symbol || !quantity || !avg_price) {
      setErrorMsg('Symbol, quantity, and avg_price are required fields');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/reports/portfolio', {
        symbol: symbol.toUpperCase().trim(),
        quantity: parseInt(quantity),
        avg_price: parseFloat(avg_price),
        purchase_date
      });
      setMessage(`Successfully added position in ${symbol.toUpperCase()}`);
      setFormData({
        symbol: '',
        quantity: '',
        avg_price: '',
        purchase_date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
      loadPortfolio();
    } catch (err) {
      setErrorMsg(err.message || 'Manual entry creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePosition = async (sym) => {
    if (!window.confirm(`Are you sure you want to delete your position in ${sym}?`)) {
      return;
    }

    setErrorMsg('');
    setMessage('');
    try {
      await api.delete('/reports/portfolio', {
        data: { symbol: sym }
      });
      setMessage(`Position in ${sym} has been deleted successfully`);
      loadPortfolio();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove position');
    }
  };

  if (loading && portfolioData.positions.length === 0) {
    return (
      <div className="portfolio-loading-screen">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p>Assembling user positions. Synchronizing real-time market valuations...</p>
      </div>
    );
  }

  const overallPL = portfolioData.total_value - portfolioData.total_invested;
  const isOverallProfit = overallPL >= 0;

  return (
    <div className="portfolio-page-container">
      <header className="portfolio-top-header">
        <h1>My Virtual Portfolio</h1>
        <p>Track simulated capital growth, manage current positions, and monitor virtual trades returns.</p>
      </header>

      {message && <div className="portfolio-success-banner">{message}</div>}
      {errorMsg && <div className="portfolio-error-banner">{errorMsg}</div>}

      {/* METRICS GRID */}
      <section className="portfolio-metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-label">Current Value</span>
            <DollarSign size={20} className="metric-icon val-icon" />
          </div>
          <span className="metric-value">${portfolioData.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-label">Invested Capital</span>
            <DollarSign size={20} className="metric-icon inv-icon" />
          </div>
          <span className="metric-value">${portfolioData.total_invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-header">
            <span className="metric-label">Overall Profit / Loss</span>
            {isOverallProfit ? <TrendingUp size={20} className="metric-icon pl-profit" /> : <TrendingDown size={20} className="metric-icon pl-loss" />}
          </div>
          <span className={`metric-value ${isOverallProfit ? 'pl-profit' : 'pl-loss'}`}>
            {isOverallProfit ? '+' : ''}${overallPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="metric-card glass-panel wallet-card-metric">
          <div className="metric-header">
            <span className="metric-label">Virtual Wallet (USD)</span>
            <Wallet size={20} className="metric-icon wal-icon-metric" />
          </div>
          <div className="wallet-funds-row">
            <span className="metric-value">${portfolioData.wallet_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <button 
              onClick={handleWalletReset} 
              className="btn btn-outline reset-wallet-btn-metric"
              disabled={resetting}
              title="Reset Wallet Balance to $100,000.00"
              aria-label="Reset virtual wallet balance"
            >
              {resetting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            </button>
          </div>
        </div>
      </section>

      {/* POSITIONS TABLE */}
      <section className="portfolio-positions-card glass-panel">
        <div className="positions-card-header">
          <h3>Open Positions</h3>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary add-pos-toggle-btn">
            <Plus size={16} /> Add Position
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleFormSubmit} className="add-pos-form glass-panel">
            <h4>Manual Asset Entry</h4>
            <div className="add-pos-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="pos-sym">Stock Symbol</label>
                <input
                  id="pos-sym"
                  name="symbol"
                  type="text"
                  className="form-input"
                  placeholder="e.g. INFY.NS"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pos-qty">Quantity</label>
                <input
                  id="pos-qty"
                  name="quantity"
                  type="number"
                  className="form-input"
                  placeholder="e.g. 10"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pos-avg">Avg Purchase Price</label>
                <input
                  id="pos-avg"
                  name="avg_price"
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="Purchase price per share"
                  value={formData.avg_price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pos-date">Purchase Date</label>
                <div className="symbol-search-input-wrap">
                  <Calendar size={16} className="search-symbol-icon" />
                  <input
                    id="pos-date"
                    name="purchase_date"
                    type="date"
                    className="form-input symbol-input"
                    value={formData.purchase_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="add-pos-form-actions">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Add'}
              </button>
            </div>
          </form>
        )}

        {portfolioData.positions.length === 0 ? (
          <div className="portfolio-empty-banner">
            <p>Your portfolio is currently empty. Start virtual trading or add manual positions above!</p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className="portfolio-positions-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Quantity</th>
                  <th>Avg Price</th>
                  <th>Latest Price</th>
                  <th>Current Value</th>
                  <th>Profit / Loss</th>
                  <th>P&L %</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.positions.map((pos) => {
                  const isProfit = pos.profit_loss >= 0;
                  return (
                    <tr key={pos.id}>
                      <td className="pos-symbol-col">{pos.symbol}</td>
                      <td>{pos.quantity}</td>
                      <td>${pos.avg_price.toFixed(2)}</td>
                      <td>${pos.latest_price.toFixed(2)}</td>
                      <td>${pos.current_value.toFixed(2)}</td>
                      <td className={isProfit ? 'pl-profit' : 'pl-loss'}>
                        {isProfit ? '+' : ''}${pos.profit_loss.toFixed(2)}
                      </td>
                      <td className={isProfit ? 'pl-profit' : 'pl-loss'}>
                        {isProfit ? '▲' : '▼'} {Math.abs(pos.change_pct).toFixed(2)}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeletePosition(pos.symbol)}
                          className="watchlist-item-delete-btn"
                          title="Delete position"
                          aria-label={`Delete position for ${pos.symbol}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Portfolio;
