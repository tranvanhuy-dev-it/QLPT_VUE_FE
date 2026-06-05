import { ref, onMounted } from 'vue';
import Sidebar from '../../components/Sidebar.vue';
import api from '../../services/api.js';

export default {
  name: 'LandlordDashboard',
  components: {
    Sidebar,
  },
  setup() {
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
      stats,
      vacantRoomList,
      unpaidInvoiceList,
      formatMoney,
      formatDate,
    };
  },
};
