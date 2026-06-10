<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1 style="
        text-align: center;
        margin-bottom: 0rem;
        font-weight: 700;
        color: var(--primary-color);
        font-size: 2rem;
      ">
        SMART RENT
      </h1>
      <h2 style="text-align: center; margin-bottom: 0.5rem; font-weight: 700; color: var(--primary-color);">
        Quản lý trọ thông minh
      </h2>
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: 2rem; font-size: 0.9rem;">Đăng nhập
        để
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
          <div style="position: relative; display: flex; align-items: center; width: 100%;">
            <input :type="showPassword ? 'text' : 'password'" class="form-input" v-model="password"
              placeholder="Nhập mật khẩu" required style="padding-right: 2.75rem;" />
            <button type="button" @click="showPassword = !showPassword"
              style="position: absolute; right: 0.875rem; background: none; border: none; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; padding: 0;">
              <!-- Eye Icon when showPassword is true -->
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24">
                </path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <!-- Eye Slash Icon when showPassword is false -->
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
          {{ loading ? 'Đang xác thực...' : 'Đăng Nhập' }}
        </button>
      </form>

      <div style="margin-top: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1rem;">
        <div
          style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.75rem; color: var(--text-secondary); font-size: 0.8rem;">
          <div style="flex: 1; height: 1px; background-color: var(--border-color);"></div>
          <span>Hoặc đăng nhập bằng</span>
          <div style="flex: 1; height: 1px; background-color: var(--border-color);"></div>
        </div>

        <div id="google-signin-btn" style="width: 100%; display: flex; justify-content: center; min-height: 40px;">
        </div>
      </div>

      <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem;">
        <span style="color: var(--text-secondary);">Bạn là chủ trọ mới? </span>
        <router-link to="/register">Đăng ký tại đây</router-link>
      </div>

      <div style="margin-top:  2rem; display: flex; flex-direction: column; gap: 0.5rem; width: 100%;">
        <button type="button" @click="showSystemNotice = !showSystemNotice" class="btn btn-outline"
          style="width: 100%; font-size: 0.75rem; padding: 0.5rem; border: 1px dashed rgba(79, 70, 229, 0.3); background: rgba(79, 70, 229, 0.02); color: var(--primary-color); gap: 0.25rem; border-radius: 8px;">
          <span>⚙️ {{ showSystemNotice ? 'Ẩn thông báo hệ thống' : 'Xem thông báo hệ thống' }}</span>
        </button>

        <div v-if="showSystemNotice"
          style="padding: 0.75rem 1rem; border-radius: 12px; background-color: rgba(79, 70, 229, 0.05); border: 1px dashed rgba(79, 70, 229, 0.2); font-size: 0.75rem; color: var(--text-secondary); text-align: justify; line-height: 1.5; display: flex; flex-direction: column; gap: 0.25rem;">
          <div
            style="font-weight: 700; color: var(--primary-color); text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.25rem; margin-bottom: 0.15rem;">
            <span>⚙️ THÔNG BÁO HỆ THỐNG</span>
          </div>
          <span>Hệ thống hiện đang trong quá trình phát triển tích cực. Nếu gặp bất kỳ sự cố kỹ thuật nào hoặc muốn
            đóng
            góp ý kiến để hoàn thiện dịch vụ, xin vui lòng:</span>
          <div style="text-align: center; font-weight: 700; margin-top: 0.35rem;">
            <router-link to="/contact"
              style="text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem; color: var(--primary-color); padding: 0.25rem 0.75rem; border: 1px solid var(--primary-color); border-radius: 8px; background-color: var(--card-bg); transition: all 0.15s ease;">
              ✉️ Liên hệ Hỗ trợ & Đóng góp ý kiến
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Login.js"></script>
