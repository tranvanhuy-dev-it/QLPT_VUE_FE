import { ref, onMounted } from 'vue';
import Sidebar from '../../components/Sidebar.vue';
import api from '../../services/api.js';

export default {
  name: 'Invoices',
  components: {
    Sidebar,
  },
  setup() {
    const invoices = ref([]);
    const activeContracts = ref([]);
    const loading = ref(false);

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

    const fetchActiveContracts = async () => {
      try {
        const response = await api.get('/api/contracts', { params: { size: 100 } });
        const list = response.data.content || [];
        activeContracts.value = list.filter(c => c.status === 'ACTIVE');
      } catch (err) {
        console.error('Không tải được danh sách hợp đồng:', err);
      }
    };

    // Khi chọn hợp đồng dọn vào, tự động gợi ý chỉ số cũ và tính toán kỳ hóa đơn
    const onContractChange = () => {
      selectedContract.value = activeContracts.value.find(c => c.id === form.value.contractId);
      if (selectedContract.value) {
        const room = selectedContract.value.room;
        form.value.newElectricityIndex = room.currentElectricityIndex;
        form.value.newWaterIndex = room.currentWaterIndex;

        // Tự động thiết lập kỳ thanh toán:
        // Lấy ngày thuê hợp đồng làm ngày bắt đầu nếu chưa có hóa đơn cũ
        // Chúng ta tạm thời để trống cho chủ trọ tự nhập hoặc điền ngày hiện tại
        form.value.billingPeriodStart = selectedContract.value.startDate;
        
        // Gợi ý kết thúc sau đó 1 tháng
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

    const printReceipt = () => {
      const printContent = document.getElementById('receipt-print-area').innerHTML;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Phiếu thu tiền trọ - Phòng ${invoiceDetails.value.contract.room.roomNumber}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #333; }
              h2 { text-align: center; color: #4f46e5; margin-bottom: 5px; }
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

    onMounted(() => {
      fetchInvoices();
    });

    return {
      invoices,
      activeContracts,
      loading,
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
      printReceipt,
      changePage,
      closeModal,
      formatMoney,
      formatDate,
    };
  },
};
