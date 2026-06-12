import { ref, onMounted, computed } from 'vue';
import { useContractStore } from '../../stores/contract.js';
import AppIcon from '../../components/ui/icons/AppIcon.vue';

export default {
  name: 'ContactLandlord',
  components: {
    AppIcon,
  },
  setup() {
    const contractStore = useContractStore();

    const activeContract = ref(null);
    const loading = ref(true);

    const landlord = computed(() => activeContract.value?.room?.boardingHouse?.landlord || null);
    
    const landlordInitial = computed(() => {
      const name = landlord.value?.fullName;
      return name ? name.charAt(0).toUpperCase() : 'L';
    });

    const boardingHouseName = computed(() => {
      return activeContract.value?.room?.boardingHouse?.name || 'Chưa xác định';
    });

    const toast = ref({
      show: false,
      message: '',
    });

    const copyToClipboard = (text, type) => {
      if (!text) return;
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.value.show = true;
          toast.value.message = `Đã sao chép ${type} vào bộ nhớ tạm!`;
          setTimeout(() => {
            toast.value.show = false;
          }, 2500);
        })
        .catch(err => {
          console.error('Lỗi khi sao chép:', err);
        });
    };

    onMounted(async () => {
      loading.value = true;
      try {
        const contractsList = await contractStore.fetchContracts();
        activeContract.value = contractsList.find(c => c.status === 'ACTIVE') || null;
      } catch (err) {
        console.error('Không thể tải dữ liệu liên hệ chủ nhà:', err);
      } finally {
        loading.value = false;
      }
    });

    return {
      activeContract,
      loading,
      landlord,
      landlordInitial,
      boardingHouseName,
      toast,
      copyToClipboard,
    };
  },
};
