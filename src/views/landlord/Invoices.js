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
      discount: 0,
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

    const contractExtraFees = ref([]);

    const onContractChange = async () => {
      selectedContract.value = activeContracts.value.find(
        (c) => c.id === form.value.contractId,
      );
      // Reset advanced configurations when changing contract
      form.value.excludeRoomPrice = false;
      form.value.excludeExtraFees = false;
      form.value.discount = 0;
      contractExtraFees.value = [];

      if (selectedContract.value) {
        try {
          const detail = await contractStore.fetchContractDetail(form.value.contractId);
          contractExtraFees.value = detail.extraFees || [];
        } catch (err) {
          console.error("Không tải được chi tiết hợp đồng:", err);
        }

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

    const computedRoomPrice = computed(() => {
      if (!selectedContract.value || form.value.excludeRoomPrice) return 0;
      
      const startStr = form.value.billingPeriodStart;
      const endStr = form.value.billingPeriodEnd;
      if (!startStr || !endStr) return 0;
      
      const start = new Date(startStr);
      const end = new Date(endStr);
      if (end <= start) return 0;

      const contractedPrice = selectedContract.value.contractedRoomPrice || 0;
      if (selectedContract.value.billingMode === 'BY_RENTAL_DAYS') {
        return contractedPrice;
      }
      
      // FIXED_DATE_OF_MONTH
      const startDay = start.getDate();
      const endDay = end.getDate();
      const fixedDay = selectedContract.value.fixedBillingDay;
      const stayedDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
      
      const isFullMonth = startDay === fixedDay && endDay === fixedDay && stayedDays >= 28;
      if (isFullMonth) {
        return contractedPrice;
      } else {
        // Prorated by stayed days
        const year = start.getFullYear();
        const month = start.getMonth(); // 0-indexed
        const daysInStartMonth = new Date(year, month + 1, 0).getDate();
        const dailyRate = contractedPrice / daysInStartMonth;
        return Math.round(dailyRate * stayedDays);
      }
    });

    const computedElectricityUsage = computed(() => {
      if (!selectedContract.value) return 0;
      const oldElec = selectedContract.value.room.currentElectricityIndex || 0;
      const newElec = Number(form.value.newElectricityIndex) || 0;
      return Math.max(0, newElec - oldElec);
    });

    const computedElectricityCost = computed(() => {
      if (!selectedContract.value) return 0;
      const rate = selectedContract.value.room.boardingHouse.defaultElectricityRate || 0;
      return Math.round(computedElectricityUsage.value * rate);
    });

    const computedWaterUsage = computed(() => {
      if (!selectedContract.value) return 0;
      if (selectedContract.value.room.boardingHouse.waterBillingType !== 'BY_INDEX') return 0;
      const oldWater = selectedContract.value.room.currentWaterIndex || 0;
      const newWater = Number(form.value.newWaterIndex) || 0;
      return Math.max(0, newWater - oldWater);
    });

    const computedWaterCost = computed(() => {
      if (!selectedContract.value) return 0;
      const bh = selectedContract.value.room.boardingHouse;
      const rate = bh.defaultWaterRate || 0;
      if (bh.waterBillingType === 'BY_INDEX') {
        return Math.round(computedWaterUsage.value * rate);
      } else if (bh.waterBillingType === 'FIXED_PER_PERSON') {
        const tenants = selectedContract.value.numberOfTenants || 1;
        return Math.round(tenants * rate);
      } else { // FIXED_PER_ROOM
        return rate;
      }
    });

    const computedExtraFeesList = computed(() => {
      if (!selectedContract.value || form.value.excludeExtraFees) return [];
      return contractExtraFees.value.map(cef => {
        const quantity = cef.extraFee.unitType === 'FIXED_PER_PERSON' 
          ? (selectedContract.value.numberOfTenants || 1) 
          : 1;
        const subtotal = Math.round(cef.customPrice * quantity);
        return {
          name: cef.extraFee.name,
          price: cef.customPrice,
          quantity,
          subtotal
        };
      });
    });

    const computedExtraFeesTotal = computed(() => {
      return computedExtraFeesList.value.reduce((sum, item) => sum + item.subtotal, 0);
    });

    const computedTotalAmount = computed(() => {
      const discount = Number(form.value.discount) || 0;
      const totalBeforeDiscount = computedRoomPrice.value + 
             computedElectricityCost.value + 
             computedWaterCost.value + 
             computedExtraFeesTotal.value;
      return Math.max(0, totalBeforeDiscount - discount);
    });

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
        await onContractChange();
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
      contractExtraFees.value = [];
      form.value = {
        contractId: "",
        invoiceDate: new Date().toISOString().substring(0, 10),
        billingPeriodStart: "",
        billingPeriodEnd: "",
        newElectricityIndex: 0,
        newWaterIndex: 0,
        excludeRoomPrice: false,
        excludeExtraFees: false,
        discount: 0,
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
          await onContractChange();
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

      contractExtraFees,
      computedRoomPrice,
      computedElectricityUsage,
      computedElectricityCost,
      computedWaterUsage,
      computedWaterCost,
      computedExtraFeesList,
      computedExtraFeesTotal,
      computedTotalAmount
    };
  },
};
