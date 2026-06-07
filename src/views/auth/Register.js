import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import { useRouter } from 'vue-router';

export default {
  name: 'Register',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const username = ref('');
    const password = ref('');
    const fullName = ref('');
    const phone = ref('');
    const email = ref('');
    const identityCard = ref('');
    const idCardIssueDate = ref('');
    const idCardIssuePlace = ref('');
    
    const error = ref('');
    const success = ref('');
    const loading = ref(false);

    const handleRegister = async () => {
      error.value = '';
      success.value = '';
      loading.value = true;
      try {
        await authStore.register(
          username.value,
          password.value,
          email.value,
          phone.value,
          fullName.value,
          'LANDLORD', // Vai trò mặc định khi tự đăng ký là CHỦ TRỌ
          identityCard.value,
          idCardIssueDate.value ? idCardIssueDate.value : null,
          idCardIssuePlace.value
        );

        success.value = 'Đăng ký tài khoản thành công! Đang chuyển về trang Đăng nhập...';
        
        // Trì hoãn 2 giây rồi chuyển trang
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (err) {
        error.value = err;
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      fullName,
      phone,
      email,
      identityCard,
      idCardIssueDate,
      idCardIssuePlace,
      error,
      success,
      loading,
      handleRegister,
    };
  },
};
