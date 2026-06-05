import { ref, onMounted } from 'vue';
import PageHeader from '../../components/PageHeader.vue';
import api from '../../services/api.js';

export default {
  name: 'LandlordDashboard',
  components: {
    PageHeader,
  },
  setup() {
    const dashboardIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>`;

    const stats = ref({
      boardingHousesCount: 0,
      roomsCount: 0,
      occupiedRooms: 0,
      vacantRooms: 0,
      activeContracts: 0,
      unpaidInvoicesCount: 0,
      unpaidAmount: 0,
    });

    const vacantRoomList = ref([]);
    const unpaidInvoiceList = ref([]);

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    const loadDashboardData = async () => {
      try {
        // Tải danh sách Dãy trọ
        const bhRes = await api.get('/api/rooms/boarding-houses', { params: { size: 100 } });
        stats.value.boardingHousesCount = bhRes.data.totalElements || bhRes.data.content?.length || 0;

        // Tải danh sách Phòng trọ
        const roomsRes = await api.get('/api/rooms', { params: { size: 200 } });
        const rooms = roomsRes.data.content || [];
        stats.value.roomsCount = rooms.length;
        stats.value.occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
        stats.value.vacantRooms = rooms.filter(r => r.status === 'VACANT').length;
        vacantRoomList.value = rooms.filter(r => r.status === 'VACANT').slice(0, 5);

        // Tải danh sách Hợp đồng
        const contractsRes = await api.get('/api/contracts', { params: { size: 200 } });
        const contracts = contractsRes.data.content || [];
        stats.value.activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;

        // Tải danh sách Hóa đơn
        const invoicesRes = await api.get('/api/invoices', { params: { size: 200 } });
        const invoices = invoicesRes.data.content || [];
        
        const unpaid = invoices.filter(i => i.status !== 'PAID');
        stats.value.unpaidInvoicesCount = unpaid.length;
        stats.value.unpaidAmount = unpaid.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
        unpaidInvoiceList.value = unpaid.slice(0, 5);

      } catch (err) {
        console.error('Không thể tải dữ liệu thống kê tổng quan:', err);
      }
    };

    onMounted(() => {
      loadDashboardData();
    });

    return {
      dashboardIcon,
      stats,
      vacantRoomList,
      unpaidInvoiceList,
      formatMoney,
      formatDate,
    };
  },
};
