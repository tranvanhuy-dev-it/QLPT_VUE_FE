import api from './api';

export default {
  getAllCameras() {
    return api.get(`/api/boarding-houses/cameras`);
  },
  getTenantCameras() {
    return api.get(`/api/boarding-houses/tenant/cameras`);
  },
  getCameras(houseId) {
    return api.get(`/api/boarding-houses/${houseId}/cameras`);
  },
  addCamera(houseId, data) {
    return api.post(`/api/boarding-houses/${houseId}/cameras`, data);
  },
  updateCamera(cameraId, data) {
    return api.put(`/api/boarding-houses/cameras/${cameraId}`, data);
  },
  deleteCamera(cameraId) {
    return api.delete(`/api/boarding-houses/cameras/${cameraId}`);
  },
  getCameraStream(cameraId) {
    return api.get(`/api/boarding-houses/cameras/${cameraId}/stream`);
  }
};
