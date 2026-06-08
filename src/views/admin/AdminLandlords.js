import { ref, onMounted } from 'vue';
import adminService from '../../services/adminService.js';
import subscriptionService from '../../services/subscriptionService.js';
import userService from '../../services/userService.js';
import Modal from '../../components/ui/Modal.vue';
import FormButton from '../../components/ui/FormButton.vue';
import ConfirmModal from '../../components/ui/ConfirmModal.vue';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'AdminLandlords',
  components: {
    Modal,
    FormButton,
    ConfirmModal
  },
  setup() {
    const landlords = ref([]);
    const loading = ref(true);
    const page = ref(0);
    const size = ref(10);
    const totalPages = ref(0);
    const totalElements = ref(0);
    const selectedLandlord = ref(null);

    // Manual Extension Modal states
    const showExtendModal = ref(false);
    const extendMonths = ref(6);
    const extending = ref(false);

    const {
      confirmModal,
      showConfirm,
      showAlert,
      onConfirmModal,
      closeConfirmModal
    } = useConfirmModal();

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

    const selectLandlord = (landlord) => {
      selectedLandlord.value = landlord;
    };

    const toggleStatus = async (user) => {
      showConfirm(
        user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
        `Bạn có chắc chắn muốn ${user.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản chủ trọ "${user.username}"?`,
        user.status === 'ACTIVE' ? 'warning' : 'primary',
        async () => {
          try {
            const res = await adminService.toggleLandlordStatus(user.id);
            showAlert('Thành công', `${user.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`, 'success');
            
            // Sync details local display
            selectedLandlord.value = res.data;
            fetchLandlords();
          } catch (err) {
            showAlert('Lỗi', err.response?.data?.error || 'Thực hiện thất bại', 'danger');
          }
        }
      );
    };

    const resetPassword = async (user) => {
      showConfirm(
        'Reset mật khẩu',
        `Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản "${user.username}" về mặc định (số điện thoại hoặc 123456)?`,
        'danger',
        async () => {
          try {
            await userService.resetPassword(user.id);
            showAlert('Thành công', 'Đặt lại mật khẩu thành công! Mật khẩu mặc định mới là số điện thoại hoặc 123456.', 'success');
          } catch (err) {
            showAlert('Lỗi', err.response?.data?.error || 'Đặt lại mật khẩu thất bại', 'danger');
          }
        }
      );
    };

    const openExtendModal = () => {
      extendMonths.value = 6;
      showExtendModal.value = true;
    };

    const submitManualExtension = async () => {
      if (!selectedLandlord.value) return;
      extending.value = true;
      try {
        const res = await subscriptionService.extendLandlord(
          selectedLandlord.value.id,
          extendMonths.value
        );
        showAlert('Thành công', 'Gia hạn gói cước thành công!', 'success');
        showExtendModal.value = false;
        
        // Sync local details
        selectedLandlord.value = res.data;
        fetchLandlords();
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Gia hạn gói cước thất bại', 'danger');
      } finally {
        extending.value = false;
      }
    };

    const changePage = (newPage) => {
      if (newPage >= 0 && newPage < totalPages.value) {
        page.value = newPage;
        fetchLandlords();
      }
    };

    // Helper functions
    const formatMoney = (val) => {
      if (!val) return '0';
      return new Intl.NumberFormat('vi-VN').format(val);
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr) return '';
      const d = new Date(dateTimeStr);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const getSubscriptionStatusInfo = (user) => {
      const trialExpiry = user.createdAt ? new Date(new Date(user.createdAt).getTime() + 45 * 24 * 60 * 60 * 1000) : null;
      const subExpiry = user.subscriptionExpiredAt ? new Date(user.subscriptionExpiredAt) : null;
      
      const now = new Date();
      now.setHours(0,0,0,0);
      
      const isSubActive = subExpiry && subExpiry >= now;
      const isTrialActive = trialExpiry && trialExpiry >= now;
      
      if (isSubActive) {
        const diffTime = Math.abs(subExpiry - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          label: `Đã kích hoạt (còn ${diffDays} ngày)`,
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400',
          expiryDate: formatDate(subExpiry)
        };
      } else if (isTrialActive) {
        const diffTime = Math.abs(trialExpiry - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          label: `Dùng thử (còn ${diffDays} ngày)`,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400',
          expiryDate: formatDate(trialExpiry)
        };
      } else {
        return {
          label: 'Đã hết hạn',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400',
          expiryDate: subExpiry ? formatDate(subExpiry) : (trialExpiry ? formatDate(trialExpiry) : '')
        };
      }
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
      selectedLandlord,
      showExtendModal,
      extendMonths,
      extending,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
      selectLandlord,
      toggleStatus,
      resetPassword,
      openExtendModal,
      submitManualExtension,
      changePage,
      formatMoney,
      formatDate,
      formatDateTime,
      getSubscriptionStatusInfo
    };
  }
};
