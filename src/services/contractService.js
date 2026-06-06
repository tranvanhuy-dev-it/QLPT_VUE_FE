import api from './api';

export default {
  getAll(params) {
    return api.get('/api/contracts', { params });
  },
  getById(id) {
    return api.get(`/api/contracts/${id}`);
  },
  getExtraFees(id) {
    return api.get(`/api/contracts/${id}/extra-fees`);
  },
  getBoardingHouseExtraFees(houseId) {
    return api.get(`/api/rooms/boarding-houses/${houseId}/extra-fees`);
  },
  create(data) {
    return api.post('/api/contracts', data);
  },
  update(id, data) {
    return api.put(`/api/contracts/${id}`, data);
  },
  terminate(id) {
    return api.post(`/api/contracts/${id}/terminate`);
  }
};
