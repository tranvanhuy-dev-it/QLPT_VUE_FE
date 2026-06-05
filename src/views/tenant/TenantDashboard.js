import { ref, onMounted } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import api from '../../services/api.js';

export default {
  name: 'TenantDashboard',
  components: {
    PageHeader,
  },
  setup() {
    const tenantDashboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>`;
    
    const activeContract = ref(null);
    const invoices = ref([]);
    const loading = ref(false);

    // Pagination
    const page = ref(0);
    const size = ref(10);
    const totalPages = ref(1);
    const totalElements = ref(0);

    const showDetailModal = ref(false);
    const invoiceDetails = ref(null);
    const invoiceItems = ref([]);

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const loadTenantData = async () => {
      loading.value = true;
      try {
        const contractsRes = await api.get('/api/contracts');
        const contractsList = contractsRes.data.content || [];
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
        const response = await api.get('/api/invoices', {
          params: { page: page.value, size: size.value },
        });
        invoices.value = response.data.content || [];
        totalPages.value = response.data.totalPages || 1;
        totalElements.value = response.data.totalElements || 0;
      } catch (err) {
        console.error('Không thể tải hóa đơn của người dùng:', err);
      }
    };

    const viewDetails = async (invoice) => {
      invoiceDetails.value = invoice;
      try {
        const response = await api.get(`/api/invoices/${invoice.id}/items`);
        invoiceItems.value = response.data || [];
        showDetailModal.value = true;
      } catch (err) {
        alert('Không thể tải chi tiết phụ phí hóa đơn');
      }
    };

    const printReceipt = () => {
      const printContent = document.getElementById('receipt-print-area-tenant').innerHTML;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Hóa đơn tiền trọ - Phòng ${invoiceDetails.value.contract.room.roomNumber}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333; }
              h2 { text-align: center; color: #0066cc; margin-bottom: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
              th, td { padding: 10px; border-bottom: 1px dashed #cbd5e1; font-size: 14px; }
              th { text-align: left; font-weight: bold; background-color: #f8fafc; }
              .total-section { margin-top: 20px; border-top: 2px dashed #333; padding-top: 15px; }
              .flex-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
              .bold { font-weight: bold; }
              .text-right { text-align: right; }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
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
      invoiceDetails,
      invoiceItems,
      viewDetails,
      printReceipt,
      changePage,
      closeModal,
      formatMoney,
      formatDate,
    };
  },
};
