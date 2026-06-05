import { ref, onMounted, computed } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import api from '../../services/api.js';

export default {
  name: 'Rooms',
  components: {
    PageHeader,
  },
  setup() {
    const roomIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`;
    
    const rooms = ref([]);
    const boardingHouses = ref([]);
    const loading = ref(false);
    
    // Dropdown filters
    const selectedHouseId = ref(null);
    const searchQuery = ref('');
    
    // Pagination states
    const page = ref(0);
    const size = ref(10);
    const totalPages = ref(0);
    const totalElements = ref(0);

    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const editId = ref(null);

    const form = ref({
      boardingHouseId: '',
      roomNumber: '',
      basePrice: 2000000,
      maxPeople: 4,
      currentElectricityIndex: 0,
      currentWaterIndex: 0,
    });

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const fetchBoardingHouses = async () => {
      try {
        const response = await api.get('/api/rooms/boarding-houses', {
          params: { page: 0, size: 100 },
        });
        boardingHouses.value = response.data.content || [];
        if (boardingHouses.value.length > 0) {
          form.value.boardingHouseId = boardingHouses.value[0].id;
        }
      } catch (err) {
        console.error('Không tải được danh sách dãy trọ', err);
      }
    };

    const fetchRooms = async () => {
      loading.value = true;
      try {
        let response;
        if (selectedHouseId.value) {
          response = await api.get(`/api/rooms/boarding-houses/${selectedHouseId.value}/rooms`, {
            params: { page: page.value, size: size.value },
          });
        } else {
          response = await api.get('/api/rooms', {
            params: { page: page.value, size: size.value },
          });
        }
        rooms.value = response.data.content || [];
        totalPages.value = response.data.totalPages || 1;
        totalElements.value = response.data.totalElements || 0;
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải danh sách phòng trọ');
      } finally {
        loading.value = false;
      }
    };

    const filteredRooms = computed(() => {
      if (!searchQuery.value) return rooms.value;
      const q = searchQuery.value.toLowerCase().trim();
      return rooms.value.filter(room => room.roomNumber.toLowerCase().includes(q));
    });

    const openAddModal = () => {
      if (boardingHouses.value.length > 0) {
        form.value.boardingHouseId = boardingHouses.value[0].id;
      }
      showAddModal.value = true;
    };

    const saveRoom = async () => {
      try {
        if (showEditModal.value) {
          await api.put(`/api/rooms/${editId.value}`, form.value);
        } else {
          await api.post(`/api/rooms/boarding-houses/${form.value.boardingHouseId}/rooms`, form.value);
        }
        closeModal();
        fetchRooms();
      } catch (err) {
        alert(err.response?.data?.error || 'Lưu thông tin phòng thất bại');
      }
    };

    const editRoom = (room) => {
      editId.value = room.id;
      form.value = {
        boardingHouseId: room.boardingHouse.id,
        roomNumber: room.roomNumber,
        basePrice: room.basePrice,
        maxPeople: room.maxPeople,
        currentElectricityIndex: room.currentElectricityIndex,
        currentWaterIndex: room.currentWaterIndex,
      };
      showEditModal.value = true;
    };

    const deleteRoom = async (id) => {
      if (confirm('Bạn có chắc chắn muốn xóa phòng trọ này?')) {
        try {
          await api.delete(`/api/rooms/${id}`);
          fetchRooms();
        } catch (err) {
          alert(err.response?.data?.error || 'Xóa phòng trọ thất bại');
        }
      }
    };

    const changePage = (newPage) => {
      if (newPage >= 0 && newPage < totalPages.value) {
        page.value = newPage;
        fetchRooms();
      }
    };

    const onHouseFilterChange = () => {
      page.value = 0;
      fetchRooms();
    };

    const closeModal = () => {
      showAddModal.value = false;
      showEditModal.value = false;
      editId.value = null;
      form.value = {
        boardingHouseId: boardingHouses.value[0]?.id || '',
        roomNumber: '',
        basePrice: 2000000,
        maxPeople: 4,
        currentElectricityIndex: 0,
        currentWaterIndex: 0,
      };
    };

    onMounted(async () => {
      await fetchBoardingHouses();
      fetchRooms();
    });

    return {
      roomIcon,
      rooms,
      filteredRooms,
      boardingHouses,
      selectedHouseId,
      searchQuery,
      loading,
      page,
      totalPages,
      totalElements,
      showAddModal,
      showEditModal,
      form,
      openAddModal,
      saveRoom,
      editRoom,
      deleteRoom,
      changePage,
      onHouseFilterChange,
      closeModal,
      formatMoney,
    };
  },
};
