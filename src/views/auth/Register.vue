<template>
  <div class="auth-wrapper">
    <div class="auth-card register-card">
      <h2 class="register-title">ĐĂNG KÝ CHỦ TRỌ</h2>
      <p class="register-subtitle">Tạo tài khoản để quản lý phòng trọ của bạn</p>

      <!-- Global Error / Success -->
      <div v-if="error" class="badge badge-danger alert-message" role="alert">
        ⚠️ {{ error }}
      </div>
      <div v-if="success" class="badge badge-success alert-message" role="status">
        ✅ {{ success }}
      </div>

      <form @submit.prevent="handleRegister" novalidate autocomplete="off">
        <!-- ===== THÔNG TIN TÀI KHOẢN ===== -->
        <div class="section-header">🔐 Thông tin tài khoản</div>

        <!-- Username -->
        <div class="form-group">
          <label class="form-label" for="reg-username">Tên đăng nhập <span class="required">*</span></label>
          <input
            id="reg-username"
            type="text"
            class="form-input"
            :class="{ 'input-error': usernameError, 'input-success': touched && !usernameError && username }"
            v-model="username"
            placeholder="Chữ cái không dấu, số, dấu _ (4–32 ký tự)"
            autocomplete="username"
            maxlength="32"
            @blur="touched = true"
          />
          <span v-if="usernameError" class="field-error">{{ usernameError }}</span>
          <span v-else-if="touched && username && !usernameError" class="field-success">✓ Hợp lệ</span>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label class="form-label" for="reg-password">Mật khẩu <span class="required">*</span></label>
          <div class="input-with-toggle">
            <input
              id="reg-password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'input-error': passwordError, 'input-success': touched && !passwordError && password }"
              v-model="password"
              placeholder="Tối thiểu 8 ký tự, gồm Hoa + thường + số"
              autocomplete="new-password"
              @blur="touched = true"
            />
            <button type="button" class="toggle-password-btn" @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'">
              <!-- Eye icon -->
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>

          <!-- Password strength bar -->
          <div v-if="password" class="password-strength">
            <div class="strength-bars">
              <div class="strength-bar" :class="{ active: passwordStrength.level >= 1 }" :style="{ background: passwordStrength.level >= 1 ? passwordStrength.color : '' }"></div>
              <div class="strength-bar" :class="{ active: passwordStrength.level >= 2 }" :style="{ background: passwordStrength.level >= 2 ? passwordStrength.color : '' }"></div>
              <div class="strength-bar" :class="{ active: passwordStrength.level >= 3 }" :style="{ background: passwordStrength.level >= 3 ? passwordStrength.color : '' }"></div>
              <div class="strength-bar" :class="{ active: passwordStrength.level >= 4 }" :style="{ background: passwordStrength.level >= 4 ? passwordStrength.color : '' }"></div>
            </div>
            <span class="strength-label" :style="{ color: passwordStrength.color }">{{ passwordStrength.label }}</span>
          </div>

          <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label class="form-label" for="reg-confirm-password">Nhập lại mật khẩu <span class="required">*</span></label>
          <div class="input-with-toggle">
            <input
              id="reg-confirm-password"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'input-error': confirmPasswordError, 'input-success': touched && !confirmPasswordError && confirmPassword }"
              v-model="confirmPassword"
              placeholder="Nhập lại mật khẩu ở trên"
              autocomplete="new-password"
              @blur="touched = true"
            />
            <button type="button" class="toggle-password-btn" @click="showConfirmPassword = !showConfirmPassword"
              :aria-label="showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'">
              <svg v-if="showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
          <span v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</span>
          <span v-else-if="touched && confirmPassword && !confirmPasswordError" class="field-success">✓ Mật khẩu khớp</span>
        </div>

        <!-- ===== THÔNG TIN CÁ NHÂN ===== -->
        <div class="section-header">👤 Thông tin cá nhân</div>

        <!-- Full Name -->
        <div class="form-group">
          <label class="form-label" for="reg-fullname">Họ và tên <span class="required">*</span></label>
          <input
            id="reg-fullname"
            type="text"
            class="form-input"
            :class="{ 'input-error': fullNameError, 'input-success': touched && !fullNameError && fullName }"
            v-model="fullName"
            placeholder="Nhập họ tên đầy đủ"
            autocomplete="name"
            maxlength="100"
            @blur="touched = true"
          />
          <span v-if="fullNameError" class="field-error">{{ fullNameError }}</span>
        </div>

        <!-- Phone & Email -->
        <div class="grid grid-cols-2" style="gap: 0.875rem;">
          <div class="form-group">
            <label class="form-label" for="reg-phone">Số điện thoại</label>
            <input
              id="reg-phone"
              type="tel"
              class="form-input"
              :class="{ 'input-error': phoneError, 'input-success': !phoneError && phone }"
              v-model="phone"
              placeholder="0912345678"
              autocomplete="tel"
              maxlength="11"
              @input="phone = phone.replace(/\D/g, '')"
            />
            <span v-if="phoneError" class="field-error">{{ phoneError }}</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              class="form-input"
              :class="{ 'input-error': emailError, 'input-success': !emailError && email }"
              v-model="email"
              placeholder="example@mail.com"
              autocomplete="email"
              maxlength="100"
            />
            <span v-if="emailError" class="field-error">{{ emailError }}</span>
          </div>
        </div>

        <!-- ===== THÔNG TIN GIẤY TỜ ===== -->
        <div class="section-header">📄 Thông tin giấy tờ tùy thân</div>

        <!-- Identity Card -->
        <div class="form-group">
          <label class="form-label" for="reg-cccd">Số CMND / CCCD</label>
          <input
            id="reg-cccd"
            type="text"
            class="form-input"
            :class="{ 'input-error': identityCardError, 'input-success': !identityCardError && identityCard }"
            v-model="identityCard"
            placeholder="9 số (CMND) hoặc 12 số (CCCD)"
            autocomplete="off"
            maxlength="12"
            @input="identityCard = identityCard.replace(/\D/g, '')"
          />
          <span v-if="identityCardError" class="field-error">{{ identityCardError }}</span>
        </div>

        <!-- Issue Date & Place -->
        <div class="grid grid-cols-2" style="gap: 0.875rem;">
          <div class="form-group">
            <label class="form-label" for="reg-issue-date">Ngày cấp</label>
            <input
              id="reg-issue-date"
              type="date"
              class="form-input"
              :class="{ 'input-error': idCardIssueDateError }"
              v-model="idCardIssueDate"
              autocomplete="off"
              :max="new Date().toISOString().split('T')[0]"
            />
            <span v-if="idCardIssueDateError" class="field-error">{{ idCardIssueDateError }}</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="reg-issue-place">Nơi cấp</label>
            <input
              id="reg-issue-place"
              type="text"
              class="form-input"
              v-model="idCardIssuePlace"
              placeholder="Cục Cảnh sát QLC..."
              autocomplete="off"
              maxlength="150"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn btn-primary register-btn"
          :disabled="loading"
        >
          <span v-if="loading">⏳ Đang tạo tài khoản...</span>
          <span v-else>Đăng Ký Tài Khoản</span>
        </button>
      </form>

      <div class="login-link">
        <span>Đã có tài khoản? </span>
        <router-link to="/login">Đăng nhập tại đây</router-link>
      </div>
    </div>
  </div>
</template>

<script src="./Register.js"></script>

<style scoped>
.register-card {
  max-width: 520px;
}

.register-title {
  text-align: center;
  margin-bottom: 0.25rem;
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1.5rem;
  letter-spacing: 0.05em;
}

.register-subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.section-header {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary-color);
  background: rgba(79, 70, 229, 0.06);
  border-left: 3px solid var(--primary-color);
  border-radius: 0 6px 6px 0;
  padding: 0.4rem 0.75rem;
  margin-bottom: 0.875rem;
  margin-top: 0.25rem;
}

.alert-message {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  justify-content: flex-start;
  text-transform: none;
  font-size: 0.85rem;
  line-height: 1.5;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

/* ---- Field error/success ---- */
.field-error {
  display: block;
  font-size: 0.73rem;
  color: #ef4444;
  margin-top: 0.3rem;
  line-height: 1.4;
}

.field-success {
  display: block;
  font-size: 0.73rem;
  color: #22c55e;
  margin-top: 0.3rem;
}

/* ---- Input states ---- */
.input-error {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.03) !important;
}

.input-success {
  border-color: #22c55e !important;
}

/* ---- Password toggle ---- */
.input-with-toggle {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-toggle .form-input {
  padding-right: 2.75rem;
  width: 100%;
}

.toggle-password-btn {
  position: absolute;
  right: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color 0.15s;
}

.toggle-password-btn:hover {
  color: var(--primary-color);
}

/* ---- Password strength ---- */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.strength-bars {
  display: flex;
  gap: 3px;
  flex: 1;
}

.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 99px;
  background: var(--border-color, #e5e7eb);
  transition: background 0.3s ease;
}

.strength-label {
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 60px;
  text-align: right;
  transition: color 0.3s;
}

/* ---- Submit button ---- */
.register-btn {
  width: 100%;
  margin-top: 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
}

/* ---- Login link ---- */
.login-link {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
