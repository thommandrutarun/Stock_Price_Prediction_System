import api from './api';

export const tradeService = {
  async buy(symbol, quantity) {
    const res = await api.post('/trade/buy', { symbol, quantity });
    return res.data;
  },

  async sell(symbol, quantity) {
    const res = await api.post('/trade/sell', { symbol, quantity });
    return res.data;
  },

  async getTransactions() {
    const res = await api.get('/trade/transactions');
    return res.data;
  }
};

export default tradeService;
