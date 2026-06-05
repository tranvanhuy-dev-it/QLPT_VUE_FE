import { ref, onMounted } from 'vue';
import Sidebar from '../../components/Sidebar.vue';
import api from '../../services/api.js';

export default {
  name: 'BoardingHouses',
  components: {
    Sidebar,
  },
  setup() {
    const boardingHouses = ref([]);
    const loading = ref(false);
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const editId = ref(null);

    const form = ref({
      name: '',
      address: '',
      defaultElectricityRate: 3500,
      defaultWaterRate: 15000,
      waterBillingType: 'BY_INDEX',
    });

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatWaterBillingType = (type) => {
      switch (type) {
        case 'BY_INDEX': return 'Theo chỉ số điện nước';
        case 'FIXED_PER_PERSON': return 'Theo người ở';
        case 'FIXED_PER_ROOM': return 'Theo phòng';
        default: return type;
      }
    };

    const fetchBoardingHouses = async () => {
      loading.value = true;
      try {
        // Lấy danh sách không phân trang hoặc phân trang kích thước lớn cho quản lý
        const response = await api.get('/api/rooms/boarding-houses', {
          params: { page: 0, size: 100 },
        });
        boardingHouses.value = response.data.content || [];
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải danh sách dãy trọ');
      } finally {
        loading.value = false;
      }
    };

    const saveHouse = async () => {
      try {
        if (showEditModal.value) {
          await api.put(`/api/rooms/boarding-houses/${editId.value}`, form.value);
        } else {
          await api.post('/api/rooms/boarding-houses', form.value);
        }
        closeModal();
        fetchBoardingHouses();
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể lưu thông tin dãy trọ');
      }
    };

    const editHouse = (house) => {
      editId.value = house.id;
      form.value = {
        name: house.name,
        address: house.address,
        defaultElectricityRate: house.defaultElectricityRate,
        defaultWaterRate: house.defaultWaterRate,
        waterBillingType: house.waterBillingType,
      };
      showEditModal.value = true;
    };

    const deleteHouse = async (id) => {
      if (confirm('Bạn có chắc chắn muốn xóa dãy trọ này? Hành động này sẽ xóa toàn bộ các phòng trọ và dữ liệu liên quan!')) {
        try {
          await api.delete(`/api/rooms/boarding-houses/${id}`);
          fetchBoardingHouses();
        } catch (err) {
          alert(err.response?.data?.error || 'Xóa dãy trọ thất bại');
        }
      }
    };

    const closeModal = () => {
      showAddModal.value = false;
      showEditModal.value = false;
      editId.value = null;
      form.value = {
        name: '',
        address: '',
        defaultElectricityRate: 3500,
        defaultWaterRate: 15000,
        waterBillingType: 'BY_INDEX',
      };
    };

    onMounted(() => {
      fetchBoardingHouses();
    });

    return {
      boardingHouses,
      loading,
      showAddModal,
      showEditModal,
      form,
      saveHouse,
      editHouse,
      deleteHouse,
      closeModal,
      formatMoney,
      formatWaterBillingType,
    };
  },
};
