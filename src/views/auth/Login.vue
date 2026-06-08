<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h2 style="text-align: center; margin-bottom: 0.5rem; font-weight: 700; color: var(--primary-color);">NHÀ TRỌ
        THÔNG MINH</h2>
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.9rem;">Đăng nhập để
        quản lý và xem thông tin trọ</p>

      <div v-if="error" class="badge badge-danger"
        style="width: 100%; padding: 0.75rem; margin-bottom: 1.25rem; border-radius: 8px; justify-content: center; text-transform: none;">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Tên đăng nhập</label>
          <input type="text" class="form-input" v-model="username" placeholder="Nhập tên đăng nhập" required />
        </div>

        <div class="form-group" style="margin-bottom: 2rem;">
          <label class="form-label">Mật khẩu</label>
          <input type="password" class="form-input" v-model="password" placeholder="Nhập mật khẩu" required />
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Đang xác thực...' : 'Đăng Nhập' }}
        </button>
      </form>

      <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem;">
        <span style="color: var(--text-secondary);">Bạn là chủ trọ mới? </span>
        <router-link to="/register">Đăng ký tại đây</router-link>
      </div>

      <div style="margin-top: 2rem; padding: 0.75rem 1rem; border-radius: 12px; background-color: rgba(79, 70, 229, 0.05); border: 1px dashed rgba(79, 70, 229, 0.2); font-size: 0.75rem; color: var(--text-secondary); text-align: justify; line-height: 1.5; display: flex; flex-direction: column; gap: 0.25rem;">
        <div style="font-weight: 700; color: var(--primary-color); text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.25rem; margin-bottom: 0.15rem;">
          <span>⚙️ THÔNG BÁO HỆ THỐNG</span>
        </div>
        <span>Hệ thống hiện đang trong quá trình phát triển tích cực. Nếu gặp bất kỳ sự cố kỹ thuật nào hoặc muốn đóng góp ý kiến để hoàn thiện dịch vụ, xin vui lòng liên hệ qua:</span>
        <div style="display: flex; justify-content: space-around; font-weight: 600; margin-top: 0.25rem; color: var(--primary-color);">
          <a href="https://zalo.me/0365943254" target="_blank" style="text-decoration: none; display: flex; align-items: center; gap: 0.15rem;">💬 Zalo: 0365943254</a>
          <a href="mailto:admin@gmail.com" style="text-decoration: none; display: flex; align-items: center; gap: 0.15rem;">✉️ Email: admin@gmail.com</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Login.js"></script>
