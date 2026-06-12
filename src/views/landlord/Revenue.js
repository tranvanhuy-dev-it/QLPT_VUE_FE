import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import invoiceService from '../../services/invoiceService.js';
import boardingHouseService from '../../services/boardingHouseService.js';
import AppIcon from '../../components/ui/icons/AppIcon.vue';
import FormSelect from '../../components/ui/FormSelect.vue';
import FormInput from '../../components/ui/FormInput.vue';

export default {
  name: 'Revenue',
  components: { AppIcon, FormSelect, FormInput },
  setup() {
    const router = useRouter();

    const loading = ref(true);
    const allInvoices = ref([]);
    const allBoardingHouses = ref([]);

    const filterOption = ref('month');
    const filterStartDate = ref('');
    const filterEndDate = ref('');
    const selectedBoardingHouseId = ref('all');
    const activeTab = ref('room'); // 'room' | 'contract'
    const sortKey = ref('revenue');
    const sortDir = ref('desc');

    // Current date display
    const currentDate = computed(() => {
      const d = new Date();
      const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    });

    // ===== Date range helpers =====
    const pad = (n) => String(n).padStart(2, '0');
    const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const applyDateFilter = (val) => {
      const today = new Date();
      if (val === 'all') { filterStartDate.value = ''; filterEndDate.value = ''; return; }
      if (val === 'week') {
        const day = today.getDay();
        const monday = new Date(today); monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
        const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
        filterStartDate.value = toYMD(monday); filterEndDate.value = toYMD(sunday);
      } else if (val === 'month') {
        filterStartDate.value = toYMD(new Date(today.getFullYear(), today.getMonth(), 1));
        filterEndDate.value = toYMD(new Date(today.getFullYear(), today.getMonth() + 1, 0));
      } else if (val === 'quarter') {
        const q = Math.floor(today.getMonth() / 3);
        filterStartDate.value = toYMD(new Date(today.getFullYear(), q * 3, 1));
        filterEndDate.value = toYMD(new Date(today.getFullYear(), q * 3 + 3, 0));
      } else if (val === '6months') {
        const start = new Date(today); start.setMonth(today.getMonth() - 6);
        filterStartDate.value = toYMD(start); filterEndDate.value = toYMD(today);
      } else if (val === 'year') {
        filterStartDate.value = toYMD(new Date(today.getFullYear(), 0, 1));
        filterEndDate.value = toYMD(new Date(today.getFullYear(), 11, 31));
      }
    };

    watch(filterOption, (val) => { if (val !== 'custom') applyDateFilter(val); });

    // ===== Filtered invoices =====
    const filteredInvoices = computed(() => {
      const start = filterStartDate.value ? new Date(filterStartDate.value + 'T00:00:00') : null;
      const end = filterEndDate.value ? new Date(filterEndDate.value + 'T23:59:59') : null;
      return allInvoices.value.filter(inv => {
        const d = new Date(inv.invoiceDate);
        if (start && d < start) return false;
        if (end && d > end) return false;
        if (selectedBoardingHouseId.value !== 'all') {
          const bhId = inv.contract?.room?.boardingHouse?.id;
          if (bhId !== selectedBoardingHouseId.value) return false;
        }
        return true;
      });
    });

    // ===== Summary stats =====
    const summaryStats = computed(() => {
      const invs = filteredInvoices.value;
      const totalExpected = invs.reduce((s, i) => s + (i.totalAmount || 0), 0);
      const totalPaid = invs.reduce((s, i) => s + (i.paidAmount || 0), 0);
      const totalDebt = totalExpected - totalPaid;
      const paidCount = invs.filter(i => i.status === 'PAID').length;
      const unpaidCount = invs.filter(i => i.status !== 'PAID').length;
      return { totalExpected, totalPaid, totalDebt, paidCount, unpaidCount, total: invs.length };
    });

    const collectionRate = computed(() => {
      return summaryStats.value.totalExpected > 0
        ? Math.round((summaryStats.value.totalPaid / summaryStats.value.totalExpected) * 100)
        : 0;
    });

    const payRateColor = computed(() => {
      const r = collectionRate.value;
      return r >= 90 ? '#10b981' : r >= 60 ? '#f59e0b' : '#f43f5e';
    });

    // ===== Revenue by ROOM =====
    const revenueByRoom = computed(() => {
      const map = {};
      filteredInvoices.value.forEach(inv => {
        const room = inv.contract?.room;
        if (!room) return;
        const key = room.id || room.roomNumber;
        if (!map[key]) {
          map[key] = {
            roomId: room.id,
            roomNumber: room.roomNumber,
            boardingHouseName: room.boardingHouse?.name || '',
            tenantName: inv.contract?.tenant?.fullName || '—',
            expected: 0, paid: 0, debt: 0, invoiceCount: 0, paidCount: 0,
          };
        }
        map[key].expected += inv.totalAmount || 0;
        map[key].paid += inv.paidAmount || 0;
        map[key].debt += (inv.totalAmount - inv.paidAmount) || 0;
        map[key].invoiceCount++;
        if (inv.status === 'PAID') map[key].paidCount++;
      });
      return sortRows(Object.values(map));
    });

    // ===== Revenue by CONTRACT =====
    const revenueByContract = computed(() => {
      const map = {};
      filteredInvoices.value.forEach(inv => {
        const contract = inv.contract;
        if (!contract) return;
        const key = contract.id;
        if (!map[key]) {
          map[key] = {
            contractId: contract.id,
            roomNumber: contract.room?.roomNumber,
            boardingHouseName: contract.room?.boardingHouse?.name || '',
            tenantName: contract.tenant?.fullName || '—',
            startDate: contract.startDate,
            status: contract.status,
            expected: 0, paid: 0, debt: 0, invoiceCount: 0, paidCount: 0,
          };
        }
        map[key].expected += inv.totalAmount || 0;
        map[key].paid += inv.paidAmount || 0;
        map[key].debt += (inv.totalAmount - inv.paidAmount) || 0;
        map[key].invoiceCount++;
        if (inv.status === 'PAID') map[key].paidCount++;
      });
      return sortRows(Object.values(map));
    });

    const activeRows = computed(() => activeTab.value === 'room' ? revenueByRoom.value : revenueByContract.value);

    const sortRows = (rows) => {
      const key = sortKey.value === 'revenue' ? 'paid'
        : sortKey.value === 'expected' ? 'expected'
        : 'debt';
      return [...rows].sort((a, b) => sortDir.value === 'desc' ? b[key] - a[key] : a[key] - b[key]);
    };

    const setSort = (key) => {
      if (sortKey.value === key) { sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'; }
      else { sortKey.value = key; sortDir.value = 'desc'; }
    };

    // ===== Monthly chart data =====
    const monthlyChartData = computed(() => {
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth(), label: `T${d.getMonth() + 1}`, expected: 0, paid: 0 });
      }
      filteredInvoices.value.forEach(inv => {
        const d = new Date(inv.invoiceDate);
        const m = months.find(x => x.year === d.getFullYear() && x.month === d.getMonth());
        if (m) { m.expected += inv.totalAmount || 0; m.paid += inv.paidAmount || 0; }
      });
      const maxVal = Math.max(...months.map(m => m.expected), 1);
      return months.map(m => ({
        ...m,
        expectedPct: Math.round((m.expected / maxVal) * 100),
        paidPct: Math.round((m.paid / maxVal) * 100),
      }));
    });

    // ===== Helpers =====
    const formatMoney = (n) => {
      if (!n && n !== 0) return '0';
      return Math.round(n).toLocaleString('vi-VN');
    };

    // Rút gọn số tiền cho mobile: 1.500.000 → 1,5tr
    const formatMoneyShort = (n) => {
      if (!n && n !== 0) return '0';
      n = Math.round(n);
      if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace('.0', '') + ' tỷ';
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'tr';
      if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
      return n.toString();
    };

    const formatDate = (s) => {
      if (!s) return '—';
      const d = new Date(s);
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    };

    const payRate = (row) => row.expected > 0 ? Math.round((row.paid / row.expected) * 100) : 0;
    const payRateClass = (rate) => rate >= 90 ? 'text-emerald-600' : rate >= 60 ? 'text-amber-500' : 'text-rose-500';

    const goToContract = (id) => router.push(`/landlord/contracts/${id}`);

    const load = async () => {
      loading.value = true;
      try {
        const [invRes, bhRes] = await Promise.all([
          invoiceService.getAll({ size: 500 }),
          boardingHouseService.getAll({ size: 100 }),
        ]);
        allInvoices.value = invRes.data.content || [];
        allBoardingHouses.value = bhRes.data.content || [];
      } catch (e) {
        console.error('Lỗi tải dữ liệu doanh thu:', e);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      applyDateFilter('month');
      load();
    });

    return {
      loading,
      currentDate,
      filterOption,
      filterStartDate,
      filterEndDate,
      selectedBoardingHouseId,
      activeTab,
      sortKey,
      sortDir,
      summaryStats,
      collectionRate,
      payRateColor,
      activeRows,
      allBoardingHouses,
      monthlyChartData,
      formatMoney,
      formatMoneyShort,
      formatDate,
      payRate,
      payRateClass,
      setSort,
      goToContract,
    };
  },
};
