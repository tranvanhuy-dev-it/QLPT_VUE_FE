import api from './api';

export default {
  getChatRooms(page = 0, size = 20) {
    return api.get(`/api/chat/rooms?page=${page}&size=${size}`, {
      skipLoading: true,
      headers: { 'X-Skip-Loading': 'true' }
    });
  },
  getRoomMessages(roomId, page = 0, size = 30) {
    return api.get(`/api/chat/rooms/${roomId}/messages?page=${page}&size=${size}`, {
      skipLoading: true,
      headers: { 'X-Skip-Loading': 'true' }
    });
  },
  sendMessage(roomId, messageRequest) {
    return api.post(`/api/chat/rooms/${roomId}/messages`, messageRequest, {
      skipLoading: true,
      headers: { 'X-Skip-Loading': 'true' }
    });
  },
  markAsRead(roomId) {
    return api.post(`/api/chat/rooms/${roomId}/read`, null, {
      skipLoading: true,
      headers: { 'X-Skip-Loading': 'true' }
    });
  }
};
