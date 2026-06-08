import { ref, onMounted, computed } from 'vue';
import adminService from '../../services/adminService.js';

export default {
  name: 'AdminStats',
  setup() {
    const stats = ref({
      totalLandlords: 0,
      totalTenants: 0,
      totalUsers: 0,
      totalBoardingHouses: 0,
      totalRooms: 0,
      occupiedRooms: 0,
      occupancyRate: 0.0
    });
    
    const loading = ref(true);
    const error = ref(null);

    const fetchStats = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await adminService.getStatistics();
        stats.value = response.data;
      } catch (err) {
        console.error('Lỗi khi tải số liệu thống kê:', err);
        error.value = err.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
      } finally {
        loading.value = false;
      }
    };

    const avgRoomsPerHouse = computed(() => {
      if (stats.value.totalBoardingHouses === 0) return 0;
      return Math.round((stats.value.totalRooms / stats.value.totalBoardingHouses) * 10) / 10;
    });

    onMounted(() => {
      fetchStats();
    });

    return {
      stats,
      loading,
      error,
      fetchStats,
      avgRoomsPerHouse
    };
  }
};
