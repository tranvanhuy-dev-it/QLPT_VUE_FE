import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useContractStore } from '../../stores/contract.js';

export default {
  name: 'ContractDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const contractStore = useContractStore();

    const contract = computed(() => contractStore.currentContract);
    const extraFees = computed(() => contractStore.currentExtraFees);
    const loading = computed(() => contractStore.loading);
    const isEditMode = ref(false);
    const numberOfTenants = ref(1);
    const saving = ref(false);

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const fetchContractDetail = async () => {
      try {
        const contractId = route.params.id;
        const res = await contractStore.fetchContractDetail(contractId);
        numberOfTenants.value = res.contract.numberOfTenants;

        // Automatically toggle edit mode if queried
        if (route.query.edit === 'true') {
          isEditMode.value = true;
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải thông tin chi tiết hợp đồng');
        router.push({ name: 'Contracts' });
      }
    };

    const toggleEditMode = () => {
      if (isEditMode.value) {
        // Cancel: reset number of tenants
        numberOfTenants.value = contract.value.numberOfTenants;
        isEditMode.value = false;
      } else {
        isEditMode.value = true;
      }
    };

    const submitEdit = async () => {
      if (numberOfTenants.value < 1) {
        alert('Số người ở phải từ 1 người trở lên.');
        return;
      }

      if (contract.value && numberOfTenants.value > contract.value.room.maxPeople) {
        alert(`Số người ở không được vượt quá sức chứa tối đa của phòng (${contract.value.room.maxPeople} người).`);
        return;
      }

      saving.value = true;
      try {
        await contractStore.updateContract(contract.value.id, {
          numberOfTenants: numberOfTenants.value
        });
        alert('Cập nhật số người ở thành công!');
        isEditMode.value = false;
      } catch (err) {
        alert(err.response?.data?.error || 'Cập nhật số người ở thất bại');
      } finally {
        saving.value = false;
      }
    };

    const goBack = () => {
      router.push({ name: 'Contracts' });
    };

    const terminateContract = async () => {
      if (confirm('Bạn có chắc chắn muốn thanh lý hợp đồng này ngay bây giờ? Phòng trọ sẽ chuyển sang trạng thái trống.')) {
        try {
          await contractStore.terminateContract(contract.value.id);
          alert('Đã thanh lý hợp đồng thành công!');
          await fetchContractDetail();
        } catch (err) {
          alert(err.response?.data?.error || 'Thanh lý hợp đồng thất bại');
        }
      }
    };

    onMounted(() => {
      fetchContractDetail();
    });

    return {
      contract,
      extraFees,
      loading,
      isEditMode,
      numberOfTenants,
      saving,
      formatMoney,
      formatDate,
      toggleEditMode,
      submitEdit,
      goBack,
      terminateContract
    };
  }
};
