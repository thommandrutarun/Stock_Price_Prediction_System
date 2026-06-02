import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Loader2, ArrowRightLeft, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './Trade.css';

const Trade = () => {
  const { user, updateWalletBalance } = useAuth();
  
  const [symbol, setSymbol] = useState('TCS.NS');
  const [quote, setQuote] = useState(null);
  const [tradeMode, setTradeMode] = useState('BUY'); // 'BUY' or 'SELL'
  const [quantity, setQuantity] = useState('1');
  
  const [holdings, setHoldings] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submittingTrade, setSubmittingTrade] = useState(false);
  const [loadingTx, setLoadingTx] = useState(true);
  
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Initial load
  useEffect(() => {
    fetchQuote(symbol);
    loadTransactions();
  }, []);

  const fetchQuote = async (sym = symbol) => {
    if (!sym) return;
    setLoadingQuote(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/stocks/${sym}/quote`);
      setQuote(res.data);
      fetchOwnedHoldings(sym);
    } catch (err) {
      setErrorMsg(err.message || 'Error downloading stock quote feed');
      setQuote(null);
    } finally {
      setLoadingQuote(false);
    }
  };

  const fetchOwnedHoldings = async (sym) => {
    try {
      const res = await api.get('/reports/portfolio');
      const positions = res.data.positions || [];
      const match = positions.find((p) => p.symbol === sym.toUpperCase());
      setHoldings(match ? match.quantity : 0);
    } catch (err) {
      setHoldings(0);
    }
  };

  const loadTransactions = async () => {
    setLoadingTx(true);
    try {
      const res = await api.get('/trade/transactions');
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  const handleExecuteTrade = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');

    if (!quote || quote.price <= 0) {
      setErrorMsg('Cannot trade an invalid quote');
      return;
    }

    const qtyInt = parseInt(quantity);
    if (isNaN(qtyInt) || qtyInt <= 0) {
      setErrorMsg('Please specify a positive integer quantity');
      return;
    }

    setSubmittingTrade(true);
    try {
      const endpoint = tradeMode === 'BUY' ? '/trade/buy' : '/trade/sell';
      const res = await api.post(endpoint, {
        symbol: quote.symbol,
        quantity: qtyInt
      });

      // Update wallet balance in Auth state
      updateWalletBalance(res.data.new_balance);
      setMessage(res.data.message);
      
      // Sync owned holdings and transactions lists
      fetchOwnedHoldings(quote.symbol);
      loadTransactions();
      setQuantity('1');
    } catch (err) {
      setErrorMsg(err.message || 'Execution error');
    } finally {
      setSubmittingTrade(false);
    }
  };

  // Pricing & currency conversion computations
  const isIndianMarket = symbol.toUpperCase().endsWith('.NS') || symbol.toUpperCase().endsWith('.BO');
  const currencySymbol = isIndianMarket ? '₹' : '$';
  const exchangeRate = isIndianMarket ? 84.0 : 1.0;
  
  const unitPriceNative = quote ? quote.price : 0;
  const qtyNum = parseInt(quantity) || 0;
  
  const totalNative = unitPriceNative * qtyNum;
  const totalUSD = totalNative / exchangeRate;

  const currentWalletBalance = user?.wallet_balance || 0;
  const isSufficientFunds = tradeMode === 'SELL' || currentWalletBalance >= totalUSD;
  const isSufficientShares = tradeMode === 'BUY' || holdings >= qtyNum;

  return (
    <div className="trade-page-container">
      <header className="trade-top-header">
        <h1>Simulated Trading Floor</h1>
        <p>Execute instant virtual transactions with real-time currency conversions and market quotes.</p>
      </header>

      {message && <div className="trade-success-banner">{message}</div>}
      {errorMsg && <div className="trade-error-banner">{errorMsg}</div>}

      <div className="trade-grid-layout">
        
        {/* TRADING FORM SHELL */}
        <section className="trade-actions-panel glass-panel">
          <h3 className="terminal-panel-title">Order Terminal</h3>

          <div className="quote-search-wrapper" style={{ marginTop: '0.5rem' }}>
            <div className="form-group flex-1" style={{ marginBottom: 0 }}>
              <div className="symbol-search-input-wrap">
                <Search size={16} className="search-symbol-icon" />
                <input
                  id="trade-symbol-input"
                  name="symbol"
                  type="text"
                  className="form-input symbol-input"
                  placeholder="Enter Stock Symbol (e.g. RELIANCE.NS)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                />
              </div>
            </div>
            <button onClick={() => fetchQuote(symbol)} className="btn btn-primary" disabled={loadingQuote}>
              {loadingQuote ? <Loader2 size={16} className="animate-spin" /> : 'Get Quote'}
            </button>
          </div>

          {loadingQuote ? (
            <div className="quote-loader-panel">
              <Loader2 size={28} className="animate-spin text-primary" />
              <p>Fetching real-time exchange feeds...</p>
            </div>
          ) : quote ? (
            <div className="quote-outcome-display glass-panel">
              <div className="quote-info-header">
                <div>
                  <span className="quote-symbol-badge">{quote.symbol}</span>
                  <span className="quote-currency-tag">{isIndianMarket ? 'NSE/BSE (INR)' : 'NYSE/NASDAQ (USD)'}</span>
                </div>
                <div className="quote-price-tag">
                  {currencySymbol}{quote.price.toFixed(2)}
                </div>
              </div>

              <div className="quote-change-row">
                <span className="info-label">Today's Performance:</span>
                <span className={`quote-change-pct ${quote.change >= 0 ? 'txt-profit' : 'txt-loss'}`}>
                  {quote.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.percent.toFixed(2)}%)
                </span>
              </div>

              <div className="quote-holdings-row">
                <span>Shares in Portfolio:</span>
                <span className="holding-qty-badge">{holdings} Shares</span>
              </div>
            </div>
          ) : (
            <div className="quote-empty-outcome">
              <p>Enter a ticker symbol and query quote details to launch buy/sell transactions.</p>
            </div>
          )}

          {/* TRADE ACTIONS PANEL */}
          {quote && (
            <form onSubmit={handleExecuteTrade} className="trade-execution-form">
              <div className="trade-mode-toggle-group">
                <button
                  type="button"
                  className={`mode-toggle-btn buy-btn ${tradeMode === 'BUY' ? 'active' : ''}`}
                  onClick={() => setTradeMode('BUY')}
                >
                  BUY ASSET
                </button>
                <button
                  type="button"
                  className={`mode-toggle-btn sell-btn ${tradeMode === 'SELL' ? 'active' : ''}`}
                  onClick={() => setTradeMode('SELL')}
                >
                  SELL ASSET
                </button>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="trade-qty-input">Shares Quantity</label>
                <input
                  id="trade-qty-input"
                  name="quantity"
                  type="number"
                  min="1"
                  className="form-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              {/* DYNAMIC SUMMARIES */}
              <div className="trade-totals-summary glass-panel">
                <div className="summary-row">
                  <span className="summary-lbl">Unit Cost:</span>
                  <span>{currencySymbol}{unitPriceNative.toFixed(2)}</span>
                </div>
                
                {isIndianMarket && (
                  <div className="summary-row">
                    <span className="summary-lbl">Subtotal (INR):</span>
                    <span>₹{totalNative.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="summary-row conversion-row">
                  <span className="summary-lbl font-bold">Total Order Cost (USD):</span>
                  <span className="usd-bold-total">${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="summary-row wallet-balance-preview">
                  <span className="summary-lbl">Available Wallet:</span>
                  <span className="preview-wallet-amount">${currentWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* WARNING LABELS */}
              {!isSufficientFunds && (
                <div className="order-warning-banner">
                  Warning: Insufficient simulated funds to complete this order.
                </div>
              )}
              {!isSufficientShares && (
                <div className="order-warning-banner">
                  Warning: Insufficient shares owned to fulfill this sell order.
                </div>
              )}

              <button
                type="submit"
                className={`btn w-full trade-submit-action-btn ${tradeMode === 'BUY' ? 'action-buy' : 'action-sell'}`}
                disabled={submittingTrade || !isSufficientFunds || !isSufficientShares}
              >
                {submittingTrade ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Transacting Order...
                  </>
                ) : (
                  <>
                    {tradeMode === 'BUY' ? 'Execute Buy Order' : 'Execute Sell Order'} <ArrowRightLeft size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* RECENT TRANSACTIONS TABLE */}
        <section className="trade-history-panel glass-panel">
          <div className="history-panel-header">
            <FileText size={20} className="history-icon" />
            <h3>Transaction Log</h3>
          </div>

          {loadingTx ? (
            <div className="tx-loader-panel">
              <Loader2 size={24} className="animate-spin text-primary" />
              <p>Syncing log reports...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="tx-empty-panel">
              <p>No transaction history recorded yet on this account.</p>
            </div>
          ) : (
            <div className="tx-list-responsive-container">
              <table className="tx-list-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isBuy = tx.type === 'BUY';
                    const txIndian = tx.symbol.endsWith('.NS') || tx.symbol.endsWith('.BO');
                    const txCurr = txIndian ? '₹' : '$';
                    return (
                      <tr key={tx.id}>
                        <td className="tx-sym-bold">{tx.symbol}</td>
                        <td className={isBuy ? 'tx-badge-buy' : 'tx-badge-sell'}>
                          <span className="type-badge-indicator">{tx.type}</span>
                        </td>
                        <td>{tx.quantity}</td>
                        <td>{txCurr}{parseFloat(tx.price).toFixed(2)}</td>
                        <td className="tx-date-txt">{tx.timestamp.split(' ')[0]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Trade;
