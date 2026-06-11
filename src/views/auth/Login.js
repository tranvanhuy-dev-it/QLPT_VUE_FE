import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import { useRouter } from 'vue-router';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Capacitor } from '@capacitor/core';

// Initialize native Google Auth for mobile
if (Capacitor.isNativePlatform()) {
  GoogleAuth.initialize();
}

// ===================== Rate Limiting (Brute-force Protection) =====================
const RATE_LIMIT_KEY = 'login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 phút

function getRateLimitData() {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lockedUntil: null };
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function saveRateLimitData(data) {
  try {
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function recordFailedAttempt() {
  const data = getRateLimitData();
  data.count = (data.count || 0) + 1;
  if (data.count >= MAX_ATTEMPTS) {
    data.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  saveRateLimitData(data);
  return data;
}

function checkLockout() {
  const data = getRateLimitData();
  if (data.lockedUntil && Date.now() < data.lockedUntil) {
    const remainingMs = data.lockedUntil - Date.now();
    const minutes = Math.ceil(remainingMs / 60000);
    return `Tài khoản tạm thời bị khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${minutes} phút.`;
  }
  // Auto-reset if lockout expired
  if (data.lockedUntil && Date.now() >= data.lockedUntil) {
    saveRateLimitData({ count: 0, lockedUntil: null });
  }
  return null;
}

function resetRateLimit() {
  sessionStorage.removeItem(RATE_LIMIT_KEY);
}

function getRemainingAttempts() {
  const data = getRateLimitData();
  if (!data.lockedUntil) {
    const remaining = MAX_ATTEMPTS - (data.count || 0);
    return remaining > 0 ? remaining : 0;
  }
  return 0;
}
// =================================================================================

// ===================== Safe DOM button builder (no innerHTML) =====================
function buildGoogleButton(onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Đăng nhập bằng Google');
  btn.style.cssText = [
    'width: 100%',
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'gap: 0.75rem',
    'border: 1px solid var(--border-color)',
    'border-radius: 2px',
    'padding: 0.6rem 1rem',
    'background: var(--card-bg)',
    'font-family: inherit',
    'font-size: 0.9rem',
    'font-weight: 500',
    'cursor: pointer',
    'color: var(--text-primary)',
    'transition: all 0.15s ease',
  ].join(';');
  btn.classList.add('btn', 'btn-outline');

  // Google SVG logo via DOM (no innerHTML)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('viewBox', '0 0 18 18');
  svg.setAttribute('fill', 'none');

  const paths = [
    { d: 'M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z', fill: '#4285F4' },
    { d: 'M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z', fill: '#34A853' },
    { d: 'M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z', fill: '#FBBC05' },
    { d: 'M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z', fill: '#EA4335' },
  ];
  paths.forEach(({ d, fill }) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', fill);
    svg.appendChild(path);
  });

  const span = document.createElement('span');
  span.textContent = 'Đăng nhập bằng Google';

  btn.appendChild(svg);
  btn.appendChild(span);
  btn.addEventListener('click', onClick);
  return btn;
}
// =================================================================================

export default {
  name: 'Login',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const username = ref('');
    const password = ref('');
    const error = ref('');
    const loading = ref(false);

    const showPassword = ref(false);
    const showSystemNotice = ref(false);
    const retryCount = ref(0);

    // Rate limit warning (show remaining attempts)
    const attemptsWarning = ref('');

    const handleLogin = async () => {
      error.value = '';
      attemptsWarning.value = '';

      // Basic required check
      if (!username.value.trim() || !password.value) {
        error.value = 'Vui lòng nhập tên đăng nhập và mật khẩu.';
        return;
      }

      // Check lockout before attempting
      const lockoutMsg = checkLockout();
      if (lockoutMsg) {
        error.value = lockoutMsg;
        return;
      }

      loading.value = true;
      try {
        const user = await authStore.login(username.value.trim(), password.value);

        // Login thành công → reset rate limit
        resetRateLimit();

        // Điều hướng theo vai trò người dùng (Role-based redirection)
        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else if (user.role === 'LANDLORD') {
          router.push('/landlord');
        } else if (user.role === 'TENANT') {
          router.push('/tenant');
        } else {
          error.value = 'Vai trò tài khoản không hợp lệ!';
        }
      } catch (err) {
        // Ghi nhận lần đăng nhập thất bại
        const rateData = recordFailedAttempt();
        const remaining = getRemainingAttempts();

        if (rateData.lockedUntil && Date.now() < rateData.lockedUntil) {
          const mins = Math.ceil((rateData.lockedUntil - Date.now()) / 60000);
          error.value = `Đăng nhập sai quá ${MAX_ATTEMPTS} lần. Tài khoản bị tạm khóa ${mins} phút.`;
        } else {
          error.value = err;
          if (remaining > 0 && remaining <= 3) {
            attemptsWarning.value = `⚠️ Còn ${remaining} lần thử trước khi tài khoản bị tạm khóa.`;
          }
        }
      } finally {
        loading.value = false;
      }
    };

    const handleGoogleLogin = async (response) => {
      error.value = '';
      attemptsWarning.value = '';
      loading.value = true;
      try {
        const user = await authStore.loginWithGoogle(response.credential);

        resetRateLimit();

        if (user.role === 'ADMIN') {
          router.push('/admin');
        } else if (user.role === 'LANDLORD') {
          router.push('/landlord');
        } else if (user.role === 'TENANT') {
          router.push('/tenant');
        } else {
          error.value = 'Vai trò tài khoản không hợp lệ!';
        }
      } catch (err) {
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    const renderFallbackGoogleButton = () => {
      const btnContainer = document.getElementById('google-signin-btn');
      if (!btnContainer) return;
      btnContainer.innerHTML = '';
      const btn = buildGoogleButton(() => {
        alert('Chức năng Google đăng nhập yêu cầu cấu hình Google Client ID. Vui lòng thiết lập biến "VITE_GOOGLE_CLIENT_ID" trong file .env ở Frontend và khởi động lại dự án!');
      });
      btnContainer.appendChild(btn);
    };

    const renderCustomGoogleButton = () => {
      const btnContainer = document.getElementById('google-signin-btn');
      if (!btnContainer) return;
      btnContainer.innerHTML = '';
      const btn = buildGoogleButton(async () => {
        if (Capacitor.isNativePlatform()) {
          error.value = '';
          loading.value = true;
          try {
            const googleUser = await GoogleAuth.signIn();
            const idToken = googleUser.authentication.idToken;
            await handleGoogleLogin({ credential: idToken });
          } catch (err) {
            console.error('Lỗi đăng nhập mobile:', err);
            error.value = 'Đăng nhập Google thất bại hoặc bị hủy.';
          } finally {
            loading.value = false;
          }
        } else {
          alert('Có lỗi xảy ra khi tải Google SDK. Vui lòng tải lại trang hoặc kiểm tra kết nối mạng!');
        }
      });
      btnContainer.appendChild(btn);
    };

    const initGoogleSignIn = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId.includes('your-google-client-id')) {
        console.warn('Google Client ID chưa được cấu hình hợp lệ trong .env. Đang hiển thị nút dạng mockup.');
        renderFallbackGoogleButton();
        return;
      }

      const isMobileApp = typeof window !== 'undefined' && (window.Capacitor || window.cordova);

      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleLogin,
          auto_select: false,
        });

        const btnContainer = document.getElementById('google-signin-btn');
        let calculatedWidth = btnContainer ? btnContainer.offsetWidth : 340;
        if (calculatedWidth < 250) calculatedWidth = 250;
        if (calculatedWidth > 400) calculatedWidth = 400;

        google.accounts.id.renderButton(
          btnContainer,
          {
            theme: 'outline',
            size: 'large',
            width: calculatedWidth.toString(),
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      } else {
        if (isMobileApp || retryCount.value >= 15) {
          console.warn('Không tải được SDK Google hoặc đang chạy trong Mobile App. Đang hiển thị nút thay thế.');
          renderCustomGoogleButton();
        } else {
          retryCount.value++;
          setTimeout(initGoogleSignIn, 100);
        }
      }
    };

    onMounted(() => {
      // Kiểm tra lockout khi trang load (ví dụ: F5 lại)
      const lockoutMsg = checkLockout();
      if (lockoutMsg) {
        error.value = lockoutMsg;
      }

      initGoogleSignIn();
    });

    return {
      username,
      password,
      error,
      loading,
      handleLogin,
      showPassword,
      showSystemNotice,
      attemptsWarning,
    };
  },
};
