import api from './api';

export const aiService = {
  async getPredictions(symbol, days = 5, interval = '1d') {
    const res = await api.get(`/stocks/${symbol}/predict`, { params: { days, interval } });
    return res.data;
  }
};

export default aiService;
