import axios from 'axios';
import { ref } from 'vue';

export const isApiLoading = ref(false);
export const isApiSaving = ref(false);

let activeGetRequests = 0;
let activeWriteRequests = 0;

function updateLoadingState(config, isStart) {
  if (!config) return;
  
  // Bypass loading indicators if skipLoading or X-Skip-Loading header is present
  if (config.skipLoading || (config.headers && config.headers['X-Skip-Loading'])) {
    return;
  }

  const method = config.method;
  const isWrite = ['post', 'put', 'delete', 'patch'].includes(method?.toLowerCase());
  
  if (isStart) {
    if (isWrite) {
      activeWriteRequests++;
    } else {
      activeGetRequests++;
    }
  } else {
    if (isWrite) {
      activeWriteRequests = Math.max(0, activeWriteRequests - 1);
    } else {
      activeGetRequests = Math.max(0, activeGetRequests - 1);
    }
  }
  
  isApiSaving.value = activeWriteRequests > 0;
  isApiLoading.value = (activeGetRequests > 0 || activeWriteRequests > 0);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  // Sau 15 giây không có phản hồi từ server → tự động hủy request và báo lỗi
  // (tránh trường hợp mất mạng / server chết khiến spinner quay vô hạn)
  timeout: 15000, // 15 giây
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Giúp backend nhận biết request từ SPA (CSRF hint)
  },
});

// Request Interceptor: Tự động đính kèm token JWT vào Header Authorization
api.interceptors.request.use(
  (config) => {
    updateLoadingState(config, true);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    updateLoadingState(error.config, false);
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý lỗi tập trung (Ví dụ lỗi 401 hết hạn token)
api.interceptors.response.use(
  (response) => {
    updateLoadingState(response.config, false);
    return response;
  },
  (error) => {
    updateLoadingState(error.config, false);
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Chuyển hướng người dùng về trang đăng nhập nếu gặp lỗi 401
      window.location.href = '/login';
    }
    if (error.response && error.response.status === 402) {
      // Cập nhật trạng thái hết hạn vào localStorage để router guard hoạt động chính xác
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.isExpired = true;
          localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {
          console.error('Lỗi phân tích thông tin user khi hết hạn:', e);
        }
      }
      
      // Chuyển hướng đến trang nâng cấp gói cước nếu chưa ở đúng trang
      if (window.location.pathname !== '/landlord/upgrade') {
        window.location.href = '/landlord/upgrade';
      }
    }
    // Xử lý lỗi timeout: trả về thông báo thân thiện cho UI thay vì lỗi kỹ thuật
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const timeoutError = new Error('Kết nối đến server quá lâu. Vui lòng kiểm tra mạng và thử lại.');
      timeoutError.isTimeout = true;
      return Promise.reject(timeoutError);
    }
    return Promise.reject(error);
  }
);

export default api;
