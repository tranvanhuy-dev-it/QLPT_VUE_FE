import api from './api';

export default {
  getLandlords(params) {
    return api.get('/api/admin/landlords', { params });
  },
  toggleLandlordStatus(id) {
    return api.post(`/api/admin/landlords/${id}/toggle`);
  },
  getStatistics() {
    return api.get('/api/admin/statistics');
  }
};
