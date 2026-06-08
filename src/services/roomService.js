import api from './api';

export default {
  getAll(params) {
    return api.get('/api/rooms', { params });
  },
  getById(id) {
    return api.get(`/api/rooms/${id}`);
  },
  getByBoardingHouse(houseId, params) {
    return api.get(`/api/rooms/boarding-houses/${houseId}/rooms`, { params });
  },
  create(houseId, data) {
    return api.post(`/api/rooms/boarding-houses/${houseId}/rooms`, data);
  },
  update(id, data) {
    return api.put(`/api/rooms/${id}`, data);
  },
  delete(id) {
    return api.delete(`/api/rooms/${id}`);
  }
};
