import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2, TrendingUp } from 'lucide-react';
import './MarketInsights.css';

const MarketInsights = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="market-insights-page" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <header className="page-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: 0 }}>Market Analytics & Insights</h1>
          <p style={{ color: 'var(--db-text-variant)', fontSize: '0.88rem', margin: '4px 0 0' }}>
            Real-time market sentiment gauges, unusual volume alerts, and sector-wide heatmap metrics.
          </p>
        </div>
        <button onClick={handleRefresh} className="btn-compare" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
        </button>
      </header>

      <div className="insights-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* SENTIMENT OVERVIEW CARD */}
        <section className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>Overall Sentiment</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--db-text-variant)' }}>Updated just now</span>
          </div>

          <div className="sentiment-mockup-box" style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sentiment-info">
              <span className="sentiment-large-status text-green" style={{ color: 'var(--db-primary)', fontSize: '1.8rem', fontWeight: '900' }}>BULLISH</span>
              <p className="sentiment-desc" style={{ color: 'var(--db-text-variant)', fontSize: '0.82rem', margin: '4px 0 0' }}>
                Technical momentum shows strong buying support across large-cap equities.
              </p>
            </div>
            <div className="sentiment-bull-svg-box" style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.15))' }}>
              <svg viewBox="0 0 100 100" width="70" height="70" className="neon-bull-svg">
                <path d="M15 45 L25 40 L35 35 L40 45 L50 40 L60 48 L65 40 L75 42 L80 35 L85 45 L75 60 L60 62 L45 58 L30 60 L20 52 Z" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 45 L10 40 Q5 35 15 30 Q25 25 35 35" fill="none" stroke="#10b981" strokeWidth="2.5" />
                <path d="M85 45 L90 40 Q95 35 85 30 Q75 25 65 35" fill="none" stroke="#10b981" strokeWidth="2.5" />
                <circle cx="38" cy="38" r="2" fill="#10b981" />
                <circle cx="62" cy="38" r="2" fill="#10b981" />
                <path d="M42 50 Q50 55 58 50" fill="none" stroke="#10b981" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          <div className="sentiment-meter-gauge-panel" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--db-text-variant)', fontWeight: '700' }}>
              <span>FEAR (28)</span>
              <span>GREED (72)</span>
            </div>
            <div className="sentiment-progress-bar-track" style={{ height: '8px', background: 'var(--db-surface-low)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
              <div className="sentiment-progress-fill" style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #ef4444 0%, #eab308 50%, #10b981 100%)', borderRadius: '4px' }}></div>
            </div>
          </div>
        </section>

        {/* UNUSUAL VOLUME DETECTOR CARD */}
        <section className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>Unusual Volume Scans</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { sym: 'NVIDIA', multiple: '2.8x', desc: 'Unusual options block sweeps detected', type: 'info' },
              { sym: 'TCS.NS', multiple: '1.9x', desc: 'Pre-market block volume surge', type: 'warning' },
              { sym: 'TESLA', multiple: '2.1x', desc: 'Breakout above average trading volume', type: 'info' }
            ].map((v, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--db-outline)', padding: '10px', borderRadius: '8px' }}>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{v.sym} <span style={{ color: '#eab308' }}>({v.multiple})</span></strong>
                  <p style={{ color: 'var(--db-text-variant)', fontSize: '0.78rem', margin: '2px 0 0' }}>{v.desc}</p>
                </div>
                <div className="check-icon-circle" style={{ background: 'rgba(16, 185, 129, 0.12)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTOR HEATMAP CARD */}
        <section className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>Sector Heatmap</h3>
          <div className="sector-heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px' }}>
            {[
              { name: 'Tech', change: 1.42, class: 'pl-profit' },
              { name: 'Finance', change: 0.67, class: 'pl-profit' },
              { name: 'Pharma', change: -0.25, class: 'pl-loss' },
              { name: 'Energy', change: 1.12, class: 'pl-profit' },
              { name: 'Auto', change: -0.85, class: 'pl-loss' },
              { name: 'FMCG', change: 0.15, class: 'pl-profit' }
            ].map((s) => (
              <div key={s.name} className={`sector-block ${s.class}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 6px', borderRadius: '8px', border: '1px solid var(--db-border-glass)' }}>
                <span className="sector-name" style={{ fontSize: '0.78rem', fontWeight: '700' }}>{s.name}</span>
                <span className="sector-change" style={{ fontSize: '0.8rem', fontWeight: '800', marginTop: '4px' }}>
                  {s.change >= 0 ? '+' : ''}{Number(s.change).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* TECHNICAL INDICATORS MATRIX */}
      <section className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: '0 0 1rem' }}>Core Index Technical Status</h3>
        <div className="tx-list-responsive-container">
          <table className="tx-list-table">
            <thead>
              <tr>
                <th>Index Ticker</th>
                <th>Current Level</th>
                <th>RSI (14)</th>
                <th>MACD Signal</th>
                <th>Bollinger Band Position</th>
                <th>Overall Outlook</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'NIFTY 50', val: '22,547.80', rsi: '62.4 (Neutral)', macd: 'Bullish Crossover', bb: 'Upper Band Resistance', trend: 'Neutral-Bullish', isProfit: true },
                { label: 'SENSEX', val: '74,313.69', rsi: '59.1 (Neutral)', macd: 'Positive divergence', bb: 'Midline Support', trend: 'Bullish', isProfit: true },
                { label: 'NASDAQ', val: '16,742.30', rsi: '71.5 (Overbought)', macd: 'Slow momentum', bb: 'Upper Band Breakout', trend: 'Correction Risk', isProfit: false }
              ].map((i, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '700', color: '#fff' }}>{i.label}</td>
                  <td>{i.val}</td>
                  <td>{i.rsi}</td>
                  <td style={{ color: i.isProfit ? 'var(--db-primary)' : 'var(--db-secondary)', fontWeight: '600' }}>{i.macd}</td>
                  <td>{i.bb}</td>
                  <td>
                    <span className={`kpi-change-tag ${i.isProfit ? 'pl-profit' : 'pl-loss'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {i.isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {i.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MarketInsights;
