import { useEffect, useState } from 'react';
import api from '../services/api';
import './MarketTicker.css';

const DEFAULT_TICKER_DATA = [
  { label: 'NIFTY 50', value: 23547.75, currency: '₹', change: 96.15, pct: 0.41 },
  { label: 'SENSEX', value: 76456.80, currency: '₹', change: -137.60, pct: -0.18 },
  { label: 'BANKNIFTY', value: 49870.25, currency: '₹', change: 355.20, pct: 0.72 },
  { label: 'GOLD', value: 72150.00, currency: '₹', change: 180.00, pct: 0.25 }
];

const MarketTicker = () => {
  const [tickerData, setTickerData] = useState(DEFAULT_TICKER_DATA);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await api.get('/market/ticker');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setTickerData(res.data);
        }
      } catch (err) {
        console.error('Failed to load market ticker:', err);
      }
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Duplicate items for continuous scrolling loop
  const scrollItems = [...tickerData, ...tickerData, ...tickerData];

  return (
    <div className="ticker-wrap-react">
      <div className="ticker-heading-react">MARKET UPDATES</div>
      <div className="ticker-container-react">
        <div className="ticker-scroller-react">
          {scrollItems.map((item, idx) => {
            const isUp = item.change >= 0;
            return (
              <span className={`ticker-item-react ${item.label === 'PETROL' || item.label === 'DIESEL' ? 'ticker-item-low-priority' : ''}`} key={idx}>
                <span className="ticker-label-react">{item.label}</span>
                <span className="ticker-value-react">
                  {item.currency}{parseFloat(item.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`ticker-change-react ${isUp ? 'ticker-up' : 'ticker-down'}`}>
                  {isUp ? '▲' : '▼'} {item.pct !== undefined ? `${Math.abs(item.pct).toFixed(2)}%` : `${Math.abs(item.change).toFixed(2)}`}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
