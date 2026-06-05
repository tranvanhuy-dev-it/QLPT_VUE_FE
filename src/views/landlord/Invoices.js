import { ref, onMounted, computed } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import api from '../../services/api.js';

export default {
  name: 'Invoices',
  components: {
    PageHeader,
  },
  setup() {
    const invoiceIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`;
    
    const invoices = ref([]);
    const activeContracts = ref([]);
    const loading = ref(true);

    // Search
    const searchQuery = ref('');

    // Pagination
    const page = ref(0);
    const size = ref(10);
    const totalPages = ref(1);
    const totalElements = ref(0);

    // Modals
    const showCreateModal = ref(false);
    const showPayModal = ref(false);
    const showDetailModal = ref(false);

    const invoiceDetails = ref(null);
    const invoiceItems = ref([]);
    const selectedContract = ref(null);

    const form = ref({
      contractId: '',
      invoiceDate: new Date().toISOString().substring(0, 10),
      billingPeriodStart: '',
      billingPeriodEnd: '',
      newElectricityIndex: 0,
      newWaterIndex: 0,
    });

    const payForm = ref({
      invoiceId: null,
      roomNumber: '',
      remainingAmount: 0,
      paidAmount: 0,
    });

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const fetchInvoices = async () => {
      loading.value = true;
      try {
        const response = await api.get('/api/invoices', {
          params: { page: page.value, size: size.value },
        });
        invoices.value = response.data.content || [];
        totalPages.value = response.data.totalPages || 1;
        totalElements.value = response.data.totalElements || 0;
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải danh sách hóa đơn');
      } finally {
        loading.value = false;
      }
    };

    const filteredInvoices = computed(() => {
      if (!searchQuery.value) return invoices.value;
      const q = searchQuery.value.toLowerCase().trim();
      return invoices.value.filter(inv => 
        inv.contract.tenant.fullName.toLowerCase().includes(q) ||
        inv.contract.room.roomNumber.toLowerCase().includes(q) ||
        inv.contract.room.boardingHouse.name.toLowerCase().includes(q)
      );
    });

    const fetchActiveContracts = async () => {
      try {
        const response = await api.get('/api/contracts', { params: { size: 100 } });
        const list = response.data.content || [];
        activeContracts.value = list.filter(c => c.status === 'ACTIVE');
      } catch (err) {
        console.error('Không tải được danh sách hợp đồng:', err);
      }
    };

    const onContractChange = () => {
      selectedContract.value = activeContracts.value.find(c => c.id === form.value.contractId);
      if (selectedContract.value) {
        const room = selectedContract.value.room;
        form.value.newElectricityIndex = room.currentElectricityIndex;
        form.value.newWaterIndex = room.currentWaterIndex;

        form.value.billingPeriodStart = selectedContract.value.startDate;
        
        const start = new Date(selectedContract.value.startDate);
        start.setMonth(start.getMonth() + 1);
        form.value.billingPeriodEnd = start.toISOString().substring(0, 10);
      }
    };

    const openCreateModal = async () => {
      await fetchActiveContracts();
      if (activeContracts.value.length > 0) {
        form.value.contractId = activeContracts.value[0].id;
        onContractChange();
      }
      showCreateModal.value = true;
    };

    const saveInvoice = async () => {
      try {
        await api.post('/api/invoices', form.value);
        alert('Lập hóa đơn và tính tiền thành công!');
        closeModal();
        fetchInvoices();
      } catch (err) {
        alert(err.response?.data?.error || 'Lập hóa đơn thất bại');
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
        await api.post(`/api/invoices/${payForm.value.invoiceId}/pay`, {
          paidAmount: payForm.value.paidAmount,
        });
        alert('Ghi nhận thanh toán thành công!');
        closeModal();
        fetchInvoices();
      } catch (err) {
        alert(err.response?.data?.error || 'Ghi nhận thanh toán thất bại');
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
        if (confirm(`Xác nhận ghi nhận đã thu đủ số tiền còn lại: ${formatMoney(remaining)} đ?`)) {
          try {
            await api.post(`/api/invoices/${inv.id}/pay`, {
              paidAmount: remaining,
            });
            alert('Ghi nhận thanh toán thành công!');
            closeModal();
            fetchInvoices();
          } catch (err) {
            alert(err.response?.data?.error || 'Ghi nhận thanh toán thất bại');
          }
        }
      }
    };

    const printReceipt = () => {
      const printContent = document.getElementById('receipt-print-area').innerHTML;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Phiếu thu tiền trọ - Phòng ${invoiceDetails.value.contract.room.roomNumber}</title>
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
      showCreateModal.value = false;
      showPayModal.value = false;
      showDetailModal.value = false;
      selectedContract.value = null;
      invoiceDetails.value = null;
      invoiceItems.value = [];
      form.value = {
        contractId: '',
        invoiceDate: new Date().toISOString().substring(0, 10),
        billingPeriodStart: '',
        billingPeriodEnd: '',
        newElectricityIndex: 0,
        newWaterIndex: 0,
      };
      payForm.value = {
        invoiceId: null,
        roomNumber: '',
        remainingAmount: 0,
        paidAmount: 0,
      };
    };

    onMounted(async () => {
      fetchInvoices();
      await fetchActiveContracts();
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
      printReceipt,
      changePage,
      closeModal,
      formatMoney,
      formatDate,
    };
  },
};
