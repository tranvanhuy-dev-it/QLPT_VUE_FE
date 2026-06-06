import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import { useRouter } from 'vue-router';
import adminService from '../../services/adminService.js';

export default {
  name: 'AdminDashboard',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const landlords = ref([]);
    const loading = ref(false);
    
    // Pagination states
    const page = ref(0);
    const size = ref(10);
    const totalPages = ref(0);
    const totalElements = ref(0);

    const fetchLandlords = async () => {
      loading.value = true;
      try {
        const response = await adminService.getLandlords({
          page: page.value,
          size: size.value,
        });
        landlords.value = response.data.content;
        totalPages.value = response.data.totalPages;
        totalElements.value = response.data.totalElements;
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải danh sách chủ trọ');
      } finally {
        loading.value = false;
      }
    };

    const toggleStatus = async (id) => {
      try {
        await adminService.toggleLandlordStatus(id);
        // Refresh the active page
        fetchLandlords();
      } catch (err) {
        alert(err.response?.data?.error || 'Thao tác thay đổi trạng thái thất bại');
      }
    };

    const changePage = (newPage) => {
      if (newPage >= 0 && newPage < totalPages.value) {
        page.value = newPage;
        fetchLandlords();
      }
    };

    const logout = () => {
      authStore.logout();
      router.push('/login');
    };

    onMounted(() => {
      fetchLandlords();
    });

    return {
      landlords,
      loading,
      page,
      totalPages,
      totalElements,
      toggleStatus,
      changePage,
      logout,
    };
  },
};
