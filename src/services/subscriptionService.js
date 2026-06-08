import api from './api.js';

export default {
  // Landlord endpoints
  createRequest(months) {
    return api.post('/api/subscriptions/request', { months });
  },
  
  getMyRequests() {
    return api.get('/api/subscriptions/my-requests');
  },
  
  getActiveStatus() {
    return api.get('/api/subscriptions/active-status');
  },
  
  // Admin endpoints
  getAdminRequests(status = '', page = 0, size = 10) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page);
    params.append('size', size);
    return api.get(`/api/subscriptions/admin/requests?${params.toString()}`);
  },
  
  approveRequest(id) {
    return api.post(`/api/subscriptions/admin/requests/${id}/approve`);
  },
  
  rejectRequest(id) {
    return api.post(`/api/subscriptions/admin/requests/${id}/reject`);
  },
  
  extendLandlord(landlordId, months) {
    return api.post('/api/subscriptions/admin/extend', { landlordId, months });
  },

  getAdminBankInfo() {
    return api.get('/api/subscriptions/admin-bank-info');
  },

  updateAdminBankInfo(setting) {
    return api.put('/api/subscriptions/admin-bank-info', setting);
  }
};
