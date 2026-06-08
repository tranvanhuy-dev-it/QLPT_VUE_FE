import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import userService from '../../services/userService.js';
import { useTenantStore } from '../../stores/tenant.js';

export default {
  name: 'TenantDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const tenantStore = useTenantStore();

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
        alert(err.response?.data?.error || 'Không thể tải thông tin chi tiết người thuê');
      } finally {
        loading.value = false;
      }
    };

    const handleToggleStatus = async () => {
      if (!tenant.value) return;
      const action = tenant.value.status === 'ACTIVE' ? 'khóa' : 'mở khóa';
      if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
        try {
          const updated = await tenantStore.toggleTenantStatus(tenant.value.id);
          tenant.value.status = updated.status;
          alert(`Đã ${action} tài khoản thành công!`);
        } catch (err) {
          alert(err.response?.data?.error || `Thay đổi trạng thái tài khoản thất bại`);
        }
      }
    };

    const handleResetPassword = async () => {
      if (!tenant.value) return;
      const confirmMsg = `Bạn có chắc chắn muốn đặt lại mật khẩu cho người thuê "${tenant.value.fullName}"? Mật khẩu mới sẽ là số điện thoại của họ (hoặc "123456" nếu không có số điện thoại).`;
      if (confirm(confirmMsg)) {
        try {
          await userService.resetPassword(tenant.value.id);
          alert('Đặt lại mật khẩu thành công!');
        } catch (err) {
          alert(err.response?.data?.error || 'Không thể đặt lại mật khẩu cho người thuê');
        }
      }
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
    };
  },
};
