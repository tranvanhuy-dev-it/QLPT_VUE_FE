import { defineStore } from 'pinia';
import notificationService from '../services/notificationService';
import { useAuthStore } from './auth';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    socket: null,
    reconnectTimeout: null,
    reconnectDelay: 2000,
    currentPage: 0,
    hasMore: false,
    activeToast: null,
    toastTimeout: null,
  }),
  actions: {
    async fetchNotifications(page = 0, size = 10, append = false) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;
      
      this.loading = true;
      try {
        const response = await notificationService.getNotifications(page, size);
        const newNotifs = response.data.content || [];
        if (append) {
          const existingIds = new Set(this.notifications.map(n => n.id));
          const filteredNewNotifs = newNotifs.filter(n => !existingIds.has(n.id));
          this.notifications = [...this.notifications, ...filteredNewNotifs];
        } else {
          this.notifications = newNotifs;
        }
        this.currentPage = page;
        this.hasMore = !response.data.last;
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchUnreadCount() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      try {
        const response = await notificationService.getUnreadCount();
        this.unreadCount = response.data;
      } catch (error) {
        console.error('Lỗi khi lấy số thông báo chưa đọc:', error);
      }
    },
    async markAsRead(id) {
      try {
        await notificationService.markAsRead(id);
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1 && !this.notifications[index].isRead) {
          this.notifications[index].isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc thông báo:', error);
      }
    },
    async markAllAsRead() {
      try {
        await notificationService.markAllAsRead();
        this.notifications.forEach(n => {
          n.isRead = true;
        });
        this.unreadCount = 0;
      } catch (error) {
        console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
      }
    },
    connectWebSocket() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated || !authStore.token) return;

      // Tránh tạo kết nối lặp nếu đã mở hoặc đang kết nối
      if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
        return;
      }

      // Xóa các timeout kết nối lại trước đó
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Tải dữ liệu ban đầu
      this.fetchUnreadCount();
      this.fetchNotifications(0, 10);

      // Xác định URL WebSocket
      let apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        const host = window.location.hostname;
        apiUrl = `http://${host}:8080`;
      }
      
      // Thay thế http bằng ws, https bằng wss
      const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/notifications?token=' + authStore.token;

      logWebSocket('Đang kết nối WebSocket đến: ' + wsUrl.split('?')[0]);
      
      const socket = new WebSocket(wsUrl);
      this.socket = socket;

      socket.onopen = () => {
        logWebSocket('Kết nối WebSocket thành công.');
        this.reconnectDelay = 2000; // Reset độ trễ reconnection
      };

      socket.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          logWebSocket('Nhận thông báo mới từ WebSocket:', notification);
          
          // Thêm thông báo mới vào đầu danh sách nếu chưa tồn tại
          const exists = this.notifications.some(n => n.id === notification.id);
          if (!exists) {
            this.notifications.unshift(notification);
            this.unreadCount++;
            
            // Hiển thị Toast Popup trên màn hình
            this.activeToast = notification;
            if (this.toastTimeout) {
              clearTimeout(this.toastTimeout);
            }
            this.toastTimeout = setTimeout(() => {
              this.activeToast = null;
            }, 6000); // Tự động ẩn sau 6 giây
            
            // Phát âm báo hiệu
            this.playNotificationSound();
          }
        } catch (e) {
          console.error('Lỗi phân tích tin nhắn WebSocket:', e);
        }
      };

      socket.onerror = (error) => {
        console.error('Lỗi kết nối WebSocket:', error);
      };

      socket.onclose = (event) => {
        logWebSocket(`Kết nối WebSocket đã bị đóng. Code: ${event.code}, Lý do: ${event.reason}`);
        this.socket = null;

        // Nếu người dùng vẫn đăng nhập thì tự động reconnect với cơ chế exponential backoff
        if (authStore.isAuthenticated) {
          logWebSocket(`Sẽ thử kết nối lại sau ${this.reconnectDelay}ms...`);
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Tối đa 30 giây
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
      logWebSocket('Đã đóng kết nối WebSocket.');
    },
    startPolling() {
      this.connectWebSocket();
    },
    stopPolling() {
      this.disconnectWebSocket();
    },
    playNotificationSound() {
      try {
        const audio = new Audio('/assets/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Bỏ qua lỗi tự động phát âm thanh bị trình duyệt chặn
        });
      } catch (e) {
        // Bỏ qua lỗi nạp âm thanh
      }
    }
  }
});

function logWebSocket(...args) {
  if (import.meta.env.DEV) {
    console.log('[WebSocket Notifications]', ...args);
  }
}
