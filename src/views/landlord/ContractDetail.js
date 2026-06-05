import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api.js';

export default {
  name: 'ContractDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const contract = ref(null);
    const extraFees = ref([]);
    const loading = ref(true);
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
      loading.value = true;
      try {
        const contractId = route.params.id;
        const [contractRes, feesRes] = await Promise.all([
          api.get(`/api/contracts/${contractId}`),
          api.get(`/api/contracts/${contractId}/extra-fees`)
        ]);

        contract.value = contractRes.data;
        extraFees.value = feesRes.data || [];
        numberOfTenants.value = contractRes.data.numberOfTenants;

        // Automatically toggle edit mode if queried
        if (route.query.edit === 'true') {
          isEditMode.value = true;
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải thông tin chi tiết hợp đồng');
        router.push({ name: 'Contracts' });
      } finally {
        loading.value = false;
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
        const response = await api.put(`/api/contracts/${contract.value.id}`, {
          numberOfTenants: numberOfTenants.value
        });
        contract.value.numberOfTenants = response.data.numberOfTenants;
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
      goBack
    };
  }
};
