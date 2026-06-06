import { ref, onMounted, computed } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import { useTenantStore } from '../../stores/tenant.js';

export default {
  name: 'Tenants',
  components: {
    PageHeader,
  },
  setup() {
    const tenantIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`;
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
    });

    const fetchTenants = async () => {
      try {
        await tenantStore.fetchTenants({ page: page.value, size: size.value });
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải danh sách tài khoản người thuê');
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
        await tenantStore.createTenantAccount(form.value);
        alert('Tạo tài khoản người ở thành công!');
        closeModal();
        fetchTenants();
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tạo tài khoản cho người ở');
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
