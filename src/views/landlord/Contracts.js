import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '../../components/PageHeader.vue';
import DataTable from '../../components/DataTable.vue';
import Modal from '../../components/Modal.vue';
import Checkbox from '../../components/Checkbox.vue';
import FormInput from '../../components/FormInput.vue';
import FormSelect from '../../components/FormSelect.vue';
import FormButton from '../../components/FormButton.vue';
import { useContractStore } from '../../stores/contract.js';
import { useRoomStore } from '../../stores/room.js';
import { useTenantStore } from '../../stores/tenant.js';
import contractService from '../../services/contractService.js';

export default {
  name: 'Contracts',
  components: {
    PageHeader,
    DataTable,
    Modal,
    Checkbox,
    FormInput,
    FormSelect,
    FormButton,
  },
  setup() {
    const router = useRouter();
    const contractIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`;
    
    const tableHeaders = [
      { label: 'Phòng', key: 'room.roomNumber', prefix: 'Phòng ', cellClass: 'font-semibold text-primary' },
      { label: 'Dãy trọ', key: 'room.boardingHouse.name', cellClass: 'text-text-sub' },
      {
        label: 'Người thuê',
        key: 'tenant.fullName',
        formatter: (item) => `${item.tenant.fullName} (${item.tenant.username})`,
        cellClass: 'font-medium text-text-main',
      },
      { label: 'Ngày bắt đầu', key: 'startDate', type: 'date', cellClass: 'text-text-sub' },
      { label: 'Tiền cọc', key: 'deposit', type: 'money', cellClass: 'font-semibold text-text-main' },
      {
        label: 'Trạng thái',
        key: 'status',
        type: 'badge',
        badgeColors: {
          ACTIVE: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400',
          TERMINATED: 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400',
          EXPIRED: 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400',
        },
        badgeLabels: {
          ACTIVE: 'Hoạt Động',
          TERMINATED: 'Đã Thanh Lý',
          EXPIRED: 'Hết Hạn',
        },
      },
    ];
    
    const contractStore = useContractStore();
    const roomStore = useRoomStore();
    const tenantStore = useTenantStore();

    const contracts = computed(() => contractStore.contracts);
    const loading = computed(() => contractStore.loading || roomStore.loading || tenantStore.loading);
    const totalPages = computed(() => contractStore.totalPages);
    const totalElements = computed(() => contractStore.totalElements);

    const vacantRooms = ref([]);
    const tenantsList = ref([]);
    const availableExtraFees = ref([]);

    // Search
    const searchQuery = ref('');

    // Pagination
    const page = ref(0);
    const size = ref(10);

    const showAddModal = ref(false);

    const form = ref({
      roomId: '',
      tenantId: '',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: '',
      deposit: 0,
      contractedRoomPrice: 0,
      numberOfTenants: 1,
    });

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const fetchContracts = async () => {
      try {
        await contractStore.fetchContracts({ page: page.value, size: size.value });
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải danh sách hợp đồng');
      }
    };

    const filteredContracts = computed(() => {
      if (!searchQuery.value) return contracts.value;
      const q = searchQuery.value.toLowerCase().trim();
      return contracts.value.filter(contract => 
        contract.tenant.fullName.toLowerCase().includes(q) ||
        contract.tenant.username.toLowerCase().includes(q) ||
        contract.room.roomNumber.toLowerCase().includes(q) ||
        contract.room.boardingHouse.name.toLowerCase().includes(q)
      );
    });

    const selectedRoom = computed(() => {
      return vacantRooms.value.find(r => r.id === form.value.roomId) || null;
    });

    const fetchVacantRooms = async () => {
      try {
        const list = await roomStore.fetchRooms({ size: 200 });
        vacantRooms.value = list.filter(r => r.status === 'VACANT');
      } catch (err) {
        console.error('Không tải được danh sách phòng trống:', err);
      }
    };

    const fetchTenants = async () => {
      try {
        const list = await tenantStore.fetchTenants({ size: 200, status: 'ACTIVE', availableOnly: true });
        tenantsList.value = list || [];
      } catch (err) {
        console.error('Không tải được danh sách người thuê:', err);
      }
    };

    const onRoomChange = async () => {
      const selectedRoom = vacantRooms.value.find(r => r.id === form.value.roomId);
      if (selectedRoom) {
        form.value.contractedRoomPrice = selectedRoom.basePrice;
        form.value.deposit = selectedRoom.basePrice;
        
        try {
          const response = await contractService.getBoardingHouseExtraFees(selectedRoom.boardingHouse.id);
          availableExtraFees.value = (response.data || []).map(ef => ({
            ...ef,
            selected: true,
            customPrice: ef.defaultPrice,
          }));
        } catch (err) {
          console.error('Không tải được dịch vụ dãy trọ:', err);
        }
      }
    };

    const openAddModal = async () => {
      await Promise.all([fetchVacantRooms(), fetchTenants()]);
      if (vacantRooms.value.length > 0) {
        form.value.roomId = vacantRooms.value[0].id;
        onRoomChange();
      }
      if (tenantsList.value.length > 0) {
        form.value.tenantId = tenantsList.value[0].id;
      }
      showAddModal.value = true;
    };

    const saveContract = async () => {
      try {
        const extraFeesPayload = availableExtraFees.value
          .filter(ef => ef.selected)
          .map(ef => ({
            extraFeeId: ef.id,
            customPrice: ef.customPrice,
          }));

        const payload = {
          ...form.value,
          extraFees: extraFeesPayload,
        };

        if (payload.endDate === '') {
          delete payload.endDate;
        }

        const createdContract = await contractStore.createContract(payload);
        closeModal();
        router.push({
          name: 'ContractDetail',
          params: { id: createdContract.id }
        });
      } catch (err) {
        alert(err.response?.data?.error || 'Tạo hợp đồng thất bại');
      }
    };

    const changePage = (newPage) => {
      if (newPage >= 0 && newPage < totalPages.value) {
        page.value = newPage;
        fetchContracts();
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      availableExtraFees.value = [];
      form.value = {
        roomId: '',
        tenantId: '',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: '',
        deposit: 0,
        contractedRoomPrice: 0,
        numberOfTenants: 1,
      };
    };

    const viewContractDetail = (id, edit = false) => {
      router.push({
        name: 'ContractDetail',
        params: { id },
        query: edit ? { edit: 'true' } : {},
      });
    };

    onMounted(() => {
      fetchContracts();
      fetchVacantRooms();
      fetchTenants();
    });

    return {
      contractIcon,
      contracts,
      filteredContracts,
      vacantRooms,
      selectedRoom,
      tenantsList,
      availableExtraFees,
      loading,
      searchQuery,
      page,
      totalPages,
      totalElements,
      showAddModal,
      form,
      openAddModal,
      onRoomChange,
      saveContract,
      changePage,
      closeModal,
      formatMoney,
      formatDate,
      viewContractDetail,
      tableHeaders,
    };
  },
};
