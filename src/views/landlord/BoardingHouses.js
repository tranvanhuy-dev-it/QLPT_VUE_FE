import { ref, onMounted, computed } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import EmptyState from '../../components/EmptyState.vue';
import Modal from '../../components/Modal.vue';
import FormInput from '../../components/FormInput.vue';
import FormSelect from '../../components/FormSelect.vue';
import FormButton from '../../components/FormButton.vue';
import { useBoardingHouseStore } from '../../stores/boardingHouse.js';

export default {
  name: 'BoardingHouses',
  components: {
    PageHeader,
    EmptyState,
    Modal,
    FormInput,
    FormSelect,
    FormButton,
  },
  setup() {
    const houseIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`;

    const store = useBoardingHouseStore();
    const boardingHouses = computed(() => store.boardingHouses);
    const loading = computed(() => store.loading);

    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const editId = ref(null);

    const popularBanks = [
      { code: 'MB', name: 'MBBank (Ngân hàng Quân đội)' },
      { code: 'VCB', name: 'Vietcombank' },
      { code: 'ICB', name: 'VietinBank' },
      { code: 'BIDV', name: 'BIDV' },
      { code: 'TCB', name: 'Techcombank' },
      { code: 'ACB', name: 'ACB' },
      { code: 'VPB', name: 'VPBank' },
      { code: 'TPB', name: 'TPBank' },
      { code: 'VIB', name: 'VIB' },
      { code: 'STB', name: 'Sacombank' },
      { code: 'HDB', name: 'HDBank' },
      { code: 'SHB', name: 'SHB' }
    ];

    const form = ref({
      name: '',
      address: '',
      defaultElectricityRate: 3500,
      defaultWaterRate: 15000,
      waterBillingType: 'BY_INDEX',
      bankName: '',
      bankAccountNumber: '',
      bankAccountName: '',
      extraFees: [],
    });

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatWaterBillingType = (type) => {
      switch (type) {
        case 'BY_INDEX': return 'Theo chỉ số điện nước';
        case 'FIXED_PER_PERSON': return 'Theo người ở';
        default: return type;
      }
    };

    const addExtraFeeRow = () => {
      form.value.extraFees.push({
        id: null,
        name: '',
        defaultPrice: 0,
        unitType: 'FIXED_PER_ROOM',
      });
    };

    const removeExtraFeeRow = (index) => {
      form.value.extraFees.splice(index, 1);
    };

    const fetchBoardingHouses = async () => {
      try {
        await store.fetchBoardingHouses();
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải danh sách dãy trọ');
      }
    };

    const saveHouse = async () => {
      try {
        if (showEditModal.value) {
          await store.updateBoardingHouse(editId.value, form.value);
        } else {
          await store.createBoardingHouse(form.value);
        }
        closeModal();
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
        bankName: house.bankName || '',
        bankAccountNumber: house.bankAccountNumber || '',
        bankAccountName: house.bankAccountName || '',
        extraFees: (house.extraFees || []).map(ef => ({
          id: ef.id,
          name: ef.name,
          defaultPrice: ef.defaultPrice,
          unitType: ef.unitType,
        })),
      };
      showEditModal.value = true;
    };

    const deleteHouse = async (id) => {
      if (confirm('Bạn có chắc chắn muốn xóa dãy trọ này? Hành động này sẽ xóa toàn bộ các phòng trọ và dữ liệu liên quan!')) {
        try {
          await store.deleteBoardingHouse(id);
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
        bankName: '',
        bankAccountNumber: '',
        bankAccountName: '',
        extraFees: [],
      };
    };

    onMounted(() => {
      fetchBoardingHouses();
    });

    return {
      houseIcon,
      boardingHouses,
      loading,
      showAddModal,
      showEditModal,
      form,
      popularBanks,
      saveHouse,
      editHouse,
      deleteHouse,
      closeModal,
      formatMoney,
      formatWaterBillingType,
      addExtraFeeRow,
      removeExtraFeeRow,
    };
  },
};
