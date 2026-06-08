import { ref, onMounted } from 'vue';
import subscriptionService from '../../services/subscriptionService.js';
import FormButton from '../../components/ui/FormButton.vue';
import ConfirmModal from '../../components/ui/ConfirmModal.vue';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'AdminRequests',
  components: {
    FormButton,
    ConfirmModal
  },
  setup() {
    const requests = ref([]);
    const loading = ref(true);
    const requestsPage = ref(0);
    const requestsSize = ref(10);
    const requestsTotalPages = ref(0);
    const requestsTotalElements = ref(0);
    
    const selectedRequestStatus = ref('PENDING');
    const pendingCount = ref(0);

    const {
      confirmModal,
      showConfirm,
      showAlert,
      onConfirmModal,
      closeConfirmModal
    } = useConfirmModal();

    const fetchRequests = async () => {
      loading.value = true;
      try {
        const response = await subscriptionService.getAdminRequests(
          selectedRequestStatus.value, 
          requestsPage.value, 
          requestsSize.value
        );
        requests.value = response.data.content;
        requestsTotalPages.value = response.data.totalPages;
        requestsTotalElements.value = response.data.totalElements;

        // Also fetch the PENDING count specifically to update the badge count
        if (selectedRequestStatus.value === 'PENDING') {
          pendingCount.value = response.data.totalElements;
        } else {
          const pendingRes = await subscriptionService.getAdminRequests('PENDING', 0, 1);
          pendingCount.value = pendingRes.data.totalElements;
        }
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Không thể tải danh sách yêu cầu', 'danger');
      } finally {
        loading.value = false;
      }
    };

    const onStatusFilterChange = () => {
      requestsPage.value = 0;
      fetchRequests();
    };

    const handleApproveRequest = async (request) => {
      showConfirm(
        'Duyệt kích hoạt gói',
        `Xác nhận duyệt thanh toán và kích hoạt gói ${request.months} tháng cho chủ trọ "${request.user?.username}"?`,
        'success',
        async () => {
          try {
            await subscriptionService.approveRequest(request.id);
            showAlert('Thành công', 'Đã duyệt và kích hoạt gói dịch vụ thành công!', 'success');
            fetchRequests();
          } catch (err) {
            showAlert('Lỗi', err.response?.data?.error || 'Duyệt yêu cầu thất bại', 'danger');
          }
        }
      );
    };

    const handleRejectRequest = async (request) => {
      showConfirm(
        'Từ chối yêu cầu',
        `Xác nhận từ chối yêu cầu gia hạn của tài khoản "${request.user?.username}"?`,
        'danger',
        async () => {
          try {
            await subscriptionService.rejectRequest(request.id);
            showAlert('Thành công', 'Đã từ chối yêu cầu thành công', 'success');
            fetchRequests();
          } catch (err) {
            showAlert('Lỗi', err.response?.data?.error || 'Không thể xử lý yêu cầu', 'danger');
          }
        }
      );
    };

    const changeRequestsPage = (newPage) => {
      if (newPage >= 0 && newPage < requestsTotalPages.value) {
        requestsPage.value = newPage;
        fetchRequests();
      }
    };

    // Helper functions
    const formatMoney = (val) => {
      if (!val) return '0';
      return new Intl.NumberFormat('vi-VN').format(val);
    };

    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr) return '';
      const d = new Date(dateTimeStr);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    onMounted(() => {
      fetchRequests();
    });

    return {
      requests,
      loading,
      requestsPage,
      requestsTotalPages,
      requestsTotalElements,
      selectedRequestStatus,
      pendingCount,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
      onStatusFilterChange,
      handleApproveRequest,
      handleRejectRequest,
      changeRequestsPage,
      formatMoney,
      formatDateTime
    };
  }
};
