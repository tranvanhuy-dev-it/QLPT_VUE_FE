<template>
  <div class="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 md:py-12 bg-bg-main">
    <div class="max-w-xl w-full bg-card border border-border-main rounded-2xl shadow-lg p-6 md:p-8 transition-all duration-300">
      
      <!-- Nút quay lại -->
      <div class="flex items-center gap-2 mb-6">
        <button 
          @click="goBack" 
          class="btn btn-outline !p-1.5 rounded-xl border border-border-main hover:bg-border-main/20 active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-text-sub">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <span class="text-xs font-semibold text-text-sub">Quay lại trang trước</span>
      </div>

      <!-- Tiêu đề trang -->
      <div class="text-center mb-8">
        <h2 class="text-xl md:text-2xl font-bold text-primary mb-2">Liên Hệ Hỗ Trợ Kỹ Thuật</h2>
        <p class="text-xs md:text-sm text-text-sub max-w-md mx-auto leading-relaxed">
          Gửi yêu cầu hoặc đóng góp ý kiến của bạn trực tiếp tới bộ phận quản trị hệ thống. Chúng tôi sẽ phản hồi sớm nhất qua email hoặc số điện thoại.
        </p>
      </div>

      <!-- Form liên hệ -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Họ tên -->
          <div>
            <label class="block text-xs font-semibold mb-1.5 text-text-main">Họ và tên <span class="text-danger">*</span></label>
            <input 
              type="text" 
              v-model="form.name" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-border-main bg-white dark:bg-slate-900 text-text-main text-xs outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)] transition-all"
              placeholder="Nguyễn Văn A" 
              required 
            />
          </div>

          <!-- Số điện thoại -->
          <div>
            <label class="block text-xs font-semibold mb-1.5 text-text-main">Số điện thoại <span class="text-danger">*</span></label>
            <input 
              type="tel" 
              v-model="form.phone" 
              class="w-full px-3.5 py-2.5 rounded-xl border border-border-main bg-white dark:bg-slate-900 text-text-main text-xs outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)] transition-all"
              placeholder="09xx xxx xxx" 
              required 
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 text-text-main">Địa chỉ Email <span class="text-danger">*</span></label>
          <input 
            type="email" 
            v-model="form.email" 
            class="w-full px-3.5 py-2.5 rounded-xl border border-border-main bg-white dark:bg-slate-900 text-text-main text-xs outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)] transition-all"
            placeholder="example@domain.com" 
            required 
          />
        </div>

        <!-- Tiêu đề -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 text-text-main">Tiêu đề liên hệ <span class="text-danger">*</span></label>
          <input 
            type="text" 
            v-model="form.subject" 
            class="w-full px-3.5 py-2.5 rounded-xl border border-border-main bg-white dark:bg-slate-900 text-text-main text-xs outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)] transition-all"
            placeholder="Gặp sự cố thanh toán / Góp ý tính năng..." 
            required 
          />
        </div>

        <!-- Nội dung tin nhắn -->
        <div>
          <label class="block text-xs font-semibold mb-1.5 text-text-main">Nội dung chi tiết <span class="text-danger">*</span></label>
          <textarea 
            v-model="form.message" 
            rows="5"
            class="w-full px-3.5 py-2.5 rounded-xl border border-border-main bg-white dark:bg-slate-900 text-text-main text-xs outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)] transition-all resize-none"
            placeholder="Vui lòng nhập chi tiết nội dung cần hỗ trợ hoặc góp ý kỹ thuật..." 
            required
          ></textarea>
        </div>

        <!-- Nút gửi -->
        <button 
          type="submit" 
          :disabled="submitting"
          class="w-full btn btn-primary py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ submitting ? 'Đang gửi yêu cầu...' : 'Gửi Thông Tin Liên Hệ' }}</span>
        </button>
      </form>
    </div>

    <!-- MODAL BÁO THÀNH CÔNG / THẤT BẠI -->
    <div 
      v-if="modal.show" 
      class="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4"
    >
      <div class="bg-card border border-border-main p-6 rounded-2xl shadow-xl flex flex-col items-center space-y-4 max-w-sm w-full text-center">
        <!-- Success/Error Icon -->
        <div 
          class="w-12 h-12 rounded-full flex items-center justify-center"
          :class="modal.success ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600'"
        >
          <svg v-if="modal.success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>

        <h3 class="text-base font-bold text-text-main">{{ modal.title }}</h3>
        <p class="text-xs text-text-sub leading-relaxed">{{ modal.message }}</p>

        <button 
          @click="closeModal" 
          class="btn px-6 py-2 rounded-xl text-xs font-semibold shadow-xs"
          :class="modal.success ? 'btn-primary' : 'btn-secondary'"
        >
          Đồng ý
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import api from '../services/api.js';

export default {
  name: 'Contact',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const form = ref({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });

    const submitting = ref(false);
    const modal = ref({
      show: false,
      success: true,
      title: '',
      message: ''
    });

    // Tự động điền thông tin nếu người dùng đã đăng nhập
    onMounted(() => {
      if (authStore.isAuthenticated && authStore.user) {
        form.value.name = authStore.user.fullName || '';
      }
    });

    const goBack = () => {
      if (window.history.state && window.history.state.back) {
        router.back();
      } else {
        if (!authStore.isAuthenticated) {
          router.push('/login');
        } else {
          const role = authStore.role;
          if (role === 'ADMIN') router.push('/admin');
          else if (role === 'LANDLORD') router.push('/landlord');
          else if (role === 'TENANT') router.push('/tenant');
          else router.push('/login');
        }
      }
    };

    const closeModal = () => {
      modal.value.show = false;
      if (modal.value.success) {
        // Reset form sau khi gửi thành công
        form.value = {
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        };
        // Quay về trang chủ thích hợp
        if (!authStore.isAuthenticated) {
          router.push('/login');
        } else {
          const role = authStore.role;
          if (role === 'ADMIN') router.push('/admin');
          else if (role === 'LANDLORD') router.push('/landlord');
          else if (role === 'TENANT') router.push('/tenant');
          else router.push('/login');
        }
      }
    };

    const handleSubmit = async () => {
      submitting.value = true;

      try {
        // GỬI EMAIL THÔNG QUA JAVA BACKEND
        await api.post('/api/support/contact', form.value);

        modal.value = {
          show: true,
          success: true,
          title: 'Gửi yêu cầu thành công!',
          message: 'Cảm ơn bạn đã gửi ý kiến/yêu cầu. Hệ thống đã tiếp nhận và sẽ liên hệ lại với bạn sớm nhất.'
        };
      } catch (error) {
        console.error('Lỗi khi gửi mail liên hệ lên backend:', error);
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Đã có lỗi xảy ra trong quá trình gửi yêu cầu. Vui lòng kiểm tra kết nối mạng và thử lại sau.';
        modal.value = {
          show: true,
          success: false,
          title: 'Gửi yêu cầu thất bại!',
          message: errorMsg
        };
      } finally {
        submitting.value = false;
      }
    };

    return {
      form,
      submitting,
      modal,
      goBack,
      closeModal,
      handleSubmit
    };
  }
};
</script>
