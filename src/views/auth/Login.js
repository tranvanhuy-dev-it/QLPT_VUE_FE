import { ref } from 'vue';
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

    return {
      username,
      password,
      error,
      loading,
      handleLogin,
    };
  },
};
