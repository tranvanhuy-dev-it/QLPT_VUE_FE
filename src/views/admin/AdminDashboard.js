import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth.js';
import { useRouter } from 'vue-router';
import adminService from '../../services/adminService.js';
import userService from '../../services/userService.js';
import ConfirmModal from '../../components/ConfirmModal.vue';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'AdminDashboard',
  components: {
    ConfirmModal,
  },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const { confirmModal, showAlert, showConfirm, onConfirmModal, closeConfirmModal } = useConfirmModal();

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
        showAlert('Lỗi', err.response?.data?.error || 'Không thể tải danh sách chủ trọ', 'danger');
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
        showAlert('Lỗi', err.response?.data?.error || 'Thao tác thay đổi trạng thái thất bại', 'danger');
      }
    };

    const resetPassword = async (landlord) => {
      const confirmMsg = `Bạn có chắc chắn muốn đặt lại mật khẩu cho chủ trọ "${landlord.fullName}"? Mật khẩu mới sẽ là số điện thoại của họ (hoặc "123456" nếu không có số điện thoại).`;
      showConfirm(
        'Đặt lại mật khẩu',
        confirmMsg,
        'warning',
        async () => {
          try {
            await userService.resetPassword(landlord.id);
            showAlert('Thành công', 'Đặt lại mật khẩu thành công!', 'success');
          } catch (err) {
            showAlert('Lỗi', err.response?.data?.error || 'Không thể đặt lại mật khẩu cho chủ trọ', 'danger');
          }
        }
      );
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
      resetPassword,
      changePage,
      logout,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
