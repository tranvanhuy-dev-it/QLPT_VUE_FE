import api from './api';

export default {
  getAll(params = { page: 0, size: 100 }) {
    return api.get('/api/rooms/boarding-houses', { params });
  },
  getById(id) {
    return api.get(`/api/rooms/boarding-houses/${id}`);
  },
  create(data) {
    return api.post('/api/rooms/boarding-houses', data);
  },
  update(id, data) {
    return api.put(`/api/rooms/boarding-houses/${id}`, data);
  },
  delete(id) {
    return api.delete(`/api/rooms/boarding-houses/${id}`);
  }
};
