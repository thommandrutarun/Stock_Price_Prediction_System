import { useState } from 'react';
import { Search, Bell, AlertTriangle, ArrowUpRight, ArrowRight } from 'lucide-react';
import './NewsPage.css';

const initialNews = [
  {
    title: 'TCS Q4 Results Beat Estimates, Revenue Grows 3.1% QoQ',
    source: 'Moneycontrol',
    time: '2h ago',
    color: '#2563eb',
    category: 'Equities',
    summary: 'Tata Consultancy Services beats analyst estimations with high cloud operations billing and margins, raising dividends to investors.'
  },
  {
    title: 'IT Stocks Rally as Market Sentiment Improves',
    source: 'Economic Times',
    time: '4h ago',
    color: '#dc2626',
    category: 'Equities',
    summary: 'Broad buying interest returns to Indian tech giants, with INFY and Wipro leading intraday indices spikes.'
  },
  {
    title: 'RBI Holds Rates Steady, Inflation Eases',
    source: 'LiveMint',
    time: '6h ago',
    color: '#d97706',
    category: 'Policy',
    summary: 'The Reserve Bank of India keeps the repo rate unchanged at 6.5%, citing gradual stabilization of domestic consumer index projections.'
  },
  {
    title: 'Unusual Option Sweeps Volume Detected in NVIDIA',
    source: 'Bloomberg',
    time: '8h ago',
    color: '#10b981',
    category: 'Global Markets',
    summary: 'Option contract sweeps suggest major institutions are positioning for high volatility ahead of the upcoming developer conference.'
  },
  {
    title: 'DeepStock AI Releases Optimized LSTM Forecast Layers',
    source: 'AI Analytics',
    time: '12h ago',
    color: '#8b5cf6',
    category: 'AI Analytics',
    summary: 'New LSTM neural networks weights training models optimize RMSE loss parameters, delivering accurate 5D stock close targets.'
  },
  {
    title: 'Federal Reserve Signals Interest Rate Cuts in Q4',
    source: 'Bloomberg',
    time: '18h ago',
    color: '#10b981',
    category: 'Global Markets',
    summary: 'US Federal Reserve Chairman hints at scaling back restrictive interest rates as inflation trends downward toward 2.1% benchmarks.'
  }
];

const NewsPage = () => {
  const [newsList, setNewsList] = useState(initialNews);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Equities', 'AI Analytics', 'Policy', 'Global Markets'];

  const filteredNews = newsList.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="news-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <header className="page-section-header">
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: 0 }}>Financial Market News</h1>
        <p style={{ color: 'var(--db-text-variant)', fontSize: '0.88rem', margin: '4px 0 0' }}>
          Real-time global news feed. Filter through corporate earnings reports, AI analytics announcements, and economic policy releases.
        </p>
      </header>

      {/* FILTER CONTROLS BAR */}
      <section className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="news-category-chips" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <button
              key={c}
              className={`quick-timeframe-btn ${selectedCategory === c ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c)}
              style={{ padding: '6px 14px', borderRadius: '20px' }}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="header-search-box" style={{ width: '280px', margin: 0 }}>
          <Search size={16} className="search-icon-header" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ height: '36px' }}
          />
        </div>
      </section>

      {/* NEWS CARDS GRID */}
      {filteredNews.length === 0 ? (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 1rem', textAlign: 'center' }}>
          <AlertTriangle size={32} style={{ color: 'var(--db-secondary)', marginBottom: '10px' }} />
          <h4 style={{ color: '#fff', margin: '0 0 4px' }}>No Matching Articles</h4>
          <p style={{ color: 'var(--db-text-variant)', fontSize: '0.85rem' }}>
            Try adjusting your search query or switching categories.
          </p>
        </div>
      ) : (
        <div className="news-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredNews.map((n, idx) => (
            <article key={idx} className="glass-panel news-feed-item" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="kpi-change-tag pl-profit accent-blue-badge" style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                  {n.category}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--db-text-variant)' }}>{n.time}</span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: '4px 0 0', lineHeight: '1.4' }}>
                {n.title}
              </h3>

              <p style={{ color: 'var(--db-text-variant)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0, flex: 1 }}>
                {n.summary}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--db-border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="news-source-badge" style={{ backgroundColor: n.color, margin: 0 }}>{n.source[0]}</span>
                  <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '600' }}>{n.source}</span>
                </div>

                <a href="#read" className="view-all-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Read Article</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsPage;
