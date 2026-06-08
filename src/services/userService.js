import api from './api';

export default {
  getProfile() {
    return api.get('/api/users/profile');
  },
  updateProfile(data) {
    return api.put('/api/users/profile', data);
  },
  changePassword(data) {
    return api.post('/api/users/change-password', data);
  },
  resetPassword(userId) {
    return api.post(`/api/users/${userId}/reset-password`);
  },
  getTenant(id) {
    return api.get(`/api/users/tenants/${id}`);
  }
};
