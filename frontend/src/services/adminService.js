import api from './api';

export const adminService = {
  async getUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async deleteUser(userId) {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },

  async promoteUser(userId) {
    const res = await api.post('/admin/promote', { user_id: userId });
    return res.data;
  },

  async revokeUser(userId) {
    const res = await api.post('/admin/revoke', { user_id: userId });
    return res.data;
  },

  async getLogs() {
    const res = await api.get('/admin/logs');
    return res.data;
  },

  async getMessages() {
    const res = await api.get('/admin/messages');
    return res.data;
  },

  async getStats() {
    const res = await api.get('/admin/system-stats');
    return res.data;
  }
};

export default adminService;
