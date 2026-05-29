import { useState, useEffect } from 'react';
import stockService from '../services/stockService';

export const useStocks = (initialSymbol = 'TCS.NS') => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [watchlist, setWatchlist] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('watchlist');
    if (stored) {
      try { setWatchlist(JSON.parse(stored)); } catch (e) { setWatchlist([]); }
    }
  }, []);

  const fetchQuote = async (sym) => {
    setLoading(true);
    try {
      const data = await stockService.getQuote(sym);
      setQuote(data);
      return data;
    } catch (e) {
      console.error(e);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = (sym) => {
    const cleanSym = sym.toUpperCase().trim();
    if (!watchlist.includes(cleanSym)) {
      const updated = [...watchlist, cleanSym];
      setWatchlist(updated);
      localStorage.setItem('watchlist', JSON.stringify(updated));
    }
  };

  const removeFromWatchlist = (sym) => {
    const updated = watchlist.filter(w => w !== sym);
    setWatchlist(updated);
    localStorage.setItem('watchlist', JSON.stringify(updated));
  };

  return {
    symbol,
    setSymbol,
    watchlist,
    quote,
    loading,
    fetchQuote,
    addToWatchlist,
    removeFromWatchlist
  };
};

export default useStocks;
