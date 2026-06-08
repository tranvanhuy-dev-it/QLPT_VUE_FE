import { ref, onMounted, computed } from 'vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import { useContractStore } from '../../stores/contract.js';

export default {
  name: 'TenantDashboard',
  components: {
    PageHeader,
  },
  setup() {
    const tenantDashboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`;

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const contractStore = useContractStore();
    const activeContract = ref(null);
    const loading = ref(true);

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const loadTenantData = async () => {
      loading.value = true;
      try {
        const contractsList = await contractStore.fetchContracts();
        activeContract.value = contractsList.find(c => c.status === 'ACTIVE') || null;
      } catch (err) {
        console.error('Không thể tải dữ liệu người thuê:', err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadTenantData();
    });

    return {
      tenantDashboardIcon,
      activeContract,
      loading,
      formatMoney,
      formatDate,
    };
  },
};
