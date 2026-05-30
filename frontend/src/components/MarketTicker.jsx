import { useEffect, useState } from 'react';
import api from '../services/api';
import './MarketTicker.css';

const MarketTicker = () => {
  const [tickerData, setTickerData] = useState([]);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await api.get('/market/ticker');
        if (res.data && Array.isArray(res.data)) {
          setTickerData(res.data);
        } else {
          setTickerData([]);
        }
      } catch (err) {
        console.error('Failed to load market ticker:', err);
        setTickerData([]);
      }
    };

    fetchTicker();
    const interval = setInterval(fetchTicker, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (tickerData.length === 0) {
    return (
      <div className="ticker-wrap-react">
        <div className="ticker-heading-react">MARKET UPDATES</div>
        <div className="ticker-static-loading">Connecting to market streams...</div>
      </div>
    );
  }

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
              <span className="ticker-item-react" key={idx}>
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
