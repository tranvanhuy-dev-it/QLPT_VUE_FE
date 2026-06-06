import { ref, onMounted, computed } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import api from '../../services/api.js';
import html2canvas from 'html2canvas-pro';

export default {
  name: 'Invoices',
  components: {
    PageHeader,
  },
  setup() {
    const invoiceIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`;
    
    const invoices = ref([]);
    const allInvoices = ref([]);
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
      excludeRoomPrice: false,
      excludeExtraFees: false,
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
      // Reset advanced configurations when changing contract
      form.value.excludeRoomPrice = false;
      form.value.excludeExtraFees = false;

      if (selectedContract.value) {
        const room = selectedContract.value.room;
        const bh = room.boardingHouse;
        const timing = bh.billingTiming || 'PREPAID';

        // Filter and sort invoices for this contract by billingPeriodEnd descending
        const contractInvoices = allInvoices.value
          .filter(inv => inv.contract.id === form.value.contractId)
          .sort((a, b) => new Date(b.billingPeriodEnd) - new Date(a.billingPeriodEnd));

        if (contractInvoices.length > 0) {
          const lastInvoice = contractInvoices[0];
          form.value.billingPeriodStart = lastInvoice.billingPeriodEnd;
          
          const start = new Date(lastInvoice.billingPeriodEnd);
          start.setMonth(start.getMonth() + 1);
          const endStr = start.toISOString().substring(0, 10);
          form.value.billingPeriodEnd = endStr;

          // Default invoiceDate based on timing
          if (timing === 'PREPAID') {
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

          if (timing === 'PREPAID') {
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
        const response = await api.get('/api/invoices', { params: { page: 0, size: 1000 } });
        allInvoices.value = response.data.content || [];
      } catch (err) {
        console.error('Không tải được danh sách hóa đơn:', err);
      }
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
            <title>Phiếu thanh toán tiền phòng & dịch vụ - Phòng ${invoiceDetails.value.contract.room.roomNumber}</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #1e293b;
                padding: 30px;
                background-color: #fff;
                line-height: 1.5;
              }
              .print-hidden, .screen-only-mobile {
                display: none !important;
              }
              .overflow-x-auto {
                overflow: visible !important;
                border: none !important;
              }
              .print-only-table {
                display: table !important;
                width: 100% !important;
                min-width: 0 !important;
                border-collapse: collapse !important;
                margin-top: 20px !important;
                margin-bottom: 20px !important;
              }
              .print-only-table th {
                background-color: #f8fafc !important;
                border-bottom: 2px solid #cbd5e1 !important;
                color: #475569 !important;
                font-weight: bold !important;
                padding: 8px 10px !important;
                text-transform: uppercase !important;
                font-size: 11px !important;
                text-align: right;
              }
              .print-only-table th:first-child {
                text-align: left;
              }
              .print-only-table th.text-center {
                text-align: center;
              }
              .print-only-table td {
                padding: 10px !important;
                border-bottom: 1px dashed #cbd5e1 !important;
                color: #334155 !important;
                font-size: 12px !important;
              }
              .print-only-table tr {
                display: table-row !important;
              }
              .print-only-table th, .print-only-table td {
                display: table-cell !important;
              }
              /* Layout Utilities */
              .flex { display: flex !important; }
              .items-center { align-items: center !important; }
              .justify-between { justify-content: space-between !important; }
              .border-b-2 { border-bottom: 2px solid #cbd5e1 !important; }
              .pb-5 { padding-bottom: 1.25rem !important; }
              .mb-6 { margin-bottom: 1.5rem !important; }
              .font-extrabold { font-weight: 800 !important; }
              .text-lg { font-size: 1.125rem !important; }
              .sm\\:text-xl { font-size: 1.25rem !important; }
              .text-slate-800 { color: #1e293b !important; }
              .tracking-tight { letter-spacing: -0.025em !important; }
              .text-right { text-align: right !important; }
              .flex-col { flex-direction: column !important; }
              .items-end { align-items: flex-end !important; }
              .text-\\[10px\\] { font-size: 10px !important; }
              .text-slate-500 { color: #64748b !important; }
              .mt-1 { margin-top: 0.25rem !important; }
              .px-2\\.5 { padding-left: 0.625rem !important; padding-right: 0.625rem !important; }
              .py-0\\.5 { padding-top: 0.125rem !important; padding-bottom: 0.125rem !important; }
              .rounded-full { border-radius: 9999px !important; }
              .font-bold { font-weight: bold !important; }
              .border { border: 1px solid !important; }
              .text-emerald-600 { color: #059669 !important; }
              .bg-emerald-50\\/50 { background-color: #ecfdf5 !important; }
              .border-emerald-500 { border-color: #10b981 !important; }
              .text-amber-600 { color: #d97706 !important; }
              .bg-amber-50\\/50 { background-color: #fffbeb !important; }
              .border-amber-500 { border-color: #f59e0b !important; }
              .text-rose-600 { color: #dc2626 !important; }
              .bg-rose-50\\/50 { background-color: #fef2f2 !important; }
              .border-rose-500 { border-color: #f87171 !important; }
              .uppercase { text-transform: uppercase !important; }
              .tracking-wider { letter-spacing: 0.05em !important; }
              .text-\\[9px\\] { font-size: 9px !important; }
              .text-slate-400 { color: #94a3b8 !important; }
              .mt-1\\.5 { margin-top: 0.375rem !important; }
              .font-medium { font-weight: 500 !important; }
              .grid { display: grid !important; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
              .gap-4 { gap: 1rem !important; }
              .text-\\[11px\\] { font-size: 11px !important; }
              .text-slate-700 { color: #334155 !important; }
              .mb-5 { margin-bottom: 1.25rem !important; }
              .border-b { border-bottom: 1px solid #e2e8f0 !important; }
              .space-y-1\\.5 > * + * { margin-top: 0.375rem !important; }
              .text-slate-600 { color: #475569 !important; }
              .font-normal { font-weight: normal !important; }
              .text-center { text-align: center !important; }
              .w-\\[40\\%\\] { width: 40% !important; }
              .w-\\[24\\%\\] { width: 24% !important; }
              .w-\\[12\\%\\] { width: 12% !important; }
              .border-t-2 { border-top: 2px solid #cbd5e1 !important; }
              .pt-4 { padding-top: 1rem !important; }
              .w-full { width: 100% !important; }
              .sm\\:w-\\[50\\%\\] { width: 50% !important; }
              .space-y-2 > * + * { margin-top: 0.5rem !important; }
              .font-semibold { font-weight: 600 !important; }
              .text-success { color: #16a34a !important; }
              .border-t { border-top: 1px solid #e2e8f0 !important; }
              .pt-2 { padding-top: 0.5rem !important; }
              .text-xs { font-size: 0.75rem !important; }
              .sm\\:text-sm { font-size: 0.875rem !important; }
              .text-slate-900 { color: #0f172a !important; }
              .mt-8 { margin-top: 2rem !important; }
              .pt-6 { padding-top: 1.5rem !important; }
              .border-slate-100\\/50 { border-color: rgba(241, 245, 249, 0.5) !important; }
              .mt-12 { margin-top: 3rem !important; }
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

    const downloadReceiptImage = async () => {
      if (!invoiceDetails.value) return;
      const originalElement = document.getElementById('receipt-print-area');
      
      // Clone element to force print layout on mobile
      const clone = originalElement.cloneNode(true);
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '600px'; // standard invoice width
      container.style.background = '#ffffff';
      
      // Inject exact print styles for clone rendering
      const style = document.createElement('style');
      style.innerHTML = `
        #receipt-print-area {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #1e293b !important;
          padding: 30px !important;
          background-color: #fff !important;
          line-height: 1.5;
          width: 600px !important;
          box-sizing: border-box !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        .print-browser-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          font-size: 11px !important;
          color: #1e293b !important;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
          margin-bottom: 45px !important;
          width: 100% !important;
        }
        .print-browser-footer {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          font-size: 11px !important;
          color: #1e293b !important;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
          margin-top: 45px !important;
          width: 100% !important;
        }
        .print-hidden, .screen-only-mobile {
          display: none !important;
        }
        .overflow-x-auto {
          overflow: visible !important;
          border: none !important;
        }
        .print-only-table {
          display: table !important;
          width: 100% !important;
          min-width: 0 !important;
          border-collapse: collapse !important;
          margin-top: 20px !important;
          margin-bottom: 20px !important;
        }
        .print-only-table th {
          background-color: #f8fafc !important;
          border-bottom: 2px solid #cbd5e1 !important;
          color: #475569 !important;
          font-weight: bold !important;
          padding: 8px 10px !important;
          text-transform: uppercase !important;
          font-size: 11px !important;
          text-align: right;
        }
        .print-only-table th:first-child {
          text-align: left;
        }
        .print-only-table th.text-center {
          text-align: center;
        }
        .print-only-table td {
          padding: 10px !important;
          border-bottom: 1px dashed #cbd5e1 !important;
          color: #334155 !important;
          font-size: 12px !important;
        }
        .print-only-table tr {
          display: table-row !important;
        }
        .print-only-table th, .print-only-table td {
          display: table-cell !important;
        }
        /* Layout Utilities */
        .flex { display: flex !important; }
        .items-center { align-items: center !important; }
        .justify-between { justify-content: space-between !important; }
        .border-b-2 { border-bottom: 2px solid #cbd5e1 !important; }
        .pb-5 { padding-bottom: 1.25rem !important; }
        .mb-6 { margin-bottom: 1.5rem !important; }
        .font-extrabold { font-weight: 800 !important; }
        .text-lg { font-size: 1.125rem !important; }
        .text-slate-800 { color: #1e293b !important; }
        .tracking-tight { letter-spacing: -0.025em !important; }
        .text-right { text-align: right !important; }
        .flex-col { flex-direction: column !important; }
        .items-end { align-items: flex-end !important; }
        .text-\\[10px\\] { font-size: 10px !important; }
        .text-slate-500 { color: #64748b !important; }
        .mt-1 { margin-top: 0.25rem !important; }
        .px-2\\.5 { padding-left: 0.625rem !important; padding-right: 0.625rem !important; }
        .py-0\\.5 { padding-top: 0.125rem !important; padding-bottom: 0.125rem !important; }
        .rounded-full { border-radius: 9999px !important; }
        .font-bold { font-weight: bold !important; }
        .border { border: 1px solid !important; }
        .text-emerald-600 { color: #059669 !important; }
        .bg-emerald-50\\/50 { background-color: #ecfdf5 !important; }
        .border-emerald-500 { border-color: #10b981 !important; }
        .text-amber-600 { color: #d97706 !important; }
        .bg-amber-50\\/50 { background-color: #fffbeb !important; }
        .border-amber-500 { border-color: #f59e0b !important; }
        .text-rose-600 { color: #dc2626 !important; }
        .bg-rose-50\\/50 { background-color: #fef2f2 !important; }
        .border-rose-500 { border-color: #f87171 !important; }
        .uppercase { text-transform: uppercase !important; }
        .tracking-wider { letter-spacing: 0.05em !important; }
        .text-\\[9px\\] { font-size: 9px !important; }
        .text-slate-400 { color: #94a3b8 !important; }
        .mt-1\\.5 { margin-top: 0.375rem !important; }
        .font-medium { font-weight: 500 !important; }
        .grid { display: grid !important; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .gap-4 { gap: 1rem !important; }
        .text-\\[11px\\] { font-size: 11px !important; }
        .text-slate-700 { color: #334155 !important; }
        .mb-5 { margin-bottom: 1.25rem !important; }
        .border-b { border-bottom: 1px solid #e2e8f0 !important; }
        .space-y-1\\.5 > * + * { margin-top: 0.375rem !important; }
        .text-slate-600 { color: #475569 !important; }
        .font-normal { font-weight: normal !important; }
        .text-center { text-align: center !important; }
        .w-\\[40\\%\\] { width: 40% !important; }
        .w-\\[24\\%\\] { width: 24% !important; }
        .w-\\[12\\%\\] { width: 12% !important; }
        .border-t-2 { border-top: 2px solid #cbd5e1 !important; }
        .pt-4 { padding-top: 1rem !important; }
        .w-full { width: 100% !important; }
        .space-y-2 > * + * { margin-top: 0.5rem !important; }
        .font-semibold { font-weight: 600 !important; }
        .text-success { color: #16a34a !important; }
        .border-t { border-top: 1px solid #e2e8f0 !important; }
        .pt-2 { padding-top: 0.5rem !important; }
        .text-xs { font-size: 0.75rem !important; }
        .text-slate-900 { color: #0f172a !important; }
        .mt-8 { margin-top: 2rem !important; }
        .pt-6 { padding-top: 1.5rem !important; }
        .border-slate-100\\/50 { border-color: rgba(241, 245, 249, 0.5) !important; }
        .mt-12 { margin-top: 3rem !important; }
      `;
      container.appendChild(style);

      // Create fake browser print header
      const headerDiv = document.createElement('div');
      headerDiv.className = 'print-browser-header';
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().slice(-2)}`;
      headerDiv.innerHTML = `
        <div style="flex: 1; text-align: left;">${timeStr} ${dateStr}</div>
        <div style="flex: 2; text-align: center;">Phiếu thanh toán tiền phòng & dịch vụ - Phòng ${invoiceDetails.value.contract.room.roomNumber}</div>
        <div style="flex: 1; text-align: right;"></div>
      `;
      clone.insertBefore(headerDiv, clone.firstChild);

      // Create fake browser print footer
      const footerDiv = document.createElement('div');
      footerDiv.className = 'print-browser-footer';
      const pageUrl = window.location.href;
      footerDiv.innerHTML = `
        <div style="flex: 2; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pageUrl}</div>
        <div style="flex: 1; text-align: right;">1/1</div>
      `;
      clone.appendChild(footerDiv);

      container.appendChild(clone);
      document.body.appendChild(container);

      try {
        const html2canvasFn = html2canvas.default || html2canvas;
        const canvas = await html2canvasFn(clone, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 600,
          windowWidth: 1200,
          windowHeight: 1200
        });
        const image = canvas.toDataURL('image/png');
        const startDayStr = formatDate(invoiceDetails.value.billingPeriodStart).replace(/\//g, '-');
        const fileName = `PhieuThanhToan_Phong_${invoiceDetails.value.contract.room.roomNumber}_Ky_${startDayStr}.png`;

        // Try to share via Web Share API first (essential for iOS to save directly to Photo Gallery)
        try {
          const response = await fetch(image);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Hóa đơn tiền phòng',
              text: `Hóa đơn tiền phòng phòng ${invoiceDetails.value.contract.room.roomNumber}`
            });
            return;
          }
        } catch (shareErr) {
          console.warn('Web Share API not supported or cancelled:', shareErr);
        }

        // Fallback for desktop or unsupported browsers
        const link = document.createElement('a');
        link.download = fileName;
        link.href = image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Không thể lưu ảnh biên lai:', err);
        alert('Không thể xuất ảnh biên lai: ' + err.message);
      } finally {
        document.body.removeChild(container);
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
        contractId: '',
        invoiceDate: new Date().toISOString().substring(0, 10),
        billingPeriodStart: '',
        billingPeriodEnd: '',
        newElectricityIndex: 0,
        newWaterIndex: 0,
        excludeRoomPrice: false,
        excludeExtraFees: false,
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
      downloadReceiptImage,
      changePage,
      closeModal,
      formatMoney,
      formatDate,
    };
  },
};
