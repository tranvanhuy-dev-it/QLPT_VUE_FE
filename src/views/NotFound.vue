<template>
  <div class="flex flex-col items-center justify-center min-h-[75vh] px-4 py-12 text-center bg-bg-main">
    <div class="max-w-md w-full p-8 md:p-10 bg-card border border-border-main rounded-2xl shadow-lg transition-all duration-300">
      <!-- Icon minh họa 404 sinh động -->
      <div class="flex justify-center mb-8">
        <div class="relative w-36 h-36 flex items-center justify-center bg-primary/5 dark:bg-primary/10 rounded-full animate-bounce duration-[2500ms]">
          <!-- SVG Space/Satellite/Radar Icon đại diện cho việc mất tín hiệu / lạc lối -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.25" stroke="currentColor" class="w-16 h-16 text-primary animate-pulse">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096m.813 5.096h4.875M16.25 5.75c0 .414-.336.75-.75.75H8.5c-.414 0-.75-.336-.75-.75S8.086 5 8.5 5h7c.414 0 .75.336.75.75zM3 16.25c0 .414.336.75.75.75h16.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H3.75c-.414 0-.75.336-.75.75zM7.5 10.25c0 .414.336.75.75.75h7.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H8.25c-.414 0-.75.336-.75.75z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m-9 9h18" />
          </svg>
          
          <!-- Radar Scanning Line Effect -->
          <div class="absolute inset-0 border border-primary/20 rounded-full animate-ping opacity-75"></div>
          
          <!-- Decorative Stars / Dots -->
          <div class="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping [animation-duration:1.5s]"></div>
          <div class="absolute bottom-6 left-3 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping [animation-duration:2s]"></div>
          <div class="absolute top-12 left-2 w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      <!-- Mã lỗi & Thông điệp -->
      <h1 class="text-6xl md:text-7xl font-extrabold text-primary mb-3 select-none tracking-wider drop-shadow-sm">404</h1>
      <h2 class="text-xl md:text-2xl font-bold text-text-main mb-3">Lạc lối giữa vũ trụ rồi!</h2>
      <p class="text-text-sub text-sm md:text-base mb-8 leading-relaxed max-w-sm mx-auto">
        Trang bạn đang tìm kiếm không tồn tại, đã bị thay đổi địa chỉ hoặc bạn không có quyền truy cập vào nội dung này.
      </p>

      <!-- Các nút điều hướng tiện ích -->
      <div class="flex flex-col sm:flex-row gap-3.5 justify-center">
        <button 
          @click="goHome" 
          class="btn btn-primary px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.25" stroke="currentColor" class="w-4 h-4 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Về Trang Chủ
        </button>
        <button 
          @click="goBack" 
          class="btn btn-outline px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center bg-card hover:bg-border-main/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.25" stroke="currentColor" class="w-4 h-4 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
          Quay lại trang trước
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

export default {
  name: 'NotFound',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const goHome = () => {
      if (!authStore.isAuthenticated) {
        router.push('/login');
      } else {
        const role = authStore.role;
        if (role === 'ADMIN') {
          router.push('/admin');
        } else if (role === 'LANDLORD') {
          router.push('/landlord');
        } else if (role === 'TENANT') {
          router.push('/tenant');
        } else {
          router.push('/login');
        }
      }
    };

    const goBack = () => {
      router.back();
    };

    return {
      goHome,
      goBack
    };
  }
};
</script>

<style scoped>
/* Thêm các hiệu ứng micro-animations tinh tế */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: .85;
    transform: scale(0.97);
  }
}
</style>
