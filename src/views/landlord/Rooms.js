import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '../../components/ui/PageHeader.vue';
import DataTable from '../../components/ui/DataTable.vue';
import Modal from '../../components/ui/Modal.vue';
import FormInput from '../../components/ui/FormInput.vue';
import FormSelect from '../../components/ui/FormSelect.vue';
import FormButton from '../../components/ui/FormButton.vue';
import ConfirmModal from '../../components/ui/ConfirmModal.vue';
import { useRoomStore } from '../../stores/room.js';
import { useBoardingHouseStore } from '../../stores/boardingHouse.js';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'Rooms',
  components: {
    PageHeader,
    DataTable,
    Modal,
    FormInput,
    FormSelect,
    FormButton,
    ConfirmModal,
  },
  setup() {
    const router = useRouter();
    const { confirmModal, showAlert, showConfirm, onConfirmModal, closeConfirmModal } = useConfirmModal();
    const roomIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`;
    
    const tableHeaders = [
      { label: 'Số phòng', key: 'roomNumber', prefix: 'Phòng ', cellClass: 'font-semibold text-primary' },
      { label: 'Dãy trọ', key: 'boardingHouse.name', cellClass: 'text-text-sub' },
      { label: 'Giá thuê', key: 'basePrice', type: 'money', cellClass: 'font-semibold text-text-main' },
      { label: 'Chỉ số điện', key: 'currentElectricityIndex', suffix: ' kWh', cellClass: 'text-text-sub' },
      { label: 'Chỉ số nước', key: 'currentWaterIndex', suffix: ' m³', cellClass: 'text-text-sub' },
      { label: 'Sức chứa', key: 'maxPeople', prefix: 'Tối đa ', suffix: ' người', cellClass: 'text-text-sub' },
      {
        label: 'Trạng thái',
        key: 'status',
        type: 'badge',
        badgeColors: {
          VACANT: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400',
          OCCUPIED: 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400',
        },
        badgeLabels: {
          VACANT: 'Còn trống',
          OCCUPIED: 'Đang thuê',
        },
      },
    ];

    const roomStore = useRoomStore();
    const boardingHouseStore = useBoardingHouseStore();

    const rooms = computed(() => roomStore.rooms);
    const boardingHouses = computed(() => boardingHouseStore.boardingHouses);
    const loading = computed(() => roomStore.loading || boardingHouseStore.loading);

    // Dropdown filters
    const selectedHouseId = ref(null);
    const searchQuery = ref('');

    // Pagination states
    const page = ref(0);
    const size = ref(10);
    const totalPages = computed(() => roomStore.totalPages);
    const totalElements = computed(() => roomStore.totalElements);

    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const editId = ref(null);
    const selectedRoom = ref(null);

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
        await boardingHouseStore.fetchBoardingHouses();
        if (boardingHouses.value.length > 0) {
          form.value.boardingHouseId = boardingHouses.value[0].id;
        }
      } catch (err) {
        console.error('Không tải được danh sách dãy trọ', err);
      }
    };

    const fetchRooms = async () => {
      try {
        if (selectedHouseId.value) {
          await roomStore.fetchRoomsByBoardingHouse(selectedHouseId.value, { page: page.value, size: size.value });
        } else {
          await roomStore.fetchRooms({ page: page.value, size: size.value });
        }
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Không thể tải danh sách phòng trọ', 'danger');
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
        await roomStore.createRoom(form.value.boardingHouseId, form.value);
        closeModal();
        fetchRooms();
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Lưu thông tin phòng thất bại', 'danger');
      }
    };

    const goToRoomDetail = (room) => {
      router.push(`/landlord/rooms/${room.id}`);
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
      selectedRoom.value = null;
      form.value = {
        boardingHouseId: boardingHouses.value[0]?.id || '',
        roomNumber: '',
        basePrice: 2000000,
        maxPeople: 4,
        currentElectricityIndex: 0,
        currentWaterIndex: 0,
      };
    };

    onMounted(() => {
      fetchBoardingHouses();
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
      form,
      openAddModal,
      saveRoom,
      goToRoomDetail,
      changePage,
      onHouseFilterChange,
      closeModal,
      formatMoney,
      tableHeaders,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
