import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import PageHeader from "../../components/PageHeader.vue";
import DataTable from "../../components/DataTable.vue";
import Modal from "../../components/Modal.vue";
import InvoiceReceipt from "../../components/InvoiceReceipt.vue";
import Checkbox from "../../components/Checkbox.vue";
import FormInput from "../../components/FormInput.vue";
import FormSelect from "../../components/FormSelect.vue";
import FormButton from "../../components/FormButton.vue";
import { useInvoiceStore } from "../../stores/invoice.js";
import { useContractStore } from "../../stores/contract.js";

export default {
  name: "Invoices",
  components: {
    PageHeader,
    DataTable,
    Modal,
    InvoiceReceipt,
    Checkbox,
    FormInput,
    FormSelect,
    FormButton,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const invoiceIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`;

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
    };

    const tableHeaders = [
      { label: "Phòng", key: "contract.room.roomNumber", prefix: "Phòng ", cellClass: "font-semibold text-primary" },
      { label: "Khách thuê", key: "contract.tenant.fullName", cellClass: "font-medium text-text-main" },
      {
        label: "Kỳ tính tiền",
        key: "billingPeriod",
        formatter: (item) => `${formatDate(item.billingPeriodStart)} - ${formatDate(item.billingPeriodEnd)}`,
        cellClass: "text-xs text-text-sub",
      },
      { label: "Tổng tiền", key: "totalAmount", type: "money", cellClass: "font-semibold text-primary" },
      { label: "Đã thanh toán", key: "paidAmount", type: "money", cellClass: "font-semibold text-success" },
    ];

    const invoiceStore = useInvoiceStore();
    const contractStore = useContractStore();

    const invoices = computed(() => invoiceStore.invoices);
    const loading = computed(
      () => invoiceStore.loading || contractStore.loading,
    );
    const totalPages = computed(() => invoiceStore.totalPages);
    const totalElements = computed(() => invoiceStore.totalElements);
    const invoiceItems = computed(() => invoiceStore.currentInvoiceItems);
    const activeContracts = computed(() => contractStore.activeContracts);

    const allInvoices = ref([]);

    // Search
    const searchQuery = ref("");

    // Pagination
    const page = ref(0);
    const size = ref(10);

    // Modals
    const showCreateModal = ref(false);
    const showPayModal = ref(false);
    const showDetailModal = ref(false);
    const isLoadingDetails = ref(false);

    const invoiceDetails = ref(null);
    const selectedContract = ref(null);

    const form = ref({
      contractId: "",
      invoiceDate: new Date().toISOString().substring(0, 10),
      billingPeriodStart: "",
      billingPeriodEnd: "",
      newElectricityIndex: 0,
      newWaterIndex: 0,
      excludeRoomPrice: false,
      excludeExtraFees: false,
    });

    const payForm = ref({
      invoiceId: null,
      roomNumber: "",
      remainingAmount: 0,
      paidAmount: 0,
    });

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return "0";
      return Math.round(amount).toLocaleString("vi-VN");
    };



    const fetchInvoices = async () => {
      try {
        await invoiceStore.fetchInvoices({
          page: page.value,
          size: size.value,
        });
      } catch (err) {
        alert(err.response?.data?.error || "Không thể tải danh sách hóa đơn");
      }
    };

    const filteredInvoices = computed(() => {
      if (!searchQuery.value) return invoices.value;
      const q = searchQuery.value.toLowerCase().trim();
      return invoices.value.filter(
        (inv) =>
          inv.contract.tenant.fullName.toLowerCase().includes(q) ||
          inv.contract.room.roomNumber.toLowerCase().includes(q) ||
          inv.contract.room.boardingHouse.name.toLowerCase().includes(q),
      );
    });

    const fetchActiveContracts = async () => {
      try {
        await contractStore.fetchActiveContracts();
      } catch (err) {
        console.error("Không tải được danh sách hợp đồng:", err);
      }
    };

    const onContractChange = () => {
      selectedContract.value = activeContracts.value.find(
        (c) => c.id === form.value.contractId,
      );
      // Reset advanced configurations when changing contract
      form.value.excludeRoomPrice = false;
      form.value.excludeExtraFees = false;

      if (selectedContract.value) {
        const room = selectedContract.value.room;
        const bh = room.boardingHouse;
        const timing = bh.billingTiming || "PREPAID";

        // Filter and sort invoices for this contract by billingPeriodEnd descending
        const contractInvoices = allInvoices.value
          .filter((inv) => inv.contract.id === form.value.contractId)
          .sort(
            (a, b) =>
              new Date(b.billingPeriodEnd) - new Date(a.billingPeriodEnd),
          );

        if (contractInvoices.length > 0) {
          const lastInvoice = contractInvoices[0];
          form.value.billingPeriodStart = lastInvoice.billingPeriodEnd;

          const start = new Date(lastInvoice.billingPeriodEnd);
          start.setMonth(start.getMonth() + 1);
          const endStr = start.toISOString().substring(0, 10);
          form.value.billingPeriodEnd = endStr;

          // Default invoiceDate based on timing
          if (timing === "PREPAID") {
            form.value.invoiceDate = lastInvoice.billingPeriodEnd; // Start of the next billing period
            form.value.newElectricityIndex = room.currentElectricityIndex;
            form.value.newWaterIndex = room.currentWaterIndex;
          } else {
            form.value.invoiceDate = endStr; // End of the next billing period
            form.value.newElectricityIndex = room.currentElectricityIndex;
            form.value.newWaterIndex = room.currentWaterIndex;
          }
        } else {
          // First invoice ever
          form.value.billingPeriodStart = selectedContract.value.startDate;

          const start = new Date(selectedContract.value.startDate);
          start.setMonth(start.getMonth() + 1);
          const endStr = start.toISOString().substring(0, 10);
          form.value.billingPeriodEnd = endStr;

          if (timing === "PREPAID") {
            form.value.invoiceDate = selectedContract.value.startDate; // Check-in start date
            form.value.newElectricityIndex = room.currentElectricityIndex;
            form.value.newWaterIndex = room.currentWaterIndex;
          } else {
            form.value.invoiceDate = endStr; // End of month 1
            form.value.newElectricityIndex = room.currentElectricityIndex;
            form.value.newWaterIndex = room.currentWaterIndex;
          }
        }
      }
    };

    const openCreateModal = async () => {
      await fetchActiveContracts();
      try {
        // We can just query all invoices for period start calculation
        const all = await invoiceStore.fetchInvoices({ page: 0, size: 1000 });
        allInvoices.value = all || [];
      } catch (err) {
        console.error("Không tải được danh sách hóa đơn:", err);
      }
      if (activeContracts.value.length > 0) {
        form.value.contractId = activeContracts.value[0].id;
        onContractChange();
      }
      showCreateModal.value = true;
    };

    const saveInvoice = async () => {
      try {
        const createdInvoice = await invoiceStore.createInvoice(form.value);
        closeModal();
        router.push({
          name: "InvoiceDetail",
          params: { id: createdInvoice.id }
        });
      } catch (err) {
        alert(err.response?.data?.error || "Lập hóa đơn thất bại");
      }
    };

    const openPayModal = (invoice) => {
      payForm.value = {
        invoiceId: invoice.id,
        roomNumber: invoice.contract.room.roomNumber,
        remainingAmount: invoice.totalAmount - invoice.paidAmount,
        paidAmount: invoice.totalAmount - invoice.paidAmount,
      };
      showPayModal.value = true;
    };

    const submitPayment = async () => {
      try {
        await invoiceStore.payInvoice(
          payForm.value.invoiceId,
          payForm.value.paidAmount,
        );
        alert("Ghi nhận thanh toán thành công!");
        closeModal();
        fetchInvoices();
      } catch (err) {
        alert(err.response?.data?.error || "Ghi nhận thanh toán thất bại");
      }
    };

    const viewDetails = (invoice) => {
      router.push({ name: 'InvoiceDetail', params: { id: invoice.id } });
    };

    const payInvoiceFromDetails = () => {
      if (invoiceDetails.value) {
        const inv = invoiceDetails.value;
        showDetailModal.value = false;
        openPayModal(inv);
      }
    };

    const quickPayInvoice = async () => {
      if (invoiceDetails.value) {
        const inv = invoiceDetails.value;
        const remaining = inv.totalAmount - inv.paidAmount;
        if (
          confirm(
            `Xác nhận ghi nhận đã thu đủ số tiền còn lại: ${formatMoney(remaining)} đ?`,
          )
        ) {
          try {
            await invoiceStore.payInvoice(inv.id, remaining);
            alert("Ghi nhận thanh toán thành công!");
            closeModal();
            fetchInvoices();
          } catch (err) {
            alert(err.response?.data?.error || "Ghi nhận thanh toán thất bại");
          }
        }
      }
    };



    const changePage = (newPage) => {
      if (newPage >= 0 && newPage < totalPages.value) {
        page.value = newPage;
        fetchInvoices();
      }
    };

    const closeModal = () => {
      showCreateModal.value = false;
      showPayModal.value = false;
      showDetailModal.value = false;
      selectedContract.value = null;
      invoiceDetails.value = null;
      invoiceItems.value = [];
      form.value = {
        contractId: "",
        invoiceDate: new Date().toISOString().substring(0, 10),
        billingPeriodStart: "",
        billingPeriodEnd: "",
        newElectricityIndex: 0,
        newWaterIndex: 0,
        excludeRoomPrice: false,
        excludeExtraFees: false,
      };
      payForm.value = {
        invoiceId: null,
        roomNumber: "",
        remainingAmount: 0,
        paidAmount: 0,
      };
    };

    onMounted(async () => {
      fetchInvoices();
      await fetchActiveContracts();

      // Check if redirected from dashboard to create invoice for a contract
      const contractIdQuery = route.query.createForContractId;
      if (contractIdQuery) {
        const contractExists = activeContracts.value.some(c => c.id === contractIdQuery);
        if (contractExists) {
          try {
            // Fetch all invoices to populate allInvoices list (used for billing period calculations)
            const all = await invoiceStore.fetchInvoices({ page: 0, size: 1000 });
            allInvoices.value = all || [];
          } catch (err) {
            console.error("Không tải được danh sách hóa đơn:", err);
          }
          form.value.contractId = contractIdQuery;
          onContractChange();
          showCreateModal.value = true;
        }
      }
    });

    return {
      invoiceIcon,
      invoices,
      filteredInvoices,
      activeContracts,
      loading,
      searchQuery,
      page,
      totalPages,
      totalElements,
      showCreateModal,
      showPayModal,
      showDetailModal,
      isLoadingDetails,
      invoiceDetails,
      invoiceItems,
      selectedContract,
      form,
      payForm,
      openCreateModal,
      onContractChange,
      saveInvoice,
      openPayModal,
      submitPayment,
      viewDetails,
      payInvoiceFromDetails,
      quickPayInvoice,

      changePage,
      closeModal,
      formatMoney,
      formatDate,
      tableHeaders,
    };
  },
};
