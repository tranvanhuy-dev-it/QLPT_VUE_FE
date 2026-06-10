<template>
  <div v-if="isGuest" class="h-[100dvh] w-screen overflow-y-auto bg-bg-main">
    <router-view />
  </div>
  <div v-else class="flex h-screen h-[100dvh] overflow-hidden bg-bg-main">
    <Sidebar />
    <div class="flex flex-col flex-1 min-w-0">
      <!-- Status Bar Spacer on Mobile -->
      <div 
        class="lg:hidden w-full shrink-0 transition-colors duration-150" 
        :class="hideHeaderOnMobile ? 'bg-bg-main' : 'bg-card border-b border-border-main/20'"
        :style="{ height: hideHeaderOnMobile ? 'calc(env(safe-area-inset-top, 20px) + 12px)' : 'env(safe-area-inset-top, 20px)' }"
      ></div>
      <Header />
      <main
        ref="mainRef"
        class="flex-1 p-0 overflow-y-auto flex flex-col justify-between relative lg:!pb-0 rounded-2xl"
        :style="{ paddingBottom: isBottomBarHidden ? '0px' : 'calc(4.5rem + env(safe-area-inset-bottom))' }"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- Pull to Refresh Indicator -->
        <div
          v-if="pullDistance > 0"
          class="flex items-center justify-center shrink-0 overflow-hidden transition-all duration-150"
          :style="{ height: Math.min(pullDistance, 70) + 'px' }"
        >
          <div class="flex items-center gap-2 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2.5"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': pullDistance >= pullThreshold }"
              :style="{ transform: pullDistance < pullThreshold ? `rotate(${pullDistance * 3}deg)` : '' }"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
            <span class="text-xs font-semibold">
              {{ isRefreshing ? 'Đang tải lại...' : pullDistance >= pullThreshold ? 'Thả để tải lại' : 'Kéo xuống để tải lại' }}
            </span>
            <div v-if="isRefreshing" class="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <div class="flex-grow">
          <router-view :key="routerViewKey" />
        </div>
        <footer 
          class="py-3 text-center text-xs text-text-sub border-t border-border-main/50 bg-card/60 backdrop-blur-xs shrink-0"
        >
          © 2026 Nhà Trọ Thông Minh. Hệ thống đang trong quá trình phát triển &amp; thử nghiệm.
        </footer>
      </main>
    </div>
  </div>

  <BottomBar :hidden="isBottomBarHidden" />

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
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Sidebar from './components/layout/Sidebar.vue';
import Header from './components/layout/Header.vue';
import BottomBar from './components/layout/BottomBar.vue';
import { isApiSaving } from './services/api';
import { useAuthStore, isTokenExpired } from './stores/auth.js';

export default {
  name: 'App',
  components: {
    Sidebar,
    Header,
    BottomBar,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const isGuest = computed(() => {
      return !authStore.isAuthenticated || !!(route.meta && route.meta.guestOnly);
    });

    const hideHeaderOnMobile = computed(() => {
      return !!(route.meta && route.meta.hideHeaderOnMobile);
    });

    const isBottomBarHidden = computed(() => {
      if (route.meta && (route.meta.hideBottomBar || route.meta.hideHeaderOnMobile)) return true;
      const path = route.path.toLowerCase();
      if (path.includes('/detail') || path.includes('/add') || path.includes('/create') || path.includes('/new') || route.params.id) return true;
      if (authStore.isBottomBarHidden) return true;
      return false;
    });

    // ==================== Pull to Refresh ====================
    const routerViewKey = ref(0);
    const mainRef = ref(null);
    const pullDistance = ref(0);
    const isRefreshing = ref(false);
    const pullThreshold = 60;
    let touchStartY = 0;
    let isPulling = false;

    const onTouchStart = (e) => {
      if (isRefreshing.value) return;
      const el = mainRef.value;
      // Chỉ kích hoạt khi scroll ở đầu trang
      if (el && el.scrollTop <= 0) {
        touchStartY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const onTouchMove = (e) => {
      if (!isPulling || isRefreshing.value) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY;
      if (diff > 0) {
        // Giảm dần lực kéo để tạo hiệu ứng "resistance"
        pullDistance.value = Math.min(diff * 0.45, 80);
      } else {
        pullDistance.value = 0;
        isPulling = false;
      }
    };

    const onTouchEnd = async () => {
      if (!isPulling || isRefreshing.value) return;
      isPulling = false;

      if (pullDistance.value >= pullThreshold) {
        isRefreshing.value = true;
        pullDistance.value = pullThreshold; // Giữ indicator ở vị trí

        // Force re-render view bằng cách thay đổi key
        routerViewKey.value = Date.now();

        // Chờ một chút để dữ liệu load xong
        await new Promise(resolve => setTimeout(resolve, 600));
        isRefreshing.value = false;
      }

      pullDistance.value = 0;
    };

    // ==================== Session Check ====================
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
      hideHeaderOnMobile,
      isApiSaving,
      isBottomBarHidden,
      // Pull to refresh
      mainRef,
      pullDistance,
      pullThreshold,
      isRefreshing,
      routerViewKey,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    };
  },
};
</script>
