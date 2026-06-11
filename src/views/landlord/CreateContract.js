import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Checkbox from "../../components/ui/Checkbox.vue";
import FormInput from "../../components/ui/FormInput.vue";
import FormSelect from "../../components/ui/FormSelect.vue";
import FormButton from "../../components/ui/FormButton.vue";
import ConfirmModal from "../../components/ui/ConfirmModal.vue";
import AppIcon from "../../components/ui/icons/AppIcon.vue";
import { useContractStore } from "../../stores/contract.js";
import { useRoomStore } from "../../stores/room.js";
import { useTenantStore } from "../../stores/tenant.js";
import contractService from "../../services/contractService.js";
import { validateDateRange } from "../../utils/validation.js";
import { useConfirmModal } from "../../composables/useConfirmModal.js";
import { useAuthStore } from "../../stores/auth.js";

export default {
  name: "CreateContract",
  components: {
    Checkbox,
    FormInput,
    FormSelect,
    FormButton,
    ConfirmModal,
    AppIcon,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    
    const {
      confirmModal,
      showAlert,
      showConfirm,
      onConfirmModal,
      closeConfirmModal,
    } = useConfirmModal();

    const contractStore = useContractStore();
    const roomStore = useRoomStore();
    const tenantStore = useTenantStore();

    const loading = computed(
      () => contractStore.loading || roomStore.loading || tenantStore.loading
    );

    const vacantRooms = ref([]);
    const tenantsList = ref([]);
    const availableExtraFees = ref([]);

    // Inline tenant creation
    const showInlineTenantForm = ref(false);
    const inlineTenantLoading = ref(false);
    const inlineTenantForm = ref({
      fullName: "",
      username: "",
      password: "",
      phone: "",
      email: "",
      identityCard: "",
      idCardIssueDate: "",
      idCardIssuePlace: "",
      permanentAddress: "",
    });

    const form = ref({
      roomId: "",
      tenantId: "",
      startDate: new Date().toISOString().substring(0, 10),
      endDate: "",
      deposit: 0,
      contractedRoomPrice: 0,
      numberOfTenants: 1,
      fixedBillingDay: null,
    });

    const fetchVacantRooms = async () => {
      try {
        const list = await roomStore.fetchRooms({ size: 200 });
        vacantRooms.value = list.filter((r) => r.status === "VACANT");
      } catch (err) {
        console.error("Không tải được danh sách phòng trống:", err);
      }
    };

    const fetchTenants = async () => {
      try {
        const list = await tenantStore.fetchTenants({
          size: 200,
          status: "ACTIVE",
          availableOnly: true,
        });
        tenantsList.value = list || [];
      } catch (err) {
        console.error("Không tải được danh sách người thuê:", err);
      }
    };

    const onRoomChange = async () => {
      const selectedRoom = vacantRooms.value.find(
        (r) => r.id === form.value.roomId
      );
      if (selectedRoom) {
        form.value.contractedRoomPrice = selectedRoom.basePrice;
        form.value.deposit = selectedRoom.basePrice;
        form.value.fixedBillingDay =
          selectedRoom.boardingHouse?.fixedBillingDay || null;

        try {
          const response = await contractService.getBoardingHouseExtraFees(
            selectedRoom.boardingHouse.id
          );
          availableExtraFees.value = (response.data || []).map((ef) => ({
            ...ef,
            selected: true,
            customPrice: ef.defaultPrice,
          }));
        } catch (err) {
          console.error("Không tải được dịch vụ dãy trọ:", err);
        }
      }
    };

    const goBack = () => {
      router.push({ name: "Contracts" });
    };

    const saveContract = async () => {
      if (
        form.value.endDate &&
        !validateDateRange(form.value.startDate, form.value.endDate)
      ) {
        showAlert(
          "Lỗi nhập liệu",
          "Ngày bắt đầu thuê phải trước ngày kết thúc.",
          "warning"
        );
        return;
      }
      try {
        const extraFeesPayload = availableExtraFees.value
          .filter((ef) => ef.selected)
          .map((ef) => ({
            extraFeeId: ef.id,
            customPrice: ef.customPrice,
          }));

        const payload = {
          ...form.value,
          extraFees: extraFeesPayload,
        };

        if (payload.endDate === "") {
          delete payload.endDate;
        }

        const createdContract = await contractStore.createContract(payload);
        router.push({
          name: "ContractDetail",
          params: { id: createdContract.id },
        });
      } catch (err) {
        showAlert(
          "Lỗi",
          err.response?.data?.error || "Tạo hợp đồng thất bại",
          "danger"
        );
      }
    };

    const createInlineTenant = async () => {
      if (!inlineTenantForm.value.fullName || !inlineTenantForm.value.username || !inlineTenantForm.value.password) {
        showAlert("Lỗi", "Vui lòng nhập đầy đủ họ tên, tên đăng nhập và mật khẩu.", "warning");
        return;
      }
      inlineTenantLoading.value = true;
      try {
        const newTenant = await tenantStore.createTenantAccount(inlineTenantForm.value);
        // Refresh tenants list
        await fetchTenants();
        // Auto-select the new tenant
        if (newTenant && newTenant.id) {
          form.value.tenantId = newTenant.id;
        }
        // Reset and hide inline form
        inlineTenantForm.value = { fullName: "", username: "", password: "", phone: "", email: "", identityCard: "", idCardIssueDate: "", idCardIssuePlace: "", permanentAddress: "" };
        showInlineTenantForm.value = false;
        showAlert("Thành công", `Đã tạo tài khoản khách thuê "${newTenant.fullName}" thành công.`, "success");
      } catch (err) {
        showAlert("Lỗi", err.response?.data?.error || "Tạo tài khoản khách thuê thất bại.", "danger");
      } finally {
        inlineTenantLoading.value = false;
      }
    };

    const goToRooms = () => {
      router.push({ name: "Rooms" });
    };

    const goToTenants = () => {
      router.push({ name: "Tenants" });
    };

    onMounted(async () => {
      await Promise.all([fetchVacantRooms(), fetchTenants()]);
      if (vacantRooms.value.length > 0) {
        form.value.roomId = vacantRooms.value[0].id;
        onRoomChange();
      }
      if (tenantsList.value.length > 0) {
        form.value.tenantId = tenantsList.value[0].id;
      }
    });

    return {
      vacantRooms,
      tenantsList,
      availableExtraFees,
      loading,
      showInlineTenantForm,
      inlineTenantLoading,
      inlineTenantForm,
      createInlineTenant,
      form,
      onRoomChange,
      saveContract,
      goBack,
      goToRooms,
      goToTenants,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
