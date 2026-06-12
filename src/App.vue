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
        :class="(hideHeaderOnMobile || isHeaderHidden) ? 'bg-bg-main' : 'bg-card border-b border-border-main/20'"
        :style="{ height: (hideHeaderOnMobile || isHeaderHidden) ? 'calc(env(safe-area-inset-top, 20px) + 12px)' : 'env(safe-area-inset-top, 20px)' }"
      ></div>
      <Header v-if="!isHeaderHidden" />
      <main
        ref="mainRef"
        class="flex-1 p-0 overflow-y-auto flex flex-col justify-between relative lg:rounded-2xl"
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
          class="hidden lg:block py-3 text-center text-xs text-text-sub border-t border-border-main/50 bg-card/60 backdrop-blur-xs shrink-0"
        >
          © 2026 Nhà Trọ Thông Minh. Hệ thống đang trong quá trình phát triển &amp; thử nghiệm.
        </footer>
        <!-- Bottom Safe Area Spacer to prevent content from being covered by BottomBar or device safe areas on mobile -->
        <div 
          class="w-full shrink-0 lg:hidden" 
          :style="{ height: isBottomBarHidden ? 'calc(0.5rem + env(safe-area-inset-bottom, 8px))' : 'calc(6.5rem + env(safe-area-inset-bottom, 16px))' }"
        ></div>
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
      <p class="text-sm font-semibold text-text-main text-center animate-pulse">{{ savingMessage }}</p>
    </div>
  </div>

  <!-- Global Real-Time Notification Toast Popup -->
  <transition name="toast-slide">
    <div 
      v-if="activeToast" 
      class="fixed top-6 md:top-20 right-4 left-4 md:left-auto md:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-4 z-[99999] flex gap-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition duration-200"
      @click="clickToast"
    >
      <!-- Icon based on type -->
      <div 
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        :class="{
          'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400': activeToast.type === 'PAYMENT_REPORTED' || activeToast.type === 'PAYMENT_CONFIRMED',
          'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400': activeToast.type === 'INVOICE_NEW',
          'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400': activeToast.type === 'SUBSCRIPTION_REQUEST' || activeToast.type === 'PAYMENT_REMINDER',
          'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400': activeToast.type === 'CONTRACT_ACTIVE',
          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400': !['PAYMENT_REPORTED', 'PAYMENT_CONFIRMED', 'INVOICE_NEW', 'SUBSCRIPTION_REQUEST', 'PAYMENT_REMINDER', 'CONTRACT_ACTIVE'].includes(activeToast.type)
        }"
      >
        <!-- SVG Icons -->
        <svg v-if="activeToast.type === 'PAYMENT_REPORTED' || activeToast.type === 'PAYMENT_CONFIRMED'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <svg v-else-if="activeToast.type === 'INVOICE_NEW'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <svg v-else-if="activeToast.type === 'SUBSCRIPTION_REQUEST' || activeToast.type === 'PAYMENT_REMINDER'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <svg v-else-if="activeToast.type === 'CONTRACT_ACTIVE'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5.5 h-5.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0 pr-4">
        <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100 mb-0.5 truncate">{{ activeToast.title }}</h4>
        <p class="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">{{ activeToast.content }}</p>
      </div>

      <!-- Close Button -->
      <button 
        class="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-0.5"
        @click.stop="dismissToast"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </transition>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import Sidebar from './components/layout/Sidebar.vue';
import Header from './components/layout/Header.vue';
import BottomBar from './components/layout/BottomBar.vue';
import { isApiSaving } from './services/api';
import { useAuthStore, isTokenExpired } from './stores/auth.js';
import { useNotificationStore } from './stores/notification.js';
import { useChatStore } from './stores/chat.js';

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
    const notificationStore = useNotificationStore();
    const chatStore = useChatStore();

    const applyFontSize = (size) => {
      let fontSizePx = '16px';
      if (size === 'small') fontSizePx = '14px';
      else if (size === 'medium') fontSizePx = '16px';
      else if (size === 'large') fontSizePx = '18px';
      else if (size === 'xlarge') fontSizePx = '20px';
      document.documentElement.style.fontSize = fontSizePx;
    };

    const isGuest = computed(() => {
      return !authStore.isAuthenticated || !!(route.meta && route.meta.guestOnly);
    });

    const hideHeaderOnMobile = computed(() => {
      return !!(route.meta && route.meta.hideHeaderOnMobile);
    });

    const isHeaderHidden = computed(() => {
      return authStore.isHeaderHidden || !!(route.meta && route.meta.hideHeader);
    });

    const isBottomBarHidden = computed(() => {
      if (route.meta && (route.meta.hideBottomBar || route.meta.hideHeaderOnMobile || route.meta.hideHeader)) return true;
      const path = route.path.toLowerCase();
      if (path.includes('/detail') || path.includes('/add') || path.includes('/create') || path.includes('/new') || route.params.id) return true;
      if (authStore.isBottomBarHidden) return true;
      return false;
    });

    const savingMessage = computed(() => {
      return route.path === '/login' ? 'Đang xác thực và tạo phiên làm việc...' : 'Đang xử lý dữ liệu...';
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

    // ==================== Status Bar Configuration ====================
    const updateStatusBar = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const isDark = currentTheme === 'dark';

        // Set status bar style (text/icons color)
        await StatusBar.setStyle({
          style: isDark ? Style.Dark : Style.Light,
        });

        // Set background color on Android
        let hexColor = '#ffffff';
        if (isDark) {
          hexColor = (hideHeaderOnMobile.value || isHeaderHidden.value) ? '#0f172a' : '#1e293b';
        } else {
          hexColor = (hideHeaderOnMobile.value || isHeaderHidden.value) ? '#f4f6f9' : '#ffffff';
        }

        await StatusBar.setBackgroundColor({ color: hexColor });
      } catch (err) {
        console.error('Lỗi khi cập nhật Status Bar:', err);
      }
    };

    watch([hideHeaderOnMobile, isHeaderHidden], () => {
      updateStatusBar();
    });

    // Theo dõi trạng thái đăng nhập để kết nối/ngắt kết nối WebSocket
    watch(() => authStore.isAuthenticated, (isAuthenticated) => {
      if (isAuthenticated) {
        notificationStore.connectWebSocket();
        chatStore.connectWebSocket();
      } else {
        notificationStore.disconnectWebSocket();
        chatStore.disconnectWebSocket();
      }
    });

    // ==================== Session Check ====================
    let checkInterval = null;
    let themeObserver = null;

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
      const savedFontSize = localStorage.getItem('fontSize') || 'medium';
      applyFontSize(savedFontSize);
      checkSession();

      // Khởi tạo và đồng bộ hóa Status Bar cho Capacitor
      if (Capacitor.isNativePlatform()) {
        updateStatusBar();
        themeObserver = new MutationObserver(() => {
          updateStatusBar();
        });
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        });
      }
      
      // Nếu là chủ trọ và đã đăng nhập, kiểm tra trạng thái gói dịch vụ để đồng bộ mới nhất
      if (authStore.isAuthenticated && authStore.role === 'LANDLORD') {
        try {
          await authStore.checkSubscription();
        } catch (err) {
          console.error('Lỗi khi tự động kiểm tra trạng thái gói dịch vụ:', err);
        }
      }

      // Khởi động polling thông báo tại App root để luôn hoạt động dù Header bị ẩn
      if (authStore.isAuthenticated) {
        notificationStore.startPolling();
        chatStore.connectWebSocket();
      }
      
      // Kiểm tra định kỳ mỗi 10 giây xem phiên đăng nhập đã hết hạn chưa
      checkInterval = setInterval(checkSession, 10000);
    });

    const activeToast = computed(() => notificationStore.activeToast);
    
    const dismissToast = () => {
      notificationStore.activeToast = null;
    };

    const clickToast = async () => {
      const notif = activeToast.value;
      if (!notif) return;
      
      dismissToast();
      await notificationStore.markAsRead(notif.id);
      
      if (notif.type === 'INVOICE_NEW' || notif.type === 'PAYMENT_CONFIRMED' || notif.type === 'PAYMENT_REMINDER' || notif.type === 'PAYMENT_REPORTED') {
        if (authStore.role === 'LANDLORD') {
          if (notif.referenceId) {
            router.push({ name: 'InvoiceDetail', params: { id: notif.referenceId } });
          } else {
            router.push('/landlord/invoices');
          }
        } else if (authStore.role === 'TENANT') {
          if (notif.referenceId) {
            router.push({ name: 'TenantInvoiceDetail', params: { id: notif.referenceId } });
          } else {
            router.push('/tenant/invoices');
          }
        }
      } else if (notif.type === 'CONTRACT_ACTIVE') {
        if (authStore.role === 'LANDLORD') {
          if (notif.referenceId) {
            router.push({ name: 'ContractDetail', params: { id: notif.referenceId } });
          } else {
            router.push('/landlord/contracts');
          }
        } else if (authStore.role === 'TENANT') {
          if (notif.referenceId) {
            router.push({ name: 'TenantContractDetail', params: { id: notif.referenceId } });
          } else {
            router.push('/tenant/contracts');
          }
        }
      } else if (notif.type === 'SUBSCRIPTION_REQUEST') {
        if (authStore.role === 'ADMIN') {
          router.push('/admin/requests');
        }
      }
    };

    onUnmounted(() => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (themeObserver) {
        themeObserver.disconnect();
      }
      notificationStore.stopPolling();
      chatStore.disconnectWebSocket();
    });

    return {
      isGuest,
      hideHeaderOnMobile,
      isApiSaving,
      isBottomBarHidden,
      isHeaderHidden,
      savingMessage,
      // Pull to refresh
      mainRef,
      pullDistance,
      pullThreshold,
      isRefreshing,
      routerViewKey,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      activeToast,
      dismissToast,
      clickToast,
    };
  },
};
</script>

<style scoped>
/* Toast slide animation */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-2rem) scale(0.95);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-1rem) scale(0.95);
}
</style>
