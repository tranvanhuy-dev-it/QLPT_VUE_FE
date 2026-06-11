import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import FormInput from "../../components/ui/FormInput.vue";
import FormSelect from "../../components/ui/FormSelect.vue";
import FormButton from "../../components/ui/FormButton.vue";
import AppIcon from "../../components/ui/icons/AppIcon.vue";
import { useBoardingHouseStore } from "../../stores/boardingHouse.js";
import invoiceService from "../../services/invoiceService.js";
import { useConfirmModal } from "../../composables/useConfirmModal.js";

export default {
  name: "BulkInvoices",
  components: {
    FormInput,
    FormSelect,
    FormButton,
    AppIcon,
  },
  setup() {
    const router = useRouter();
    const { showAlert } = useConfirmModal();

    const boardingHouseStore = useBoardingHouseStore();

    const toLocalYYYYMMDD = (date) => {
      const y = date.getFullYear();
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const d = date.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const parseLocalYYYYMMDD = (dateStr) => {
      if (!dateStr) return new Date();
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d);
    };

    const boardingHouses = ref([]);
    const selectedBulkBoardingHouseId = ref("");
    const bulkInvoiceDate = ref(toLocalYYYYMMDD(new Date()));
    
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const bulkBillingMonth = ref(currentYearMonth);
    
    const bulkRooms = ref([]);
    const isFetchingBulkStatus = ref(false);
    const isSavingBulk = ref(false);

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return "0";
      return Math.round(amount).toLocaleString("vi-VN");
    };

    const fetchBoardingHouses = async () => {
      try {
        await boardingHouseStore.fetchBoardingHouses();
        boardingHouses.value = boardingHouseStore.boardingHouses;
      } catch (err) {
        console.error("Không tải được danh sách dãy trọ:", err);
      }
    };

    const onBulkBoardingHouseChange = async () => {
      if (!selectedBulkBoardingHouseId.value) {
        bulkRooms.value = [];
        return;
      }
      isFetchingBulkStatus.value = true;
      try {
        const response = await invoiceService.getBillingStatus(selectedBulkBoardingHouseId.value);
        bulkRooms.value = (response.data || [])
          .filter(room => room.hasActiveContract)
          .map(room => ({
            ...room,
            newElectricityIndex: room.currentElectricityIndex,
            newWaterIndex: room.currentWaterIndex,
            billingPeriodStart: room.nextBillingPeriodStart,
            billingPeriodEnd: bulkInvoiceDate.value,
            discount: 0,
          }));
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || "Không thể tải trạng thái phòng của dãy trọ", 'danger');
      } finally {
        isFetchingBulkStatus.value = false;
      }
    };

    const adjustBulkDates = () => {
      if (bulkRooms.value.length === 0) return;
      bulkRooms.value.forEach(room => {
        room.billingPeriodEnd = bulkInvoiceDate.value;
      });
    };

    const visibleRooms = computed(() => {
      if (!bulkRooms.value || bulkRooms.value.length === 0) return [];
      if (!bulkBillingMonth.value || !bulkInvoiceDate.value) return [];

      const [year, month, day] = bulkInvoiceDate.value.split("-").map(Number);
      const lastDay = new Date(year, month, 0).getDate();

      return bulkRooms.value.filter(room => {
        // Calculate contract's billing day
        const contractStartDateObj = parseLocalYYYYMMDD(room.contractStartDate);
        const contractStartDay = contractStartDateObj.getDate();
        const targetBillingDay = room.fixedBillingDay != null ? room.fixedBillingDay : contractStartDay;
        const actualBillingDay = Math.min(targetBillingDay, lastDay);
        
        // Full billing date of selected month/year
        const billingDateOfSelectedMonth = `${year}-${month.toString().padStart(2, '0')}-${actualBillingDay.toString().padStart(2, '0')}`;
        
        // 1. Only show if selected date is on or after the billing date (tới ngày thanh toán cố định hoặc quá hạn thanh toán)
        if (bulkInvoiceDate.value < billingDateOfSelectedMonth) {
          return false;
        }

        // 2. Ensure billing period start date is not in the future relative to bulkInvoiceDate
        if (room.billingPeriodStart > bulkInvoiceDate.value) {
          return false;
        }

        // 3. Ensure they haven't already been billed in the selected month
        if (room.contractStartDate && room.billingPeriodStart === room.contractStartDate) {
          return true;
        }

        const start = parseLocalYYYYMMDD(room.billingPeriodStart);
        const lastEnd = new Date(start);
        lastEnd.setDate(lastEnd.getDate() - 1);
        
        const lastEndYear = lastEnd.getFullYear();
        const lastEndMonth = (lastEnd.getMonth() + 1).toString().padStart(2, '0');
        const lastEndYearMonth = `${lastEndYear}-${lastEndMonth}`;
        
        const hasBilledInSelectedMonth = lastEndYearMonth === bulkBillingMonth.value;
        return !hasBilledInSelectedMonth;
      });
    });

    const saveBulkInvoices = async () => {
      if (isSavingBulk.value) return;
      
      const roomsToSave = visibleRooms.value;
      if (roomsToSave.length === 0) {
        showAlert('Thông báo', "Không có phòng nào cần lập hóa đơn.", 'warning');
        return;
      }
      
      for (const room of roomsToSave) {
        if (room.newElectricityIndex < room.currentElectricityIndex) {
          showAlert(
            'Lỗi nhập liệu', 
            `Chỉ số điện mới của phòng ${room.roomNumber} (${room.newElectricityIndex}) không được nhỏ hơn chỉ số cũ (${room.currentElectricityIndex})`, 
            'warning'
          );
          return;
        }
        if (room.waterBillingType === 'BY_INDEX' && room.newWaterIndex < room.currentWaterIndex) {
          showAlert(
            'Lỗi nhập liệu', 
            `Chỉ số nước mới của phòng ${room.roomNumber} (${room.newWaterIndex}) không được nhỏ hơn chỉ số cũ (${room.currentWaterIndex})`, 
            'warning'
          );
          return;
        }
        if (!room.billingPeriodStart || !room.billingPeriodEnd) {
          showAlert(
            'Lỗi nhập liệu',
            `Phòng ${room.roomNumber} thiếu thông tin kỳ thanh toán`,
            'warning'
          );
          return;
        }
        if (new Date(room.billingPeriodStart) >= new Date(room.billingPeriodEnd)) {
          showAlert(
            'Lỗi nhập liệu',
            `Kỳ thanh toán phòng ${room.roomNumber} không hợp lệ (Ngày bắt đầu phải trước ngày kết thúc)`,
            'warning'
          );
          return;
        }
      }

      isSavingBulk.value = true;
      try {
        const payload = {
          invoiceDate: bulkInvoiceDate.value,
          readings: roomsToSave.map(room => ({
            roomId: room.roomId,
            contractId: room.contractId,
            billingPeriodStart: room.billingPeriodStart,
            billingPeriodEnd: room.billingPeriodEnd,
            newElectricityIndex: Number(room.newElectricityIndex),
            newWaterIndex: Number(room.newWaterIndex),
            discount: Number(room.discount) || 0,
          }))
        };
        await invoiceService.createBulk(payload);
        showAlert('Thành công', "Lập hóa đơn hàng loạt thành công!", 'success');
        router.push({ name: "Invoices" });
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || "Lập hóa đơn hàng loạt thất bại", 'danger');
      } finally {
        isSavingBulk.value = false;
      }
    };

    const goBack = () => {
      if (window.history.state && window.history.state.back) {
        router.back();
      } else {
        router.push({ name: "Invoices" });
      }
    };

    watch(bulkInvoiceDate, (newVal) => {
      if (!newVal) return;
      const [year, month, day] = newVal.split("-");
      bulkBillingMonth.value = `${year}-${month}`;

      if (bulkRooms.value.length > 0) {
        bulkRooms.value.forEach(room => {
          room.billingPeriodEnd = newVal;
        });
      }
    });

    watch(bulkBillingMonth, (newVal) => {
      if (!newVal) return;
      const [year, month] = newVal.split("-");
      const currentDateObj = new Date(bulkInvoiceDate.value);
      const currentDay = currentDateObj.getDate();
      const lastDay = new Date(year, month, 0).getDate();
      const targetDay = Math.min(currentDay, lastDay);
      bulkInvoiceDate.value = `${year}-${month.padStart(2, '0')}-${targetDay.toString().padStart(2, '0')}`;
    });

    onMounted(async () => {
      await fetchBoardingHouses();
      if (boardingHouses.value.length > 0) {
        selectedBulkBoardingHouseId.value = boardingHouses.value[0].id;
        await onBulkBoardingHouseChange();
      }
    });

    return {
      boardingHouses,
      selectedBulkBoardingHouseId,
      bulkInvoiceDate,
      bulkBillingMonth,
      bulkRooms,
      visibleRooms,
      isFetchingBulkStatus,
      isSavingBulk,
      onBulkBoardingHouseChange,
      adjustBulkDates,
      saveBulkInvoices,
      formatMoney,
      goBack,
    };
  },
};
