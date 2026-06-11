import api from './api';

export default {
  getProfile() {
    return api.get('/api/users/profile');
  },
  updateProfile(data) {
    return api.put('/api/users/profile', data);
  },
  updateImouSettings(data) {
    return api.put('/api/users/imou-settings', data);
  },
  changePassword(data) {
    return api.post('/api/users/change-password', data);
  },
  resetPassword(userId) {
    return api.post(`/api/users/${userId}/reset-password`);
  },
  getTenant(id) {
    return api.get(`/api/users/tenants/${id}`);
  },
  getLoginHistory() {
    return api.get('/api/users/login-history');
  },
  revokeSession(id) {
    return api.delete(`/api/users/login-history/${id}`);
  }
};
