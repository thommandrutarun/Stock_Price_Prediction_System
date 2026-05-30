import api from './api';

export const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async register(name, email, password, phone, dob, profession) {
    const res = await api.post('/auth/register', { name, email, password, phone, dob, profession });
    return res.data;
  },

  async forgotPassword(email, phone, dob, newPassword) {
    const res = await api.post('/auth/forgot-password', { email, phone, dob, new_password: newPassword });
    return res.data;
  },

  async resetWallet() {
    const res = await api.post('/wallet/reset');
    return res.data;
  }
};

export default authService;
