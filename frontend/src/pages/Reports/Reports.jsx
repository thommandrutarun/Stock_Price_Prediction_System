import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, TrendingUp, DollarSign, Loader2, RefreshCw } from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ positions: [], total_value: 0, total_invested: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/portfolio');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-page-container">
      <header className="portfolio-top-header">
        <h1>Financial Statements & Reports</h1>
        <p>Analyze your closed positions, current ledger valuations, and export virtual statement details.</p>
      </header>

      {loading ? (
        <div className="portfolio-loading-screen">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p>Compiling report statements...</p>
        </div>
      ) : (
        <div className="portfolio-positions-card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
          <div className="positions-card-header">
            <h3>Statement Ledger</h3>
            <button onClick={loadData} className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <RefreshCw size={14} /> Refresh Statement
            </button>
          </div>

          <div className="table-responsive-container">
            <table className="portfolio-positions-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Quantity Owned</th>
                  <th>Avg Cost</th>
                  <th>Current Market price</th>
                  <th>Total Cost Basis</th>
                  <th>Current Valuation</th>
                  <th>Unrealized Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {data.positions.map((pos) => {
                  const isProfit = pos.profit_loss >= 0;
                  return (
                    <tr key={pos.id}>
                      <td className="pos-symbol-col">{pos.symbol}</td>
                      <td>{pos.quantity}</td>
                      <td>${parseFloat(pos.avg_price).toFixed(2)}</td>
                      <td>${parseFloat(pos.latest_price).toFixed(2)}</td>
                      <td>${(pos.quantity * parseFloat(pos.avg_price)).toFixed(2)}</td>
                      <td>${parseFloat(pos.current_value).toFixed(2)}</td>
                      <td style={{ color: isProfit ? 'var(--success)' : 'var(--error)', fontWeight: 'bold' }}>
                        {isProfit ? '+' : ''}${parseFloat(pos.profit_loss).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
                {data.positions.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                      No positions active to compile statements. Execute a trade first!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
