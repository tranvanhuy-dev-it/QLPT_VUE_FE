<template>
  <div class="auth-wrapper">
    <div class="auth-card" style="max-width: 500px;">
      <h2 style="text-align: center; margin-bottom: 0.5rem; font-weight: 700; color: var(--primary-color);">ĐĂNG KÝ CHỦ
        TRỌ</h2>
      <p style="text-align: center; color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem;">Đăng ký để
        quản lý phòng trọ của riêng bạn</p>

      <div v-if="error" class="badge badge-danger"
        style="width: 100%; padding: 0.75rem; margin-bottom: 1.25rem; border-radius: 8px; justify-content: center; text-transform: none;">
        {{ error }}
      </div>
      <div v-if="success" class="badge badge-success"
        style="width: 100%; padding: 0.75rem; margin-bottom: 1.25rem; border-radius: 8px; justify-content: center; text-transform: none;">
        {{ success }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">Tên đăng nhập *</label>
          <input type="text" class="form-input" v-model="username" placeholder="Tên viết liền không dấu" required />
        </div>

        <div class="form-group">
          <label class="form-label">Mật khẩu *</label>
          <input type="password" class="form-input" v-model="password" placeholder="Tối thiểu 6 ký tự" required />
        </div>

        <div class="form-group">
          <label class="form-label">Họ và tên *</label>
          <input type="text" class="form-input" v-model="fullName" placeholder="Nhập họ tên đầy đủ" required />
        </div>

        <div class="grid grid-cols-2" style="gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Số điện thoại</label>
            <input type="text" class="form-input" v-model="phone" placeholder="Nhập số điện thoại" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" v-model="email" placeholder="Nhập email" />
          </div>
        </div>

        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">Số CMND/CCCD</label>
          <input type="text" class="form-input" v-model="identityCard" placeholder="Số định danh cá nhân" />
        </div>

        <div class="grid grid-cols-2" style="gap: 1rem;">
          <div class="form-group">
            <label class="form-label">Ngày cấp</label>
            <input type="date" class="form-input" v-model="idCardIssueDate" />
          </div>
          <div class="form-group">
            <label class="form-label">Nơi cấp</label>
            <input type="text" class="form-input" v-model="idCardIssuePlace"
              placeholder="Ví dụ: Cục Cảnh sát QLHC về TTXH" />
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;" :disabled="loading">
          {{ loading ? 'Đang tạo tài khoản...' : 'Đăng Ký' }}
        </button>
      </form>

      <div style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem;">
        <span style="color: var(--text-secondary);">Đã có tài khoản? </span>
        <router-link to="/login">Đăng nhập</router-link>
      </div>
    </div>
  </div>
</template>

<script src="./Register.js"></script>
