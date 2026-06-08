import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '../../components/ui/PageHeader.vue';
import DataTable from '../../components/ui/DataTable.vue';
import InvoiceReceipt from '../../components/document/InvoiceReceipt.vue';
import FormButton from '../../components/ui/FormButton.vue';
import { useContractStore } from '../../stores/contract.js';
import { useInvoiceStore } from '../../stores/invoice.js';

export default {
  name: 'TenantDashboard',
  components: {
    PageHeader,
    DataTable,
    InvoiceReceipt,
    FormButton,
  },
  setup() {
    const router = useRouter();
    const tenantDashboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`;

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const tableHeaders = [
      { label: 'Ngày xuất', key: 'invoiceDate', type: 'date', cellClass: 'text-text-sub' },
      {
        label: 'Kỳ thanh toán',
        key: 'billingPeriod',
        formatter: (item) => `${formatDate(item.billingPeriodStart)} - ${formatDate(item.billingPeriodEnd)}`,
        cellClass: 'text-xs text-text-sub',
      },
      { label: 'Tiền phòng', key: 'roomPrice', type: 'money', cellClass: 'text-text-main' },
      { label: 'Tổng cộng', key: 'totalAmount', type: 'money', cellClass: 'font-semibold text-primary' },
      { label: 'Đã thanh toán', key: 'paidAmount', type: 'money', cellClass: 'font-semibold text-success' },
      {
        label: 'Trạng thái',
        key: 'status',
        type: 'badge',
        badgeColors: {
          PAID: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400',
          PARTIALLY_PAID: 'bg-amber-50 text-amber-600 dark:bg-amber-950/35 dark:text-amber-400',
          UNPAID: 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400',
        },
        badgeLabels: {
          PAID: 'Đã thanh toán',
          PARTIALLY_PAID: 'Trả một phần',
          UNPAID: 'Chưa đóng tiền',
        },
      },
      { label: 'Hành động', key: 'actions', align: 'right' },
    ];
    
    const contractStore = useContractStore();
    const invoiceStore = useInvoiceStore();

    const activeContract = ref(null);
    const invoices = computed(() => invoiceStore.invoices);
    const loading = ref(true);

    // Pagination
    const page = ref(0);
    const size = ref(10);
    const totalPages = computed(() => invoiceStore.totalPages);
    const totalElements = computed(() => invoiceStore.totalElements);

    const showDetailModal = ref(false);
    const isLoadingDetails = ref(false);
    const invoiceDetails = ref(null);
    const invoiceItems = ref([]);

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };



    const loadTenantData = async () => {
      loading.value = true;
      try {
        const contractsList = await contractStore.fetchContracts();
        activeContract.value = contractsList.find(c => c.status === 'ACTIVE') || null;

        await fetchInvoices();
      } catch (err) {
        console.error('Không thể tải dữ liệu người thuê:', err);
      } finally {
        loading.value = false;
      }
    };

    const fetchInvoices = async () => {
      try {
        await invoiceStore.fetchInvoices({ page: page.value, size: size.value });
      } catch (err) {
        console.error('Không thể tải hóa đơn của người dùng:', err);
      }
    };

    const viewDetails = (invoice) => {
      router.push({ name: 'TenantInvoiceDetail', params: { id: invoice.id } });
    };

    const changePage = (newPage) => {
      if (newPage >= 0 && newPage < totalPages.value) {
        page.value = newPage;
        fetchInvoices();
      }
    };

    const closeModal = () => {
      showDetailModal.value = false;
      invoiceDetails.value = null;
      invoiceItems.value = [];
    };

    onMounted(() => {
      loadTenantData();
    });

    return {
      tenantDashboardIcon,
      activeContract,
      invoices,
      loading,
      page,
      totalPages,
      totalElements,
      showDetailModal,
      isLoadingDetails,
      invoiceDetails,
      invoiceItems,
      viewDetails,
      changePage,
      closeModal,
      formatMoney,
      formatDate,
      tableHeaders,
    };
  },
};
