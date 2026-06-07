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
  },
  // Addendums
  getAddendums(contractId) {
    return api.get(`/api/contracts/${contractId}/addendums`);
  },
  createAddendum(contractId, data) {
    return api.post(`/api/contracts/${contractId}/addendums`, data);
  },
  getAddendumExtraFees(contractId, addendumId) {
    return api.get(`/api/contracts/${contractId}/addendums/${addendumId}/extra-fees`);
  },
};
