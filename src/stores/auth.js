import { defineStore } from 'pinia';
import api from '../services/api.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isSidebarOpen: false,
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
        const { token, id, role } = response.data;
        
        this.token = token;
        this.user = { id, username, role };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return this.user;
      } catch (error) {
        throw error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại!';
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
    async register(username, password, email, phone, fullName, role) {
      try {
        const response = await api.post('/api/auth/register', {
          username,
          password,
          email,
          phone,
          fullName,
          role,
        });
        return response.data;
      } catch (error) {
        throw error.response?.data?.error || 'Đăng ký tài khoản thất bại!';
      }
    },
    async createTenant(tenantData) {
      try {
        const response = await api.post('/api/auth/create-tenant', tenantData);
        return response.data;
      } catch (error) {
        throw error.response?.data?.error || 'Không thể tạo tài khoản cho người thuê!';
      }
    }
  },
});
