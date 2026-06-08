import { ref, onMounted, computed } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import { useContractStore } from '../../stores/contract.js';

export default {
  name: 'TenantRules',
  components: {
    PageHeader,
  },
  setup() {
    const rulesIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`;
    
    const contractStore = useContractStore();
    const activeContract = ref(null);
    const loading = ref(true);

    const rules = computed(() => {
      return activeContract.value?.room?.boardingHouse?.rules || '';
    });

    const loadTenantRules = async () => {
      loading.value = true;
      try {
        const contractsList = await contractStore.fetchContracts();
        activeContract.value = contractsList.find(c => c.status === 'ACTIVE') || null;
      } catch (err) {
        console.error('Không thể tải dữ liệu nội quy:', err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadTenantRules();
    });

    return {
      rulesIcon,
      activeContract,
      loading,
      rules,
    };
  },
};
