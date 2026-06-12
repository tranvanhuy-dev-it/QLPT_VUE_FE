import { defineStore } from 'pinia';
import notificationService from '../services/notificationService';
import { useAuthStore } from './auth';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    pollingInterval: null,
    currentPage: 0,
    hasMore: false,
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
    startPolling() {
      if (this.pollingInterval) return;
      
      // Chạy ngay lập tức lần đầu
      this.fetchUnreadCount();
      this.fetchNotifications(0, 10);
      
      // Thiết lập chu kỳ 30s
      this.pollingInterval = setInterval(() => {
        const authStore = useAuthStore();
        if (authStore.isAuthenticated) {
          this.fetchUnreadCount();
          this.fetchNotifications(0, 10);
        } else {
          this.stopPolling();
        }
      }, 30000);
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    }
  }
});
