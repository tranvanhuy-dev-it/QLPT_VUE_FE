import api from './api';

export default {
  getAll(params) {
    return api.get('/api/invoices', { params });
  },
  getById(id) {
    return api.get(`/api/invoices/${id}`);
  },
  getItems(id) {
    return api.get(`/api/invoices/${id}/items`);
  },
  create(data) {
    return api.post('/api/invoices', data);
  },
  pay(id, paidAmount) {
    return api.post(`/api/invoices/${id}/pay`, { paidAmount });
  }
};
