import api from './api';

export default {
  getAll(params) {
    return api.get('/api/users/tenants', { params });
  },
  create(data) {
    return api.post('/api/auth/create-tenant', data);
  }
};
