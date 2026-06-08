import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import userService from '../services/userService.js';
import Modal from './Modal.vue';
import FormInput from './FormInput.vue';
import FormButton from './FormButton.vue';

export default {
  name: 'Header',
  components: {
    Modal,
    FormInput,
    FormButton,
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
        case 'AdminDashboard': return 'Danh sách chủ trọ';
        case 'TenantDashboard': return 'Thông tin phòng trọ';
        default: return 'Chi tiết';
      }
    });

    const theme = ref(localStorage.getItem('theme') || 'light');

    const toggleTheme = () => {
      const newTheme = theme.value === 'dark' ? 'light' : 'dark';
      theme.value = newTheme;
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
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
        alert('Cập nhật thông tin cá nhân thành công!');
        showProfileModal.value = false;
      } catch (err) {
        alert(err.response?.data?.error || 'Cập nhật thông tin thất bại');
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
        alert('Mật khẩu mới và xác nhận mật khẩu không trùng khớp!');
        return;
      }
      try {
        await userService.changePassword({
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword,
        });
        alert('Đổi mật khẩu thành công!');
        showPasswordModal.value = false;
      } catch (err) {
        alert(err.response?.data?.error || 'Đổi mật khẩu thất bại');
      }
    };

    const handleLogout = () => {
      authStore.logout();
      router.push('/login');
    };

    const toggleSidebar = () => {
      authStore.toggleSidebar();
    };

    const handleDocumentClick = (e) => {
      if (!e.target.closest('.profile-dropdown-container')) {
        showDropdown.value = false;
      }
    };

    onMounted(() => {
      document.documentElement.setAttribute('data-theme', theme.value);
      if (authStore.isAuthenticated) {
        fetchUserProfile();
      }
      document.addEventListener('click', handleDocumentClick);
    });

    onUnmounted(() => {
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
      showDropdown,
      showProfileModal,
      showPasswordModal,
      profileForm,
      passwordForm,
      openProfileModal,
      saveProfile,
      openPasswordModal,
      savePassword,
    };
  }
};
