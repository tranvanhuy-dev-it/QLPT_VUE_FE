import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

export default {
  name: 'Header',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const username = computed(() => authStore.username || 'Người dùng');
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

    onMounted(() => {
      document.documentElement.setAttribute('data-theme', theme.value);
    });

    const handleLogout = () => {
      authStore.logout();
      router.push('/login');
    };

    const toggleSidebar = () => {
      authStore.toggleSidebar();
    };

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
    };
  }
};
