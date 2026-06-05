import { ref, onMounted } from 'vue';
import Sidebar from '../../components/Sidebar.vue';
import api from '../../services/api.js';
import { useAuthStore } from '../../stores/auth.js';

export default {
  name: 'Tenants',
  components: {
    Sidebar,
  },
  setup() {
    const authStore = useAuthStore();
    const tenants = ref([]);
    const loading = ref(false);

    // Pagination
    const page = ref(0);
    const size = ref(10);
    const totalPages = ref(1);
    const totalElements = ref(0);

    const showAddModal = ref(false);
    
    const form = ref({
      username: '',
      password: '',
      fullName: '',
      phone: '',
      email: '',
    });

    const fetchTenants = async () => {
      loading.value = true;
      try {
        const response = await api.get('/api/users/tenants', {
          params: { page: page.value, size: size.value },
        });
        tenants.value = response.data.content || [];
        totalPages.value = response.data.totalPages || 1;
        totalElements.value = response.data.totalElements || 0;
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải danh sách tài khoản người thuê');
      } finally {
        loading.value = false;
      }
    };

    const createTenantAccount = async () => {
      try {
        await authStore.createTenant(form.value);
        alert('Tạo tài khoản người ở thành công!');
        closeModal();
        fetchTenants();
      } catch (err) {
        alert(err || 'Không thể tạo tài khoản cho người ở');
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
      };
    };

    onMounted(() => {
      fetchTenants();
    });

    return {
      tenants,
      loading,
      page,
      totalPages,
      totalElements,
      showAddModal,
      form,
      createTenantAccount,
      changePage,
      closeModal,
    };
  },
};
