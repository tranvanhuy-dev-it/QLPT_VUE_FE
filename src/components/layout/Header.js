import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { useNotificationStore } from '../../stores/notification.js';
import { useChatStore } from '../../stores/chat.js';
import { formatDateTime } from '../../utils/date.js';
import userService from '../../services/userService.js';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

import ConfirmModal from '../ui/ConfirmModal.vue';

export default {
  name: 'Header',
  components: {
    ConfirmModal,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const chatStore = useChatStore();

    const profileUser = ref(null);
    const chatUnreadCount = computed(() => chatStore.totalUnreadCount);
    const username = computed(() => authStore.user?.fullName || profileUser.value?.fullName || authStore.username || 'Người dùng');
    
    const userInitial = computed(() => {
      const name = username.value;
      return name ? name.charAt(0).toUpperCase() : 'U';
    });

    const roleLabel = computed(() => {
      if (authStore.role === 'ADMIN') return 'Quản trị viên';
      if (authStore.role === 'LANDLORD') return 'Chủ trọ';
      if (authStore.role === 'TENANT') return 'Người thuê';
      return 'Khách';
    });

    const parentRoute = computed(() => {
      const path = route.path;
      if (path.startsWith('/landlord')) return 'Chủ trọ';
      if (path.startsWith('/admin')) return 'Hệ thống';
      if (path.startsWith('/tenant')) return 'Cổng người thuê';
      return 'Trang chủ';
    });

    const currentRoute = computed(() => {
      const name = route.name;
      switch (name) {
        case 'LandlordDashboard': return 'Tổng quan';
        case 'BoardingHouses': return 'Danh sách dãy trọ';
        case 'Rooms': return 'Quản lý phòng trọ';
        case 'Contracts': return 'Hợp đồng thuê';
        case 'Invoices': return 'Hóa đơn & Thanh toán';
        case 'Revenue': return 'Báo cáo Doanh thu';
        case 'TaxDeclaration': return 'Khai báo Thuế';
        case 'Tenants': return 'Tài khoản khách thuê';
        case 'AdminStats': return 'Tổng quan';
        case 'AdminLandlords': return 'Quản lý chủ trọ';
        case 'AdminRequests': return 'Duyệt kích hoạt gói';
        case 'TenantDashboard': return 'Thông tin phòng trọ';
        case 'SubscriptionUpgrade': return 'Gói dịch vụ & Gia hạn';
        case 'Cameras': return 'Hệ thống Camera';
        case 'TenantCameras': return 'Camera giám sát';
        case 'TenantContactLandlord': return 'Liên hệ chủ nhà';
        case 'AdminLoginHistory': return 'Lịch sử đăng nhập';
        case 'AdminSettings': return 'Cài đặt hệ thống';
        case 'Settings': return 'Cài đặt & Quyền riêng tư';
        default: return 'Chi tiết';
      }
    });

    // Dropdown State
    const showDropdown = ref(false);

    const {
      confirmModal,
      showAlert,
      onConfirmModal,
      closeConfirmModal
    } = useConfirmModal();

    const fetchUserProfile = async () => {
      try {
        const res = await userService.getProfile();
        profileUser.value = res.data;
        if (authStore.user) {
          authStore.user.fullName = res.data.fullName;
          localStorage.setItem('user', JSON.stringify(authStore.user));
        }
      } catch (err) {
        console.error('Không thể lấy thông tin cá nhân:', err);
      }
    };

    const navigateToSettings = () => {
      showDropdown.value = false;
      router.push('/settings');
    };

    const notificationStore = useNotificationStore();
    const showNotificationsDropdown = ref(false);

    const notifications = computed(() => notificationStore.notifications);
    const unreadCount = computed(() => notificationStore.unreadCount);
    const loadingNotifications = computed(() => notificationStore.loading);
    const hasMore = computed(() => notificationStore.hasMore);

    const expandedNotifications = ref({});
    const toggleExpand = (id) => {
      expandedNotifications.value[id] = !expandedNotifications.value[id];
    };

    const toggleNotifications = () => {
      showNotificationsDropdown.value = !showNotificationsDropdown.value;
      if (showNotificationsDropdown.value) {
        notificationStore.fetchNotifications(0, 10);
        notificationStore.fetchUnreadCount();
      }
    };

    const loadMoreNotifications = async () => {
      if (loadingNotifications.value) return;
      const nextPage = notificationStore.currentPage + 1;
      await notificationStore.fetchNotifications(nextPage, 10, true);
    };

    const markAllAsRead = async () => {
      await notificationStore.markAllAsRead();
    };

    const handleNotificationClick = async (notif) => {
      if (!notif.isRead) {
        await notificationStore.markAsRead(notif.id);
      }
      showNotificationsDropdown.value = false;

      // Điều hướng dựa trên loại thông báo
      if (notif.type === 'INVOICE_NEW' || notif.type === 'PAYMENT_CONFIRMED' || notif.type === 'PAYMENT_REPORTED' || notif.type === 'PAYMENT_REMINDER') {
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
      }
    };

    const getIconClass = (type) => {
      switch (type) {
        case 'INVOICE_NEW':
          return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
        case 'PAYMENT_CONFIRMED':
          return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400';
        case 'CONTRACT_ACTIVE':
          return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400';
        default:
          return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400';
      }
    };

    const formatTime = formatDateTime;

    const handleLogout = () => {
      notificationStore.stopPolling();
      authStore.logout();
      router.push('/login');
    };

    const isSidebarOpen = computed(() => authStore.isSidebarOpen);

    const toggleSidebar = () => {
      authStore.toggleSidebar();
    };

    const role = computed(() => authStore.role);

    const navigateToUpgrade = () => {
      showDropdown.value = false;
      router.push('/landlord/upgrade');
    };

    const navigateToTenants = () => {
      showDropdown.value = false;
      router.push('/landlord/tenants');
    };

    const navigateToRevenue = () => {
      showDropdown.value = false;
      router.push('/landlord/revenue');
    };

    const navigateToTax = () => {
      showDropdown.value = false;
      router.push('/landlord/tax');
    };

    const goToOverview = () => {
      if (authStore.role === 'ADMIN') {
        router.push('/admin');
      } else if (authStore.role === 'LANDLORD') {
        router.push('/landlord');
      } else if (authStore.role === 'TENANT') {
        router.push('/tenant/chat');
      } else {
        router.push('/');
      }
    };

    const handleDocumentClick = (e) => {
      if (!e.target.closest('.profile-dropdown-container')) {
        showDropdown.value = false;
      }
      if (!e.target.closest('.notifications-dropdown-container')) {
        showNotificationsDropdown.value = false;
      }
    };

    const hideOnMobile = computed(() => {
      return !!route.meta.hideHeaderOnMobile;
    });

    onMounted(() => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', savedTheme);
      if (authStore.isAuthenticated) {
        fetchUserProfile();
        // Polling thông báo được quản lý bởi App.vue
        // Chỉ fetch lần đầu để hiển thị ngay
        notificationStore.fetchUnreadCount();
        notificationStore.fetchNotifications(0, 10);
      }
      document.addEventListener('click', handleDocumentClick);
    });

    onUnmounted(() => {
      // Không gọi stopPolling() ở đây vì App.vue quản lý vòng đời polling
      document.removeEventListener('click', handleDocumentClick);
    });

    return {
      hideOnMobile,
      username,
      userInitial,
      roleLabel,
      parentRoute,
      currentRoute,
      navigateToSettings,
      handleLogout,
      isSidebarOpen,
      toggleSidebar,
      role,
      navigateToUpgrade,
      navigateToTenants,
      navigateToRevenue,
      navigateToTax,
      goToOverview,
      showDropdown,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
      // Notifications properties & methods
      showNotificationsDropdown,
      notifications,
      unreadCount,
      chatUnreadCount,
      loadingNotifications,
      hasMore,
      toggleNotifications,
      loadMoreNotifications,
      markAllAsRead,
      handleNotificationClick,
      getIconClass,
      formatTime,
      expandedNotifications,
      toggleExpand,
    };
  }
};
