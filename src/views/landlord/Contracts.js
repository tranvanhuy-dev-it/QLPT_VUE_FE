import { ref, onMounted } from 'vue';
import Sidebar from '../../components/Sidebar.vue';
import api from '../../services/api.js';

export default {
  name: 'Contracts',
  components: {
    Sidebar,
  },
  setup() {
    const contracts = ref([]);
    const vacantRooms = ref([]);
    const tenantsList = ref([]);
    const availableExtraFees = ref([]);
    const loading = ref(false);

    // Pagination
    const page = ref(0);
    const size = ref(10);
    const totalPages = ref(1);
    const totalElements = ref(0);

    const showAddModal = ref(false);

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

    const fetchVacantRooms = async () => {
      try {
        const response = await api.get('/api/rooms', { params: { size: 200 } });
        const rooms = response.data.content || [];
        // Lọc các phòng trống
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

    // Khi thay đổi chọn phòng, tự động lấy giá phòng mặc định và danh sách dịch vụ của dãy trọ đó
    const onRoomChange = async () => {
      const selectedRoom = vacantRooms.value.find(r => r.id === form.value.roomId);
      if (selectedRoom) {
        form.value.contractedRoomPrice = selectedRoom.basePrice;
        form.value.deposit = selectedRoom.basePrice; // Gợi ý cọc = 1 tháng tiền nhà
        
        // Tải các dịch vụ phụ phí của dãy trọ đó
        try {
          const response = await api.get(`/api/rooms/boarding-houses/${selectedRoom.boardingHouse.id}/extra-fees`);
          availableExtraFees.value = (response.data || []).map(ef => ({
            ...ef,
            selected: true, // Mặc định chọn áp dụng hết
            customPrice: ef.defaultPrice, // Giá ban đầu lấy mặc định
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
        // Cấu trúc lại danh sách phụ phí áp dụng
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

    onMounted(() => {
      fetchContracts();
    });

    return {
      contracts,
      vacantRooms,
      tenantsList,
      availableExtraFees,
      loading,
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
    };
  },
};
