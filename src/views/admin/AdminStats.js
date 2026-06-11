import { ref, onMounted, computed } from 'vue';
import adminService from '../../services/adminService.js';
import { useAuthStore } from '../../stores/auth.js';
import AppIcon from '../../components/ui/icons/AppIcon.vue';

export default {
  name: 'AdminStats',
  components: {
    AppIcon,
  },
  setup() {
    const authStore = useAuthStore();

    const currentDate = computed(() => {
      const d = new Date();
      const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    });

    const greeting = computed(() => {
      const hour = new Date().getHours();
      const name = authStore.user?.fullName || authStore.user?.username || 'Người dùng';
      if (hour < 12) return `Chào buổi sáng, ${name}`;
      if (hour < 18) return `Chào buổi chiều, ${name}`;
      return `Chào buổi tối, ${name}`;
    });
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
      avgRoomsPerHouse,
      greeting,
      currentDate,
    };
  }
};
