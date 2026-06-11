import { ref, onMounted } from 'vue';
import adminService from '../../services/adminService.js';
import { formatDateTime } from '../../utils/date.js';

export default {
  name: 'AdminLoginHistory',
  setup() {
    const logs = ref([]);
    const loading = ref(true);
    const currentPage = ref(0);
    const filters = ref({
      query: '',
      role: '',
      active: ''
    });

    const pagination = ref({
      totalElements: 0,
      totalPages: 1,
      start: 0,
      end: 0
    });

    const fetchHistory = async () => {
      loading.value = true;
      try {
        const activeParam = filters.value.active === '' ? null : filters.value.active;
        const res = await adminService.getAllLoginHistory({
          query: filters.value.query || null,
          role: filters.value.role || null,
          active: activeParam,
          page: currentPage.value,
          size: 15
        });
        
        logs.value = res.data.content || [];
        pagination.value = {
          totalElements: res.data.totalElements,
          totalPages: res.data.totalPages,
          start: res.data.totalElements > 0 ? currentPage.value * 15 + 1 : 0,
          end: Math.min((currentPage.value + 1) * 15, res.data.totalElements)
        };
      } catch (err) {
        console.error('Lỗi khi tải lịch sử đăng nhập:', err);
      } finally {
        loading.value = false;
      }
    };

    let searchTimeout = null;
    const debouncedSearch = () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentPage.value = 0;
        fetchHistory();
      }, 400);
    };

    const nextPage = () => {
      if (currentPage.value < pagination.value.totalPages - 1) {
        currentPage.value++;
        fetchHistory();
      }
    };

    const prevPage = () => {
      if (currentPage.value > 0) {
        currentPage.value--;
        fetchHistory();
      }
    };

    const formatUA = (ua) => {
      if (!ua) return 'Không rõ';
      let browser = 'Không rõ';
      let os = 'Không rõ';
      const uaLower = ua.toLowerCase();

      if (uaLower.includes('firefox')) browser = 'Firefox';
      else if (uaLower.includes('edge')) browser = 'Edge';
      else if (uaLower.includes('opera') || uaLower.includes('opr')) browser = 'Opera';
      else if (uaLower.includes('chrome') || uaLower.includes('crios')) browser = 'Chrome';
      else if (uaLower.includes('safari')) browser = 'Safari';

      if (uaLower.includes('windows')) os = 'Windows';
      else if (uaLower.includes('macintosh') || uaLower.includes('mac os')) os = 'macOS';
      else if (uaLower.includes('iphone') || uaLower.includes('ipad')) os = 'iOS';
      else if (uaLower.includes('android')) os = 'Android';
      else if (uaLower.includes('linux')) os = 'Linux';

      return `${browser} (${os})`;
    };

    const getRoleName = (role) => {
      switch (role) {
        case 'ADMIN': return 'Admin';
        case 'LANDLORD': return 'Chủ trọ';
        case 'TENANT': return 'Khách thuê';
        default: return role;
      }
    };

    onMounted(() => {
      fetchHistory();
    });

    return {
      logs,
      loading,
      currentPage,
      filters,
      pagination,
      debouncedSearch,
      fetchHistory,
      nextPage,
      prevPage,
      formatDateTime,
      formatUA,
      getRoleName
    };
  }
};
