import { useEffect, useState } from 'react';
import api from '../services/api';
import './MarketTicker.css';

const DEFAULT_TICKER_DATA = [
  { label: 'NIFTY 50', value: 23547.75, currency: '₹', change: -358.33, pct: -1.50 },
  { label: 'GOLD 22K (1G)', value: 12757.82, currency: '₹', change: 171.18, pct: 1.36 },
  { label: 'SILVER (1KG)', value: 230931.03, currency: '₹', change: -92.37, pct: -0.04 },
  { label: 'PETROL', value: 103.54, currency: '₹', change: 0.11, pct: 0.11 },
  { label: 'DIESEL', value: 90.03, currency: '₹', change: -0.05, pct: -0.06 },
  { label: 'CRUDE OIL', value: 92.05, currency: '$', change: -1.65, pct: -1.77 }
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
