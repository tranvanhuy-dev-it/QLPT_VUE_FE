import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth.js';
import subscriptionService from '../../services/subscriptionService.js';
import AppIcon from '../../components/ui/icons/AppIcon.vue';
import FormButton from '../../components/ui/FormButton.vue';

export default {
  name: 'SubscriptionUpgrade',
  components: {
    AppIcon,
    FormButton
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const selectedMonths = ref(6); // Default to 6 months
    const currentRequest = ref(null);
    const status = ref(null);
    const requests = ref([]);
    const adminBankInfo = ref(null);
    
    const loadingStatus = ref(true);
    const loadingRequests = ref(true);
    const submitting = ref(false);

    const loadAdminBankInfo = async () => {
      try {
        const response = await subscriptionService.getAdminBankInfo();
        adminBankInfo.value = response.data;
      } catch (err) {
        console.error('Lỗi khi tải thông tin ngân hàng Admin:', err);
      }
    };

    const loadStatus = async () => {
      loadingStatus.value = true;
      try {
        const response = await subscriptionService.getActiveStatus();
        status.value = response.data;
      } catch (err) {
        console.error('Lỗi khi tải thông tin gói cước:', err);
      } finally {
        loadingStatus.value = false;
      }
    };

    const loadRequests = async () => {
      loadingRequests.value = true;
      try {
        const response = await subscriptionService.getMyRequests();
        requests.value = response.data;
        
        // Find if there is any pending request, pre-populate payment info if so
        const pending = response.data.find(r => r.status === 'PENDING');
        if (pending) {
          currentRequest.value = pending;
        }
      } catch (err) {
        console.error('Lỗi khi tải lịch sử yêu cầu gia hạn:', err);
      } finally {
        loadingRequests.value = false;
      }
    };

    const submitUpgradeRequest = async () => {
      submitting.value = true;
      try {
        const response = await subscriptionService.createRequest(selectedMonths.value);
        currentRequest.value = response.data;
        await loadRequests(); // Reload list
        alert('Yêu cầu thanh toán đã được tạo! Vui lòng thực hiện chuyển khoản theo thông tin hướng dẫn.');
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Có lỗi xảy ra khi tạo yêu cầu thanh toán!');
      } finally {
        submitting.value = false;
      }
    };

    const copyContent = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        alert('Đã sao chép nội dung chuyển khoản vào bộ nhớ tạm!');
      } catch (err) {
        alert('Không thể tự sao chép, vui lòng bôi đen và sao chép thủ công!');
      }
    };

    const goBack = () => {
      router.back();
    };

    // Computed properties
    const vietQrUrl = computed(() => {
      if (!currentRequest.value) return '';
      const amount = currentRequest.value.amount;
      const content = currentRequest.value.paymentContent;
      const bank = (adminBankInfo.value?.bankName || 'vietinbank').toLowerCase().replace(/\s+/g, '');
      const account = adminBankInfo.value?.bankAccount || '102882915218';
      const name = adminBankInfo.value?.accountName || 'TRAN VAN HUY';
      return `https://img.vietqr.io/image/${bank}-${account}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(name)}`;
    });

    const zaloUrl = computed(() => {
      const phone = adminBankInfo.value?.phone || '0365943254';
      if (!currentRequest.value) return `https://zalo.me/${phone}`;
      const username = authStore.username || '';
      const months = currentRequest.value.months;
      const content = currentRequest.value.paymentContent;
      const message = `Tôi đã chuyển khoản nâng cấp tài khoản ${username} gói ${months} tháng với nội dung chuyển khoản: "${content}". Vui lòng kiểm tra và kích hoạt tài khoản giúp tôi!`;
      return `https://zalo.me/${phone}?text=${encodeURIComponent(message)}`;
    });

    // Formatting helpers
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

    onMounted(() => {
      loadStatus();
      loadRequests();
      loadAdminBankInfo();
    });

    return {
      selectedMonths,
      currentRequest,
      status,
      requests,
      adminBankInfo,
      loadingStatus,
      loadingRequests,
      submitting,
      vietQrUrl,
      zaloUrl,
      submitUpgradeRequest,
      copyContent,
      goBack,
      formatMoney,
      formatDate,
      formatDateTime
    };
  }
};
