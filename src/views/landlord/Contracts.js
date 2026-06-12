import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import PageHeader from "../../components/ui/PageHeader.vue";
import DataTable from "../../components/ui/DataTable.vue";
import ConfirmModal from "../../components/ui/ConfirmModal.vue";
import Checkbox from "../../components/ui/Checkbox.vue";
import { useContractStore } from "../../stores/contract.js";
import { useConfirmModal } from "../../composables/useConfirmModal.js";
import { useAuthStore } from "../../stores/auth.js";

export default {
  name: "Contracts",
  components: {
    PageHeader,
    DataTable,
    ConfirmModal,
    Checkbox,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const isLandlord = computed(() => authStore.role === "LANDLORD");
    const {
      confirmModal,
      showAlert,
      onConfirmModal,
      closeConfirmModal,
    } = useConfirmModal();
    const contractIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`;

    const tableHeaders = [
      {
        label: "Người thuê",
        key: "tenant.fullName",
        cellClass: "font-semibold text-text-main",
      },
      {
        label: "Phòng - Dãy trọ",
        key: "room.roomNumber",
        cellClass: "font-semibold text-primary",
      },
      {
        label: "Ngày bắt đầu",
        key: "startDate",
        type: "date",
        cellClass: "text-text-sub",
      },
      {
        label: "Tiền cọc",
        key: "deposit",
        type: "money",
        cellClass: "font-semibold text-text-main",
        hideOnMobile: true,
      },
      {
        label: "Trạng thái",
        key: "status",
        type: "badge",
        badgeColors: {
          ACTIVE:
            "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400",
          TERMINATED:
            "bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400",
          EXPIRED:
            "bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400",
        },
        badgeLabels: {
          ACTIVE: "Hoạt Động",
          TERMINATED: "Đã Thanh Lý",
          EXPIRED: "Hết Hạn",
        },
      },
    ];

    const contractStore = useContractStore();

    const contracts = computed(() => contractStore.contracts);
    const loading = computed(() => contractStore.loading);
    const totalPages = computed(() => contractStore.totalPages);
    const totalElements = computed(() => contractStore.totalElements);

    // Search
    const searchQuery = ref("");

    // Show all contracts (including liquidated/terminated)
    const showAll = ref(false);

    // Pagination
    const page = ref(0);
    const size = ref(10);

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return "0";
      return Math.round(amount).toLocaleString("vi-VN");
    };

    const formatDate = (dateString) => {
      if (!dateString) return "-";
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    };

    const fetchContracts = async () => {
      try {
        await contractStore.fetchContracts({
          page: page.value,
          size: size.value,
          showAll: showAll.value,
        });
      } catch (err) {
        showAlert(
          "Lỗi",
          err.response?.data?.error || "Không thể tải danh sách hợp đồng",
          "danger"
        );
      }
    };

    watch(showAll, () => {
      page.value = 0;
      fetchContracts();
    });

    const filteredContracts = computed(() => {
      if (!searchQuery.value) return contracts.value;
      const q = searchQuery.value.toLowerCase().trim();
      return contracts.value.filter(
        (contract) =>
          contract.tenant.fullName.toLowerCase().includes(q) ||
          contract.tenant.username.toLowerCase().includes(q) ||
          contract.room.roomNumber.toLowerCase().includes(q) ||
          contract.room.boardingHouse.name.toLowerCase().includes(q)
      );
    });

    const goToCreateContract = () => {
      router.push({ name: "CreateContract" });
    };

    const changePage = (newPage) => {
      if (newPage >= 0 && newPage < totalPages.value) {
        page.value = newPage;
        fetchContracts();
      }
    };

    const viewContractDetail = (id, edit = false) => {
      const routeName = isLandlord.value
        ? "ContractDetail"
        : "TenantContractDetail";
      router.push({
        name: routeName,
        params: { id },
        query: edit ? { edit: "true" } : {},
      });
    };

    onMounted(() => {
      fetchContracts();
    });

    return {
      isLandlord,
      contractIcon,
      contracts,
      filteredContracts,
      loading,
      searchQuery,
      showAll,
      page,
      totalPages,
      totalElements,
      goToCreateContract,
      changePage,
      formatMoney,
      formatDate,
      viewContractDetail,
      tableHeaders,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
