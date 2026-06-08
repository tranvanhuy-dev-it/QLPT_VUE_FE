<template>
  <div v-if="isGuest" class="h-full h-[100dvh] w-screen overflow-y-auto bg-bg-main">
    <router-view />
  </div>
  <div v-else class="flex h-screen h-[100dvh] overflow-hidden bg-bg-main">
    <Sidebar />
    <div class="flex flex-col flex-1 min-w-0">
      <Header />
      <main class="flex-1 p-0 overflow-y-auto flex flex-col justify-between">
        <div class="flex-grow">
          <router-view />
        </div>
        <footer class="py-3 text-center text-xs text-text-sub border-t border-border-main/50 bg-card/60 backdrop-blur-xs shrink-0">
          © 2026 Nhà Trọ Thông Minh. Hệ thống đang trong quá trình phát triển & thử nghiệm.
        </footer>
      </main>
    </div>
  </div>



  <!-- Global Glassmorphic Loading Overlay for Saving/Submitting (POST/PUT/DELETE) -->
  <div v-if="isApiSaving" class="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[2px] z-[9999] flex flex-col items-center justify-center transition-all duration-300">
    <div class="bg-card border border-border-main p-6 rounded-2xl shadow-xl flex flex-col items-center space-y-4 max-w-[280px]">
      <div class="relative w-12 h-12">
        <div class="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p class="text-sm font-semibold text-text-main text-center animate-pulse">Đang xử lý dữ liệu...</p>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from './components/layout/Sidebar.vue';
import Header from './components/layout/Header.vue';
import { isApiSaving } from './services/api';
import { useAuthStore, isTokenExpired } from './stores/auth.js';

export default {
  name: 'App',
  components: {
    Sidebar,
    Header,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const isGuest = computed(() => {
      return !!(route.meta && route.meta.guestOnly);
    });

    let checkInterval = null;

    const checkSession = () => {
      if (authStore.token && isTokenExpired(authStore.token)) {
        authStore.logout();
        if (route.name !== 'Login' && route.name !== 'Register') {
          router.push('/login');
        }
      }
    };

    onMounted(async () => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      checkSession();
      
      // Nếu là chủ trọ và đã đăng nhập, kiểm tra trạng thái gói dịch vụ để đồng bộ mới nhất
      if (authStore.isAuthenticated && authStore.role === 'LANDLORD') {
        try {
          await authStore.checkSubscription();
        } catch (err) {
          console.error('Lỗi khi tự động kiểm tra trạng thái gói dịch vụ:', err);
        }
      }
      
      // Kiểm tra định kỳ mỗi 10 giây xem phiên đăng nhập đã hết hạn chưa
      checkInterval = setInterval(checkSession, 10000);
    });

    onUnmounted(() => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    });

    return {
      isGuest,
      isApiSaving,
    };
  },
};
</script>

