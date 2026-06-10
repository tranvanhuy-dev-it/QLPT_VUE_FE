import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import { useRouter } from 'vue-router';

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

    const handleLogin = async () => {
      error.value = '';
      loading.value = true;
      try {
        const user = await authStore.login(username.value, password.value);
        
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
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    const handleGoogleLogin = async (response) => {
      error.value = '';
      loading.value = true;
      try {
        const user = await authStore.loginWithGoogle(response.credential);
        
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
      if (btnContainer) {
        btnContainer.innerHTML = `
          <button type="button" class="btn btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.6rem 1rem; background: var(--card-bg); font-family: inherit; font-size: 0.9rem; font-weight: 500; cursor: pointer; color: var(--text-primary); transition: all 0.15s ease;">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
            </svg>
            <span>Đăng nhập bằng Google</span>
          </button>
        `;
        
        btnContainer.querySelector('button').addEventListener('click', () => {
          alert('Chức năng Google đăng nhập yêu cầu cấu hình Google Client ID. Vui lòng thiết lập biến "VITE_GOOGLE_CLIENT_ID" trong file .env ở Frontend và khởi động lại dự án!');
        });
      }
    };

    const initGoogleSignIn = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId.includes('your-google-client-id')) {
        console.warn('Google Client ID chưa được cấu hình hợp lệ trong .env. Đang hiển thị nút dạng mockup.');
        renderFallbackGoogleButton();
        return;
      }

      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleLogin,
          auto_select: false
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
            logo_alignment: 'left'
          }
        );
      } else {
        // Thử lại sau 100ms nếu script SDK chưa tải xong
        setTimeout(initGoogleSignIn, 100);
      }
    };

    onMounted(() => {
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
    };
  },
};
