import api from './api';

export const stockService = {
  async getHistory(symbol, period) {
    const res = await api.get(`/stocks/${symbol}/history`, { params: { period } });
    return res.data;
  },

  async getQuote(symbol) {
    const res = await api.get(`/stocks/${symbol}/quote`);
    return res.data;
  }
};

export default stockService;
