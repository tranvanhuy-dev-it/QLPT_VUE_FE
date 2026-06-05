import { ref, onMounted, computed } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import api from '../../services/api.js';

export default {
  name: 'Contracts',
  components: {
    PageHeader,
  },
  setup() {
    const contractIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`;
    const contracts = ref([]);
    const vacantRooms = ref([]);
    const tenantsList = ref([]);
    const availableExtraFees = ref([]);
    const loading = ref(false);

    // Search
    const searchQuery = ref('');

    // Pagination
    const page = ref(0);
    const size = ref(10);
    const totalPages = ref(1);
    const totalElements = ref(0);

    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const editForm = ref({
      id: '',
      roomNumber: '',
      tenantName: '',
      numberOfTenants: 1,
    });

    const form = ref({
      roomId: '',
      tenantId: '',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: '',
      deposit: 0,
      contractedRoomPrice: 0,
      billingMode: 'BY_RENTAL_DAYS',
      fixedBillingDay: 5,
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
      loading.value = true;
      try {
        const response = await api.get('/api/contracts', {
          params: { page: page.value, size: size.value },
        });
        contracts.value = response.data.content || [];
        totalPages.value = response.data.totalPages || 1;
        totalElements.value = response.data.totalElements || 0;
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải danh sách hợp đồng');
      } finally {
        loading.value = false;
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

    const fetchVacantRooms = async () => {
      try {
        const response = await api.get('/api/rooms', { params: { size: 200 } });
        const rooms = response.data.content || [];
        vacantRooms.value = rooms.filter(r => r.status === 'VACANT');
      } catch (err) {
        console.error('Không tải được danh sách phòng trống:', err);
      }
    };

    const fetchTenants = async () => {
      try {
        const response = await api.get('/api/users/tenants', { params: { size: 200 } });
        tenantsList.value = response.data.content || [];
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
          const response = await api.get(`/api/rooms/boarding-houses/${selectedRoom.boardingHouse.id}/extra-fees`);
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
      await fetchVacantRooms();
      await fetchTenants();
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

        await api.post('/api/contracts', payload);
        alert('Tạo hợp đồng thuê phòng thành công!');
        closeModal();
        fetchContracts();
      } catch (err) {
        alert(err.response?.data?.error || 'Tạo hợp đồng thất bại');
      }
    };

    const terminateContract = async (id) => {
      if (confirm('Bạn có chắc chắn muốn thanh lý hợp đồng này ngay bây giờ? Phòng trọ sẽ chuyển sang trạng thái trống.')) {
        try {
          await api.post(`/api/contracts/${id}/terminate`);
          alert('Đã thanh lý hợp đồng thành công!');
          fetchContracts();
        } catch (err) {
          alert(err.response?.data?.error || 'Thanh lý hợp đồng thất bại');
        }
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
        billingMode: 'BY_RENTAL_DAYS',
        fixedBillingDay: 5,
        numberOfTenants: 1,
      };
    };

    const editContract = (contract) => {
      editForm.value = {
        id: contract.id,
        roomNumber: contract.room.roomNumber,
        tenantName: contract.tenant.fullName,
        numberOfTenants: contract.numberOfTenants,
      };
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
      editForm.value = {
        id: '',
        roomNumber: '',
        tenantName: '',
        numberOfTenants: 1,
      };
    };

    const submitEditContract = async () => {
      try {
        await api.put(`/api/contracts/${editForm.value.id}`, {
          numberOfTenants: editForm.value.numberOfTenants,
        });
        alert('Cập nhật số người ở của hợp đồng thành công!');
        closeEditModal();
        fetchContracts();
      } catch (err) {
        alert(err.response?.data?.error || 'Cập nhật hợp đồng thất bại');
      }
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
      terminateContract,
      changePage,
      closeModal,
      formatMoney,
      formatDate,
      showEditModal,
      editForm,
      editContract,
      closeEditModal,
      submitEditContract,
    };
  },
};
