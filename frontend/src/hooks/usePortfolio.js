import { useState } from 'react';
import api from '../services/api';

export const usePortfolio = () => {
  const [data, setData] = useState({ total_value: 0, total_invested: 0, wallet_balance: 0, positions: [] });
  const [loading, setLoading] = useState(false);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/portfolio');
      setData(res.data);
      return res.data;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    loadPortfolio
  };
};

export default usePortfolio;
