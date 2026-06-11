import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRoomStore } from '../../stores/room.js';
import { useContractStore } from '../../stores/contract.js';
import DataTable from '../../components/ui/DataTable.vue';
import ConfirmModal from '../../components/ui/ConfirmModal.vue';
import FormInput from '../../components/ui/FormInput.vue';
import FormButton from '../../components/ui/FormButton.vue';
import AppIcon from '../../components/ui/icons/AppIcon.vue';
import LoadingState from '../../components/ui/LoadingState.vue';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'RoomDetail',
  components: {
    DataTable,
    ConfirmModal,
    FormInput,
    FormButton,
    AppIcon,
    LoadingState,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const roomStore = useRoomStore();
    const contractStore = useContractStore();
    const { confirmModal, showAlert, showConfirm, onConfirmModal, closeConfirmModal } = useConfirmModal();

    const roomId = route.params.id;
    const room = ref(null);
    const contracts = ref([]);
    const loading = ref(false);
    const activeTab = ref('info'); // info, history

    // Form inputs for editing room details
    const form = ref({
      roomNumber: '',
      basePrice: 0,
      maxPeople: 1,
      currentElectricityIndex: 0,
      currentWaterIndex: 0,
    });

    const tableHeaders = [
      { label: 'Khách thuê đại diện', key: 'tenant.fullName', cellClass: 'font-semibold text-primary' },
      { label: 'Số điện thoại', key: 'tenant.phoneNumber', cellClass: 'text-text-sub' },
      { label: 'Ngày bắt đầu', key: 'startDate', type: 'date', cellClass: 'text-text-sub', hideOnMobile: true },
      { label: 'Ngày hết hạn', key: 'endDate', type: 'date', cellClass: 'text-text-sub', hideOnMobile: true },
      { label: 'Tiền đặt cọc', key: 'deposit', type: 'money', cellClass: 'font-semibold text-text-main', hideOnMobile: true },
      {
        label: 'Trạng thái',
        key: 'status',
        type: 'badge',
        badgeColors: {
          ACTIVE: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400',
          TERMINATED: 'bg-slate-50 text-slate-600 dark:bg-slate-900/35 dark:text-slate-400',
        },
        badgeLabels: {
          ACTIVE: 'Đang hoạt động',
          TERMINATED: 'Đã thanh lý',
        },
      },
    ];

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatDate = (dateString) => {
      if (!dateString) return '---';
      const d = new Date(dateString);
      return d.toLocaleDateString('vi-VN');
    };

    const loadRoomData = async () => {
      loading.value = true;
      try {
        // Fetch room details
        const roomData = await roomStore.fetchRoomById(roomId);
        room.value = roomData;
        
        // Initialize form fields
        form.value = {
          roomNumber: roomData.roomNumber,
          basePrice: roomData.basePrice,
          maxPeople: roomData.maxPeople,
          currentElectricityIndex: roomData.currentElectricityIndex,
          currentWaterIndex: roomData.currentWaterIndex,
        };

        // Fetch contracts for this room
        const contractsData = await contractStore.fetchContracts({ roomId, size: 100 });
        contracts.value = contractsData || [];
      } catch (err) {
        console.error('Lỗi khi tải thông tin phòng:', err);
        showAlert('Lỗi', err.response?.data?.error || 'Không thể tải thông tin chi tiết phòng trọ', 'danger');
      } finally {
        loading.value = false;
      }
    };

    const handleSave = async () => {
      try {
        await roomStore.updateRoom(roomId, form.value);
        showAlert('Thành công', 'Cập nhật thông tin phòng trọ thành công!', 'success');
        loadRoomData();
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Không thể lưu thông tin phòng trọ', 'danger');
      }
    };

    const goBack = () => {
      if (window.history.state && window.history.state.back) {
        router.back();
      } else {
        router.push('/landlord/rooms');
      }
    };

    const viewContractDetails = (contract) => {
      router.push(`/landlord/contracts/${contract.id}`);
    };

    const deleteRoom = async () => {
      if (!room.value) return;
      showConfirm(
        'Xóa phòng trọ',
        'Bạn có chắc chắn muốn xóa phòng trọ này? Hợp đồng liên quan (nếu có) cũng sẽ bị ảnh hưởng.',
        'danger',
        async () => {
          try {
            await roomStore.deleteRoom(roomId);
            showAlert('Thành công', 'Xóa phòng trọ thành công!', 'success', () => {
              router.push('/landlord/rooms');
            });
          } catch (err) {
            showAlert('Lỗi', err.response?.data?.error || 'Xóa phòng trọ thất bại', 'danger');
          }
        }
      );
    };

    onMounted(() => {
      loadRoomData();
    });

    return {
      room,
      contracts,
      loading,
      activeTab,
      form,
      tableHeaders,
      formatMoney,
      formatDate,
      handleSave,
      goBack,
      viewContractDetails,
      deleteRoom,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
