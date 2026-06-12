import api from './api';

export default {
  getSetting() {
    return api.get('/api/tax/setting');
  },
  updateSetting(data) {
    return api.put('/api/tax/setting', data);
  },
  getDeclarations() {
    return api.get('/api/tax');
  },
  calculateTax(data) {
    return api.post('/api/tax/calculate', data);
  },
  declareTax(data) {
    return api.post('/api/tax/declare', data);
  },
  exportExcel(params) {
    return api.get('/api/tax/export-excel', {
      params,
      responseType: 'blob'
    });
  }
};
