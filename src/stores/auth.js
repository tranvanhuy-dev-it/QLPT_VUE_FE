import { defineStore } from 'pinia';
import api from '../services/api.js';

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch (error) {
    return true;
  }
}

// Kiểm tra và dọn dẹp localStorage nếu token đã hết hạn trước khi khởi tạo store
const checkAndCleanExpiredToken = () => {
  const token = localStorage.getItem('token');
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
checkAndCleanExpiredToken();

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // SECURITY NOTE: Token được lưu localStorage để persist qua F5.
    // Rủi ro XSS được giảm thiểu bằng:
    //   1. CSP meta tag (index.html) — ngăn script lạ inject vào trang
    //   2. Vue template dùng {{ }} tự escape HTML — không có v-html với dữ liệu user
    //   3. httpOnly cookie là giải pháp lý tưởng nhưng cần backend hỗ trợ
    token: localStorage.getItem('token') || null,
    // Chỉ lưu tối thiểu thông tin cần thiết cho UI (id, username, role, isExpired)
    // Không lưu thông tin nhạy cảm (password, CCCD, địa chỉ...)
    user: JSON.parse(localStorage.getItem('user')) || null,
    isSidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
    isBottomBarHidden: false,
    isHeaderHidden: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.role || null,
    username: (state) => state.user?.username || null,
    userId: (state) => state.user?.id || null,
  },
  actions: {
    async login(username, password) {
      try {
        const response = await api.post('/api/auth/login', { username, password });
        const { token, id, role, isExpired } = response.data;
        
        this.token = token;
        this.user = { id, username, role, isExpired };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return this.user;
      } catch (error) {
        throw error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại!';
      }
    },
    async loginWithGoogle(credential) {
      try {
        const response = await api.post('/api/auth/google', { credential });
        const { token, id, role, isExpired } = response.data;
        
        this.token = token;
        this.user = { id, username: response.data.username, role, isExpired };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return this.user;
      } catch (error) {
        throw error.response?.data?.error || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại!';
      }
    },
    async checkSubscription() {
      if (this.role !== 'LANDLORD') return false;
      try {
        const response = await api.get('/api/subscriptions/active-status');
        const { isExpired } = response.data;
        this.user = { ...this.user, isExpired };
        localStorage.setItem('user', JSON.stringify(this.user));
        return isExpired;
      } catch (error) {
        console.error('Không thể kiểm tra thời hạn gói cước:', error);
        return false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    closeSidebar() {
      this.isSidebarOpen = false;
    },
    setBottomBarHidden(value) {
      this.isBottomBarHidden = value;
    },
    setHeaderHidden(value) {
      this.isHeaderHidden = value;
    },
    // SECURITY: Không nhận `role` từ client — backend tự quyết định role dựa trên
    // endpoint được gọi (/api/auth/register luôn tạo tài khoản LANDLORD).
    // Điều này ngăn người dùng tự đặt role = ADMIN bằng cách chỉnh sửa request.
    async register(username, password, email, phone, fullName, identityCard, idCardIssueDate, idCardIssuePlace) {
      try {
        const response = await api.post('/api/auth/register', {
          username,
          password,
          email:            email            || null,
          phone:            phone            || null,
          fullName,
          // role: KHÔNG gửi — backend tự assign LANDLORD cho endpoint này
          identityCard:     identityCard     || null,
          idCardIssueDate:  idCardIssueDate  || null,
          idCardIssuePlace: idCardIssuePlace || null,
        });
        return response.data;
      } catch (error) {
        throw error.response?.data?.error || 'Đăng ký tài khoản thất bại!';
      }
    }
  },
});
