import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConfirmModal from '../../components/ConfirmModal.vue';
import userService from '../../services/userService.js';
import { useTenantStore } from '../../stores/tenant.js';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'TenantDetail',
  components: { ConfirmModal },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const tenantStore = useTenantStore();
    const { confirmModal, showAlert, showConfirm, onConfirmModal, closeConfirmModal } = useConfirmModal();

    const tenant = ref(null);
    const loading = ref(true);

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const fetchTenantDetails = async () => {
      loading.value = true;
      try {
        const response = await userService.getTenant(route.params.id);
        tenant.value = response.data;
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Không thể tải thông tin chi tiết người thuê', 'danger');
      } finally {
        loading.value = false;
      }
    };

    const handleToggleStatus = () => {
      if (!tenant.value) return;
      const action = tenant.value.status === 'ACTIVE' ? 'khóa' : 'mở khóa';
      showConfirm(
        `Xác nhận ${action} tài khoản`,
        `Bạn có chắc chắn muốn ${action} tài khoản "${tenant.value.fullName}"?`,
        tenant.value.status === 'ACTIVE' ? 'danger' : 'info',
        async () => {
          try {
            const updated = await tenantStore.toggleTenantStatus(tenant.value.id);
            tenant.value.status = updated.status;
            showAlert('Thành công', `Đã ${action} tài khoản thành công!`, 'success');
          } catch (err) {
            showAlert('Lỗi', err.response?.data?.error || 'Thay đổi trạng thái tài khoản thất bại', 'danger');
          }
        }
      );
    };

    const handleResetPassword = () => {
      if (!tenant.value) return;
      showConfirm(
        'Đặt lại mật khẩu',
        `Bạn có chắc chắn muốn đặt lại mật khẩu cho người thuê "${tenant.value.fullName}"? Mật khẩu mới sẽ là số điện thoại của họ (hoặc "123456" nếu không có số điện thoại).`,
        'warning',
        async () => {
          try {
            await userService.resetPassword(tenant.value.id);
            showAlert('Thành công', 'Đặt lại mật khẩu thành công!', 'success');
          } catch (err) {
            showAlert('Lỗi', err.response?.data?.error || 'Không thể đặt lại mật khẩu cho người thuê', 'danger');
          }
        }
      );
    };

    const goBack = () => {
      router.push('/landlord/tenants');
    };

    onMounted(() => {
      fetchTenantDetails();
    });

    return {
      tenant,
      loading,
      formatDate,
      handleToggleStatus,
      handleResetPassword,
      goBack,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
