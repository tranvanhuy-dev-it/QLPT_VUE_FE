import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import { useNotificationStore } from '../../stores/notification.js';
import userService from '../../services/userService.js';
import Modal from '../ui/Modal.vue';
import FormInput from '../ui/FormInput.vue';
import FormButton from '../ui/FormButton.vue';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

import ConfirmModal from '../ui/ConfirmModal.vue';

export default {
  name: 'Header',
  components: {
    Modal,
    FormInput,
    FormButton,
    ConfirmModal,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const profileUser = ref(null);
    const username = computed(() => profileUser.value?.fullName || authStore.username || 'Người dùng');
    
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
        case 'Tenants': return 'Tài khoản khách thuê';
        case 'AdminStats': return 'Tổng quan';
        case 'AdminLandlords': return 'Quản lý chủ trọ';
        case 'AdminRequests': return 'Duyệt kích hoạt gói';
        case 'TenantDashboard': return 'Thông tin phòng trọ';
        case 'SubscriptionUpgrade': return 'Gói dịch vụ & Gia hạn';
        default: return 'Chi tiết';
      }
    });

    const theme = ref(localStorage.getItem('theme') || 'light');

    const toggleTheme = () => {
      const newTheme = theme.value === 'dark' ? 'light' : 'dark';
      theme.value = newTheme;
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      showDropdown.value = false; // Đóng dropdown sau khi đổi theme
    };

    // Dropdown and Profile/Password Modals State
    const showDropdown = ref(false);
    const showProfileModal = ref(false);
    const showPasswordModal = ref(false);

    const profileForm = ref({
      fullName: '',
      email: '',
      phone: '',
    });

    const passwordForm = ref({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

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
      } catch (err) {
        console.error('Không thể lấy thông tin cá nhân:', err);
      }
    };

    const openProfileModal = async () => {
      showDropdown.value = false;
      await fetchUserProfile();
      if (profileUser.value) {
        profileForm.value = {
          fullName: profileUser.value.fullName || '',
          email: profileUser.value.email || '',
          phone: profileUser.value.phone || '',
        };
      }
      showProfileModal.value = true;
    };

    const saveProfile = async () => {
      try {
        const res = await userService.updateProfile(profileForm.value);
        profileUser.value = res.data;
        showAlert('Thành công', 'Cập nhật thông tin cá nhân thành công!', 'success');
        showProfileModal.value = false;
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Cập nhật thông tin thất bại', 'danger');
      }
    };

    const openPasswordModal = () => {
      showDropdown.value = false;
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
      showPasswordModal.value = true;
    };

    const savePassword = async () => {
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        showAlert('Cảnh báo', 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp!', 'warning');
        return;
      }
      try {
        await userService.changePassword({
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword,
        });
        showAlert('Thành công', 'Đổi mật khẩu thành công!', 'success');
        showPasswordModal.value = false;
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Đổi mật khẩu thất bại', 'danger');
      }
    };

    const notificationStore = useNotificationStore();
    const showNotificationsDropdown = ref(false);

    const notifications = computed(() => notificationStore.notifications);
    const unreadCount = computed(() => notificationStore.unreadCount);
    const loadingNotifications = computed(() => notificationStore.loading);
    const hasMore = computed(() => notificationStore.hasMore);

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
      if (notif.type === 'INVOICE_NEW' || notif.type === 'PAYMENT_CONFIRMED' || notif.type === 'PAYMENT_REMINDER') {
        if (authStore.role === 'LANDLORD') {
          router.push('/landlord/invoices');
        } else if (authStore.role === 'TENANT') {
          router.push('/tenant/invoices');
        }
      } else if (notif.type === 'CONTRACT_ACTIVE') {
        if (authStore.role === 'LANDLORD') {
          router.push('/landlord/contracts');
        } else if (authStore.role === 'TENANT') {
          router.push('/tenant/contracts');
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

    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      try {
        const d = new Date(timeStr);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      } catch (e) {
        return timeStr;
      }
    };

    const handleLogout = () => {
      notificationStore.stopPolling();
      authStore.logout();
      router.push('/login');
    };

    const toggleSidebar = () => {
      authStore.toggleSidebar();
    };

    const role = computed(() => authStore.role);

    const navigateToUpgrade = () => {
      showDropdown.value = false;
      router.push('/landlord/upgrade');
    };

    const handleDocumentClick = (e) => {
      if (!e.target.closest('.profile-dropdown-container')) {
        showDropdown.value = false;
      }
      if (!e.target.closest('.notifications-dropdown-container')) {
        showNotificationsDropdown.value = false;
      }
    };

    onMounted(() => {
      document.documentElement.setAttribute('data-theme', theme.value);
      if (authStore.isAuthenticated) {
        fetchUserProfile();
        notificationStore.startPolling();
      }
      document.addEventListener('click', handleDocumentClick);
    });

    onUnmounted(() => {
      notificationStore.stopPolling();
      document.removeEventListener('click', handleDocumentClick);
    });

    return {
      username,
      userInitial,
      roleLabel,
      parentRoute,
      currentRoute,
      theme,
      toggleTheme,
      handleLogout,
      toggleSidebar,
      role,
      navigateToUpgrade,
      showDropdown,
      showProfileModal,
      showPasswordModal,
      profileForm,
      passwordForm,
      openProfileModal,
      saveProfile,
      openPasswordModal,
      savePassword,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
      // Notifications properties & methods
      showNotificationsDropdown,
      notifications,
      unreadCount,
      loadingNotifications,
      hasMore,
      toggleNotifications,
      loadMoreNotifications,
      markAllAsRead,
      handleNotificationClick,
      getIconClass,
      formatTime,
    };
  }
};
