import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import userService from '../services/userService.js';
import AppIcon from '../components/ui/icons/AppIcon.vue';
import FormInput from '../components/ui/FormInput.vue';
import FormButton from '../components/ui/FormButton.vue';
import ConfirmModal from '../components/ui/ConfirmModal.vue';
import { useConfirmModal } from '../composables/useConfirmModal.js';

export default {
  name: 'Settings',
  components: {
    AppIcon,
    FormInput,
    FormButton,
    ConfirmModal,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const { confirmModal, showAlert, onConfirmModal, closeConfirmModal } = useConfirmModal();

    const activeTab = ref('profile'); // 'profile' | 'security' | 'preferences' | 'imou'
    const theme = ref(localStorage.getItem('theme') || 'light');
    const fontSize = ref(localStorage.getItem('fontSize') || 'medium');
    const isLandlord = computed(() => authStore.role === 'LANDLORD');

    const setFontSize = (size) => {
      fontSize.value = size;
      localStorage.setItem('fontSize', size);
      let fontSizePx = '16px';
      if (size === 'small') fontSizePx = '14px';
      else if (size === 'medium') fontSizePx = '16px';
      else if (size === 'large') fontSizePx = '18px';
      else if (size === 'xlarge') fontSizePx = '20px';
      document.documentElement.style.fontSize = fontSizePx;
    };

    // Profile state variables
    const loadingProfile = ref(true);
    const savingProfile = ref(false);
    const rawUserProfile = ref(null);
    const profileForm = ref({
      fullName: '',
      username: '',
      email: '',
      phone: '',
      identityCard: '',
      idCardIssueDate: '',
      idCardIssuePlace: '',
      permanentAddress: '',
    });

    // Password state variables
    const savingPassword = ref(false);
    const passwordForm = ref({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    // Imou config state variables
    const savingImou = ref(false);
    const imouForm = ref({
      imouAppId: '',
      imouAppSecret: '',
    });

    const fetchUserProfile = async () => {
      loadingProfile.value = true;
      try {
        const res = await userService.getProfile();
        rawUserProfile.value = res.data;
        resetProfileForm();
        resetImouForm();
      } catch (err) {
        console.error('Không thể lấy thông tin người dùng:', err);
        showAlert('Lỗi', 'Không thể tải thông tin cá nhân. Vui lòng thử lại!', 'danger');
      } finally {
        loadingProfile.value = false;
      }
    };

    const resetProfileForm = () => {
      if (rawUserProfile.value) {
        profileForm.value = {
          fullName: rawUserProfile.value.fullName || '',
          username: rawUserProfile.value.username || '',
          email: rawUserProfile.value.email || '',
          phone: rawUserProfile.value.phone || '',
          identityCard: rawUserProfile.value.identityCard || '',
          idCardIssueDate: rawUserProfile.value.idCardIssueDate || '',
          idCardIssuePlace: rawUserProfile.value.idCardIssuePlace || '',
          permanentAddress: rawUserProfile.value.permanentAddress || '',
        };
      }
    };

    const resetImouForm = () => {
      if (rawUserProfile.value) {
        imouForm.value = {
          imouAppId: rawUserProfile.value.imouAppId || '',
          imouAppSecret: rawUserProfile.value.imouAppSecret || '',
        };
      }
    };

    const saveImouSettings = async () => {
      savingImou.value = true;
      try {
        const payload = {
          imouAppId: imouForm.value.imouAppId,
          imouAppSecret: imouForm.value.imouAppSecret,
        };
        const res = await userService.updateImouSettings(payload);
        rawUserProfile.value = res.data;
        resetImouForm();
        showAlert('Thành công', 'Cập nhật cấu hình Imou Cloud thành công!', 'success');
      } catch (err) {
        console.error(err);
        showAlert('Lỗi', err.response?.data?.error || 'Cập nhật cấu hình thất bại', 'danger');
      } finally {
        savingImou.value = false;
      }
    };

    const saveProfile = async () => {
      savingProfile.value = true;
      try {
        const payload = {
          fullName: profileForm.value.fullName,
          email: profileForm.value.email,
          phone: profileForm.value.phone,
          identityCard: profileForm.value.identityCard,
          idCardIssueDate: profileForm.value.idCardIssueDate || null,
          idCardIssuePlace: profileForm.value.idCardIssuePlace,
          permanentAddress: profileForm.value.permanentAddress,
        };
        const res = await userService.updateProfile(payload);
        rawUserProfile.value = res.data;
        // Cập nhật tên hiển thị ở authStore và localStorage
        if (authStore.user) {
          authStore.user.fullName = res.data.fullName;
          localStorage.setItem('user', JSON.stringify(authStore.user));
        }
        showAlert('Thành công', 'Cập nhật thông tin cá nhân thành công!', 'success');
      } catch (err) {
        console.error(err);
        showAlert('Lỗi', err.response?.data?.error || 'Cập nhật thông tin thất bại', 'danger');
      } finally {
        savingProfile.value = false;
      }
    };

    const savePassword = async () => {
      if (passwordForm.value.newPassword.length < 6) {
        showAlert('Cảnh báo', 'Mật khẩu mới phải có tối thiểu 6 ký tự!', 'warning');
        return;
      }
      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        showAlert('Cảnh báo', 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp!', 'warning');
        return;
      }

      savingPassword.value = true;
      try {
        await userService.changePassword({
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword,
        });
        showAlert('Thành công', 'Thay đổi mật khẩu thành công!', 'success');
        // Reset form password
        passwordForm.value = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
      } catch (err) {
        console.error(err);
        showAlert('Lỗi', err.response?.data?.error || 'Thay đổi mật khẩu thất bại', 'danger');
      } finally {
        savingPassword.value = false;
      }
    };

    const setTheme = (newTheme) => {
      theme.value = newTheme;
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      fetchUserProfile();
    });

    return {
      activeTab,
      theme,
      isLandlord,
      loadingProfile,
      savingProfile,
      profileForm,
      resetProfileForm,
      saveProfile,
      savingPassword,
      passwordForm,
      savePassword,
      savingImou,
      imouForm,
      resetImouForm,
      saveImouSettings,
      setTheme,
      fontSize,
      setFontSize,
      goBack,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
