import api from './api';

export default {
  getNotifications(page = 0, size = 10) {
    return api.get(`/api/notifications?page=${page}&size=${size}`);
  },
  getUnreadCount() {
    return api.get('/api/notifications/unread-count');
  },
  markAsRead(id) {
    return api.put(`/api/notifications/${id}/read`);
  },
  markAllAsRead() {
    return api.put('/api/notifications/read-all');
  }
};
