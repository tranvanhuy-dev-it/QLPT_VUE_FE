import { defineStore } from 'pinia';
import chatService from '../services/chatService';
import { useAuthStore } from './auth';

export const useChatStore = defineStore('chat', {
  state: () => ({
    rooms: [],
    currentRoomMessages: [],
    currentRoomId: null,
    loadingRooms: false,
    loadingMessages: false,
    socket: null,
    reconnectTimeout: null,
    reconnectDelay: 2000,
    currentPage: 0,
    hasMore: false,
  }),
  getters: {
    totalUnreadCount: (state) => {
      return state.rooms.reduce((acc, room) => acc + (room.unreadCount || 0), 0);
    }
  },
  actions: {
    async fetchChatRooms() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.loadingRooms = true;
      try {
        const response = await chatService.getChatRooms(0, 100);
        this.rooms = response.data.content || [];
      } catch (error) {
        console.error('Lỗi khi tải danh sách phòng chat:', error);
      } finally {
        this.loadingRooms = false;
      }
    },
    async fetchRoomMessages(roomId, page = 0, append = false) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      this.loadingMessages = true;
      try {
        const response = await chatService.getRoomMessages(roomId, page, 20);
        const fetchedMessages = response.data.content || [];
        
        // Reverse because backend returns page with order desc (latest first), 
        // but frontend displays them from oldest to newest.
        const messagesToUse = [...fetchedMessages].reverse();

        if (append) {
          // Append older messages to the beginning of the list
          const existingIds = new Set(this.currentRoomMessages.map(m => m.id));
          const filteredNew = messagesToUse.filter(m => !existingIds.has(m.id));
          this.currentRoomMessages = [...filteredNew, ...this.currentRoomMessages];
        } else {
          this.currentRoomMessages = messagesToUse;
        }

        this.currentPage = page;
        this.hasMore = !response.data.last;
        this.currentRoomId = roomId;
      } catch (error) {
        console.error('Lỗi khi tải lịch sử tin nhắn:', error);
      } finally {
        this.loadingMessages = false;
      }
    },
    async sendMessage(roomId, content, type = 'TEXT', mediaUrl = null) {
      try {
        const response = await chatService.sendMessage(roomId, { content, type, mediaUrl });
        const newMessage = response.data;

        // If it matches the current room, add it (if WebSocket hasn't already)
        if (this.currentRoomId === roomId) {
          const exists = this.currentRoomMessages.some(m => m.id === newMessage.id);
          if (!exists) {
            this.currentRoomMessages.push(newMessage);
          }
        }

        // Update local room info
        this.updateRoomInfo(roomId, newMessage.content, newMessage.createdAt, false);

        return newMessage;
      } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
        throw error;
      }
    },
    async markAsRead(roomId) {
      try {
        await chatService.markAsRead(roomId);
        const room = this.rooms.find(r => r.id === roomId);
        if (room) {
          room.unreadCount = 0;
        }
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc phòng chat:', error);
      }
    },
    updateRoomInfo(roomId, content, time, isNewIncoming = false) {
      const roomIndex = this.rooms.findIndex(r => r.id === roomId);
      if (roomIndex !== -1) {
        const room = this.rooms[roomIndex];
        room.lastMessage = content;
        room.lastMessageTime = time;
        room.updatedAt = time;
        if (isNewIncoming && this.currentRoomId !== roomId) {
          room.unreadCount = (room.unreadCount || 0) + 1;
        }
        
        // Move room to top
        this.rooms.splice(roomIndex, 1);
        this.rooms.unshift(room);
      } else {
        // Room list might need refreshing
        this.fetchChatRooms();
      }
    },
    connectWebSocket() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.token) return;

      if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
        return;
      }

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Fetch list first
      this.fetchChatRooms();

      let apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        const host = window.location.hostname;
        apiUrl = `http://${host}:8080`;
      }
      
      const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/chat?token=' + authStore.token;
      
      logWebSocket('Đang kết nối WebSocket Chat: ' + wsUrl.split('?')[0]);
      
      const socket = new WebSocket(wsUrl);
      this.socket = socket;

      socket.onopen = () => {
        logWebSocket('Kết nối WebSocket Chat thành công.');
        this.reconnectDelay = 2000;
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          logWebSocket('Nhận tin nhắn mới từ WebSocket:', message);

          const isCurrentRoom = this.currentRoomId === message.chatRoomId;
          const isFromCurrentUser = message.senderUsername === authStore.username;

          if (isCurrentRoom) {
            const exists = this.currentRoomMessages.some(m => m.id === message.id);
            if (!exists) {
              this.currentRoomMessages.push(message);
              // Auto-mark as read if viewing this room
              if (!isFromCurrentUser) {
                this.markAsRead(message.chatRoomId);
              }
            }
          }

          // Update last message in room list
          this.updateRoomInfo(message.chatRoomId, message.content, message.createdAt, !isFromCurrentUser);
          
          // Play sound if incoming
          if (!isFromCurrentUser) {
            this.playChatSound();
          }
        } catch (e) {
          console.error('Lỗi phân tích tin nhắn WebSocket Chat:', e);
        }
      };

      socket.onerror = (error) => {
        console.error('Lỗi kết nối WebSocket Chat:', error);
      };

      socket.onclose = (event) => {
        logWebSocket(`Kết nối WebSocket Chat bị đóng. Code: ${event.code}`);
        this.socket = null;

        if (authStore.isAuthenticated) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
            this.connectWebSocket();
          }, this.reconnectDelay);
        }
      };
    },
    disconnectWebSocket() {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
      logWebSocket('Đã đóng kết nối WebSocket Chat.');
    },
    playChatSound() {
      try {
        const audio = new Audio('/assets/sounds/chat.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  }
});

function logWebSocket(...args) {
  if (import.meta.env.DEV) {
    console.log('[WebSocket Chat]', ...args);
  }
}
