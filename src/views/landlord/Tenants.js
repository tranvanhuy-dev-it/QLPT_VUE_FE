import { ref, onMounted, computed } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import api from '../../services/api.js';
import { useAuthStore } from '../../stores/auth.js';

export default {
  name: 'Tenants',
  components: {
    PageHeader,
  },
  setup() {
    const tenantIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`;
    const authStore = useAuthStore();
    const tenants = ref([]);
    const loading = ref(false);
    
    // Search
    const searchQuery = ref('');

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
    };
  },
};
