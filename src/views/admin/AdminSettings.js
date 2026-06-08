import { ref, onMounted } from 'vue';
import subscriptionService from '../../services/subscriptionService.js';
import FormInput from '../../components/ui/FormInput.vue';
import FormButton from '../../components/ui/FormButton.vue';

export default {
  name: 'AdminSettings',
  components: {
    FormInput,
    FormButton
  },
  setup() {
    const loading = ref(true);
    const saving = ref(false);
    const form = ref({
      bankName: '',
      bankAccount: '',
      accountName: '',
      phone: '',
      email: '',
      fullName: ''
    });

    const loadSettings = async () => {
      loading.value = true;
      try {
        const response = await subscriptionService.getAdminBankInfo();
        form.value = response.data;
      } catch (err) {
        alert(err.response?.data?.error || 'Lỗi khi tải thông tin cấu hình hệ thống!');
      } finally {
        loading.value = false;
      }
    };

    const saveSettings = async () => {
      // Basic validation
      if (!form.value.bankName || !form.value.bankAccount || !form.value.accountName || !form.value.phone || !form.value.email || !form.value.fullName) {
        alert('Vui lòng nhập đầy đủ các trường thông tin bắt buộc!');
        return;
      }
      
      // Auto uppercase accountName
      form.value.accountName = form.value.accountName.toUpperCase();

      saving.value = true;
      try {
        await subscriptionService.updateAdminBankInfo(form.value);
        alert('Cập nhật cấu hình hệ thống thành công!');
        await loadSettings(); // reload
      } catch (err) {
        alert(err.response?.data?.error || 'Cập nhật cấu hình hệ thống thất bại!');
      } finally {
        saving.value = false;
      }
    };

    onMounted(() => {
      loadSettings();
    });

    return {
      loading,
      saving,
      form,
      saveSettings
    };
  }
};
