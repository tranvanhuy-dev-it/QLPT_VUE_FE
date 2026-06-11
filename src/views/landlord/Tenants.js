import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '../../components/ui/PageHeader.vue';
import DataTable from '../../components/ui/DataTable.vue';
import Modal from '../../components/ui/Modal.vue';
import FormInput from '../../components/ui/FormInput.vue';
import FormButton from '../../components/ui/FormButton.vue';
import ConfirmModal from '../../components/ui/ConfirmModal.vue';
import { useTenantStore } from '../../stores/tenant.js';
import { validateEmail, validatePhone, validatePastDate } from '../../utils/validation.js';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'Tenants',
  components: {
    PageHeader,
    DataTable,
    Modal,
    FormInput,
    FormButton,
    ConfirmModal,
  },
  setup() {
    const router = useRouter();
    const { confirmModal, showAlert, showConfirm, onConfirmModal, closeConfirmModal } = useConfirmModal();
    const tenantIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`;
    
    const tableHeaders = [
      { label: 'Họ và tên', key: 'fullName', cellClass: 'font-semibold text-primary' },
      { label: 'Số điện thoại', key: 'phone', formatter: (item) => item.phone || '-', cellClass: 'text-text-sub' },
      { label: 'Email', key: 'email', formatter: (item) => item.email || '-', cellClass: 'text-text-sub', hideOnMobile: true },
      {
        label: 'Trạng thái',
        key: 'status',
        type: 'badge',
        badgeColors: {
          ACTIVE: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400',
          INACTIVE: 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400',
        },
        badgeLabels: {
          ACTIVE: 'Hoạt động',
          INACTIVE: 'Tạm khóa',
        },
      },
    ];
    const tenantStore = useTenantStore();

    const tenants = computed(() => tenantStore.tenants);
    const loading = computed(() => tenantStore.loading);
    
    // Search
    const searchQuery = ref('');

    // Pagination
    const page = ref(0);
    const size = ref(10);
    const totalPages = computed(() => tenantStore.totalPages);
    const totalElements = computed(() => tenantStore.totalElements);

    const showAddModal = ref(false);
    
    const form = ref({
      username: '',
      password: '',
      fullName: '',
      phone: '',
      email: '',
      identityCard: '',
      idCardIssueDate: '',
      idCardIssuePlace: '',
      permanentAddress: '',
    });

    const fetchTenants = async () => {
      try {
        await tenantStore.fetchTenants({ page: page.value, size: size.value });
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Không thể tải danh sách tài khoản người thuê', 'danger');
      }
    };

    const filteredTenants = computed(() => {
      if (!searchQuery.value) return tenants.value;
      const q = searchQuery.value.toLowerCase().trim();
      return tenants.value.filter(tenant => 
        tenant.username.toLowerCase().includes(q) || 
        tenant.fullName.toLowerCase().includes(q) || 
        (tenant.phone && tenant.phone.toLowerCase().includes(q)) ||
        (tenant.email && tenant.email.toLowerCase().includes(q))
      );
    });

    const createTenantAccount = async () => {
      if (form.value.email && !validateEmail(form.value.email)) {
        showAlert('Lỗi nhập liệu', 'Định dạng Email không hợp lệ.', 'warning');
        return;
      }

      if (form.value.phone && !validatePhone(form.value.phone)) {
        showAlert('Lỗi nhập liệu', 'Định dạng số điện thoại không hợp lệ (yêu cầu từ 9-12 chữ số).', 'warning');
        return;
      }

      if (form.value.idCardIssueDate && !validatePastDate(form.value.idCardIssueDate)) {
        showAlert('Lỗi nhập liệu', 'Ngày cấp CMND/CCCD phải ở trước ngày hiện tại.', 'warning');
        return;
      }

      try {
        await tenantStore.createTenantAccount(form.value);
        showAlert('Thành công', 'Tạo tài khoản người ở thành công!', 'success');
        closeModal();
        fetchTenants();
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Không thể tạo tài khoản cho người ở', 'danger');
      }
    };

    const changePage = (newPage) => {
      if (newPage >= 0 && newPage < totalPages.value) {
        page.value = newPage;
        fetchTenants();
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      form.value = {
        username: '',
        password: '',
        fullName: '',
        phone: '',
        email: '',
        identityCard: '',
        idCardIssueDate: '',
        idCardIssuePlace: '',
        permanentAddress: '',
      };
    };

    const onRowClick = (tenant) => {
      router.push(`/landlord/tenants/${tenant.id}`);
    };

    onMounted(() => {
      fetchTenants();
    });

    return {
      tenantIcon,
      tenants,
      filteredTenants,
      searchQuery,
      loading,
      page,
      totalPages,
      totalElements,
      showAddModal,
      form,
      createTenantAccount,
      changePage,
      closeModal,
      tableHeaders,
      onRowClick,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
