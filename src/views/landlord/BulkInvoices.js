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

    const boardingHouses = ref([]);
    const selectedBulkBoardingHouseId = ref("");
    const bulkInvoiceDate = ref(new Date().toISOString().substring(0, 10));
    
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
      if (!bulkBillingMonth.value) return [];

      return bulkRooms.value.filter(room => {
        // Ensure the billing period start date is not in the future relative to the invoice date
        const isNotFutureBilling = room.billingPeriodStart <= bulkInvoiceDate.value;
        if (!isNotFutureBilling) return false;

        // If contractStartDate matches nextBillingPeriodStart, never billed yet (always show)
        if (room.contractStartDate && room.billingPeriodStart === room.contractStartDate) {
          return true;
        }

        // If there was a previous invoice, its end date is billingPeriodStart - 1 day
        const start = new Date(room.billingPeriodStart);
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
      router.push({ name: "Invoices" });
    };

    watch(bulkInvoiceDate, () => {
      adjustBulkDates();
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
