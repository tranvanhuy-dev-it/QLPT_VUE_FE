import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import boardingHouseService from '../../services/boardingHouseService.js';
import roomService from '../../services/roomService.js';
import contractService from '../../services/contractService.js';
import invoiceService from '../../services/invoiceService.js';

import FormInput from '../../components/ui/FormInput.vue';
import FormButton from '../../components/ui/FormButton.vue';
import AppIcon from '../../components/ui/icons/AppIcon.vue';

export default {
  name: 'LandlordDashboard',
  components: {
    FormInput,
    FormButton,
    AppIcon,
  },
  setup() {
    const router = useRouter();

    const currentDate = computed(() => {
      const d = new Date();
      const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    });

    const greeting = computed(() => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Chào buổi sáng,';
      if (hour < 18) return 'Chào buổi chiều,';
      return 'Chào buổi tối,';
    });

    const loading = ref(true);
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
    const upcomingBillingContracts = ref([]);
    const allInvoicesList = ref([]);

    const filterStartDate = ref('');
    const filterEndDate = ref('');

    const revenueStats = computed(() => {
      const start = filterStartDate.value ? new Date(filterStartDate.value) : null;
      if (start) start.setHours(0, 0, 0, 0);
      const end = filterEndDate.value ? new Date(filterEndDate.value) : null;
      if (end) end.setHours(23, 59, 59, 999);
      return calculateStats(start, end);
    });

    const calculateStats = (start, end) => {
      let expected = 0;
      let actual = 0;
      let debt = 0;
      let count = 0;

      allInvoicesList.value.forEach(inv => {
        const invDate = new Date(inv.invoiceDate);
        if ((!start || invDate >= start) && (!end || invDate <= end)) {
          expected += inv.totalAmount || 0;
          actual += inv.paidAmount || 0;
          debt += (inv.totalAmount - inv.paidAmount) || 0;
          count++;
        }
      });

      return { expected, actual, debt, count };
    };

    const filteredUnpaidInvoices = computed(() => {
      const start = filterStartDate.value ? new Date(filterStartDate.value) : null;
      if (start) start.setHours(0, 0, 0, 0);
      const end = filterEndDate.value ? new Date(filterEndDate.value) : null;
      if (end) end.setHours(23, 59, 59, 999);

      return allInvoicesList.value.filter(inv => {
        if (inv.status === 'PAID') return false;
        const invDate = new Date(inv.invoiceDate);
        return (!start || invDate >= start) && (!end || invDate <= end);
      }).slice(0, 5);
    });

    const occupancyRate = computed(() => {
      return stats.value.roomsCount > 0 
        ? Math.round((stats.value.occupiedRooms / stats.value.roomsCount) * 100) 
        : 0;
    });

    const occupancyCircleDashoffset = computed(() => {
      const circ = 2 * Math.PI * 36; // 226.19
      return circ - (circ * occupancyRate.value) / 100;
    });

    const monthlyRevenueData = computed(() => {
      if (allInvoicesList.value.length === 0) return [];
      
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          year: d.getFullYear(),
          month: d.getMonth(),
          label: `${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`,
          expected: 0,
          actual: 0
        });
      }
      
      allInvoicesList.value.forEach(inv => {
        const invDate = new Date(inv.invoiceDate);
        const invYear = invDate.getFullYear();
        const invMonth = invDate.getMonth();
        
        const mData = months.find(m => m.year === invYear && m.month === invMonth);
        if (mData) {
          mData.expected += inv.totalAmount || 0;
          mData.actual += inv.paidAmount || 0;
        }
      });
      
      const maxVal = Math.max(...months.map(m => m.expected), 100000);
      
      return months.map(m => {
        const expectedHeightPct = Math.round((m.expected / maxVal) * 110); // max 110px in SVG
        const actualHeightPct = Math.round((m.actual / maxVal) * 110);
        return {
          ...m,
          expectedHeightPct,
          actualHeightPct
        };
      });
    });

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    };

    const formatFullDate = (dateString) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const formatDueStatus = (diffDays) => {
      if (diffDays < 0) {
        return `Quá hạn ${Math.abs(diffDays)} ngày`;
      } else if (diffDays === 0) {
        return 'Hôm nay';
      } else {
        return `Còn ${diffDays} ngày`;
      }
    };

    const getDueStatusClass = (diffDays) => {
      if (diffDays < 0) {
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50';
      } else if (diffDays === 0) {
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50';
      } else {
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50';
      }
    };

    const navigateTo = (path) => {
      router.push(path);
    };

    const loadDashboardData = async () => {
      loading.value = true;
      try {
        const [bhRes, roomsRes, contractsRes, invoicesRes] = await Promise.all([
          boardingHouseService.getAll({ size: 100 }),
          roomService.getAll({ size: 200 }),
          contractService.getAll({ size: 200 }),
          invoiceService.getAll({ size: 200 })
        ]);

        // Tải danh sách Dãy trọ
        stats.value.boardingHousesCount = bhRes.data.totalElements || bhRes.data.content?.length || 0;

        // Tải danh sách Phòng trọ
        const rooms = roomsRes.data.content || [];
        stats.value.roomsCount = rooms.length;
        stats.value.occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
        stats.value.vacantRooms = rooms.filter(r => r.status === 'VACANT').length;
        vacantRoomList.value = rooms.filter(r => r.status === 'VACANT').slice(0, 5);

        // Tải danh sách Hợp đồng
        const contracts = contractsRes.data.content || [];
        stats.value.activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;

        // Tải danh sách Hóa đơn
        const invoices = invoicesRes.data.content || [];
        allInvoicesList.value = invoices;
        
        const unpaid = invoices.filter(i => i.status !== 'PAID');
        stats.value.unpaidInvoicesCount = unpaid.length;
        stats.value.unpaidAmount = unpaid.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
        unpaidInvoiceList.value = unpaid.slice(0, 5);

        // Tính toán danh sách hợp đồng đến hạn tạo hóa đơn
        const activeContractsList = contracts.filter(c => c.status === 'ACTIVE');
        const upcoming = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const contract of activeContractsList) {
          const contractInvoices = invoices.filter(i => i.contract?.id === contract.id);
          const timing = contract.room?.boardingHouse?.billingTiming || 'PREPAID';
          
          let dueDate;

          if (contractInvoices.length > 0) {
            // Sắp xếp hóa đơn theo ngày kết thúc kỳ thanh toán giảm dần
            const sortedInvoices = [...contractInvoices].sort((a, b) => new Date(b.billingPeriodEnd) - new Date(a.billingPeriodEnd));
            const lastEnd = new Date(sortedInvoices[0].billingPeriodEnd);
            
            if (timing === 'PREPAID') {
              dueDate = new Date(lastEnd);
            } else {
              const end = new Date(lastEnd);
              end.setMonth(end.getMonth() + 1);
              dueDate = end;
            }
          } else {
            // Chưa từng lập hóa đơn nào
            const start = new Date(contract.startDate);
            if (timing === 'PREPAID') {
              dueDate = start;
            } else {
              const end = new Date(start);
              end.setMonth(end.getMonth() + 1);
              dueDate = end;
            }
          }

          dueDate.setHours(0, 0, 0, 0);
          
          const diffTime = dueDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Hợp đồng quá hạn nếu ngày đến hạn đã qua (quá hạn)
          if (diffDays < 0) {
            upcoming.push({
              id: contract.id,
              roomNumber: contract.room?.roomNumber,
              boardingHouseName: contract.room?.boardingHouse?.name,
              tenantName: contract.tenant?.fullName,
              dueDate: dueDate.toISOString(),
              diffDays: diffDays
            });
          }
        }

        // Sắp xếp các hợp đồng quá hạn: quá hạn nhiều nhất lên trước
        upcomingBillingContracts.value = upcoming.sort((a, b) => a.diffDays - b.diffDays);

      } catch (err) {
        console.error('Không thể tải dữ liệu thống kê tổng quan:', err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadDashboardData();
    });

    return {
      currentDate,
      greeting,
      loading,
      stats,
      vacantRoomList,
      unpaidInvoiceList,
      upcomingBillingContracts,
      occupancyRate,
      formatMoney,
      formatDate,
      formatFullDate,
      formatDueStatus,
      getDueStatusClass,
      navigateTo,
      filterStartDate,
      filterEndDate,
      revenueStats,
      filteredUnpaidInvoices,
      monthlyRevenueData,
      occupancyCircleDashoffset,
    };
  },
};
