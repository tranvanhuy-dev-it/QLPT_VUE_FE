import { ref, computed, onMounted, watch } from "vue";
import taxService from "../../services/taxService.js";
import boardingHouseService from "../../services/boardingHouseService.js";
import FormSelect from "../../components/ui/FormSelect.vue";
import FormInput from "../../components/ui/FormInput.vue";

export default {
  name: "TaxDeclaration",
  components: { FormSelect, FormInput },
  setup() {
    const loading = ref(true);
    const calculating = ref(false);
    const submitting = ref(false);
    const exportingExcel = ref(false);
    const savingConfig = ref(false);

    // Filter and Settings State
    const allBoardingHouses = ref([]);
    const selectedBoardingHouseId = ref("all");

    const currentYear = new Date().getFullYear();
    const year = ref(currentYear);
    const periodType = ref("MONTH"); // 'MONTH' | 'QUARTER' | 'YEAR'

    const currentMonth = new Date().getMonth() + 1;
    const periodValue = ref(currentMonth);

    // Tax Settings State
    const showConfig = ref(false);
    const config = ref({
      annualThreshold: 500000000,
      vatRate: 5,
      pitRate: 5,
    });

    // Preview and History State
    const preview = ref(null);
    const declarations = ref([]);
    const showReceipt = ref(false);
    const receipt = ref(null);

    // Toast Alert State
    const toast = ref({
      show: false,
      type: "success",
      message: "",
    });

    const showToast = (message, type = "success") => {
      toast.value.message = message;
      toast.value.type = type;
      toast.value.show = true;
      setTimeout(() => {
        toast.value.show = false;
      }, 4000);
    };

    // Date displays and Roman conversion
    const currentDate = computed(() => {
      const d = new Date();
      const days = [
        "Chủ nhật",
        "Thứ 2",
        "Thứ 3",
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
      ];
      return `${days[d.getDay()]}, ${String(d.getDate()).padStart(
        2,
        "0",
      )}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    });

    const quarters = [
      { value: 1, label: "Quý I" },
      { value: 2, label: "Quý II" },
      { value: 3, label: "Quý III" },
      { value: 4, label: "Quý IV" },
    ];

    const months = Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: `Tháng ${i + 1}`,
    }));

    const years = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i);

    // Watchers to auto-adjust period values
    watch(periodType, (newType) => {
      if (newType === "MONTH") {
        periodValue.value = currentMonth;
      } else if (newType === "QUARTER") {
        periodValue.value = Math.floor((currentMonth - 1) / 3) + 1;
      } else {
        periodValue.value = 0;
      }
      calculatePreview();
    });

    watch([selectedBoardingHouseId, year, periodValue], () => {
      calculatePreview();
    });

    // Money formatter
    const formatMoney = (n) => {
      if (!n && n !== 0) return "0";
      return Math.round(n).toLocaleString("vi-VN");
    };

    // Format LocalDateTime string
    const formatDate = (s) => {
      if (!s) return "—";
      const d = new Date(s);
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(d.getDate())}/${pad(
        d.getMonth() + 1,
      )}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // Date range helpers for Excel export
    const getPeriodDateRange = () => {
      const y = year.value;
      const t = periodType.value;
      const v = periodValue.value;
      let startDateStr = "";
      let endDateStr = "";

      const pad = (n) => String(n).padStart(2, "0");

      if (t === "MONTH") {
        startDateStr = `${y}-${pad(v)}-01`;
        const lastDay = new Date(y, v, 0).getDate();
        endDateStr = `${y}-${pad(v)}-${pad(lastDay)}`;
      } else if (t === "QUARTER") {
        const startMonth = (v - 1) * 3 + 1;
        startDateStr = `${y}-${pad(startMonth)}-01`;
        const endMonth = startMonth + 2;
        const lastDay = new Date(y, endMonth, 0).getDate();
        endDateStr = `${y}-${pad(endMonth)}-${pad(lastDay)}`;
      } else {
        startDateStr = `${y}-01-01`;
        endDateStr = `${y}-12-31`;
      }

      return { startDate: startDateStr, endDate: endDateStr };
    };

    // Calculate Preview
    const calculatePreview = async () => {
      calculating.value = true;
      try {
        const payload = {
          year: year.value,
          periodType: periodType.value,
          periodValue: periodValue.value,
          boardingHouseId:
            selectedBoardingHouseId.value === "all"
              ? null
              : selectedBoardingHouseId.value,
        };
        const res = await taxService.calculateTax(payload);
        preview.value = res.data;
      } catch (err) {
        console.error("Lỗi tính toán xem trước thuế:", err);
        showToast("Không thể tính toán dữ liệu thuế cho kỳ này.", "danger");
      } finally {
        calculating.value = false;
      }
    };

    // Update Tax Configuration
    const saveConfig = async () => {
      savingConfig.value = true;
      try {
        const payload = {
          annualThreshold: config.value.annualThreshold,
          vatRate: config.value.vatRate,
          pitRate: config.value.pitRate,
        };
        await taxService.updateSetting(payload);
        showToast("Cấu hình biểu thuế đã được cập nhật thành công!");
        showConfig.value = false;
        calculatePreview();
      } catch (err) {
        console.error("Lỗi lưu cấu hình thuế:", err);
        showToast(
          "Cập nhật cấu hình thất bại. Vui lòng kiểm tra lại.",
          "danger",
        );
      } finally {
        savingConfig.value = false;
      }
    };

    // Submit Declaration
    const submitDeclaration = async () => {
      submitting.value = true;
      try {
        const payload = {
          year: year.value,
          periodType: periodType.value,
          periodValue: periodValue.value,
          boardingHouseId:
            selectedBoardingHouseId.value === "all"
              ? null
              : selectedBoardingHouseId.value,
        };
        const res = await taxService.declareTax(payload);
        receipt.value = res.data;
        showReceipt.value = true;
        showToast("Tờ khai thuế đã được tiếp nhận và xử lý!");
        // Reload history declarations
        loadHistory();
      } catch (err) {
        console.error("Lỗi nộp tờ khai thuế:", err);
        const errMsg =
          err.response?.data?.message ||
          "Nộp tờ khai thuế thất bại. Kỳ này đã được nộp hoặc xảy ra lỗi.";
        showToast(errMsg, "danger");
      } finally {
        submitting.value = false;
      }
    };

    // Export Excel
    const handleExportExcel = async () => {
      exportingExcel.value = true;
      try {
        const { startDate, endDate } = getPeriodDateRange();
        const params = {
          startDate,
          endDate,
          boardingHouseId:
            selectedBoardingHouseId.value === "all"
              ? null
              : selectedBoardingHouseId.value,
        };
        const res = await taxService.exportExcel(params);

        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        let filename = `bao_cao_doanh_thu_${startDate}_den_${endDate}.xlsx`;
        if (selectedBoardingHouseId.value !== "all") {
          const bh = allBoardingHouses.value.find(
            (x) => x.id === selectedBoardingHouseId.value,
          );
          if (bh) {
            filename = `bao_cao_doanh_thu_${bh.name.replace(
              /\s+/g,
              "_",
            )}_${startDate}_den_${endDate}.xlsx`;
          }
        }

        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast("Xuất báo cáo Excel thành công!");
      } catch (err) {
        console.error("Lỗi xuất Excel:", err);
        let errMsg = "Xuấtt báo cáo Excel thất bại.";
        if (err.response?.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const json = JSON.parse(text);
            if (json.message) {
              errMsg = `Xuất Excel thất bại: ${json.message}`;
            }
          } catch (e) {
            console.error("Không thể đọc chi tiết lỗi từ Blob:", e);
          }
        } else if (err.response?.data?.message) {
          errMsg = `Xuất Excel thất bại: ${err.response.data.message}`;
        }
        showToast(errMsg, "danger");
      } finally {
        exportingExcel.value = false;
      }
    };

    // Load History Declarations
    const loadHistory = async () => {
      try {
        const res = await taxService.getDeclarations();
        declarations.value = res.data;
      } catch (err) {
        console.error("Lỗi tải lịch sử tờ khai:", err);
      }
    };

    // Load Initial Data
    const load = async () => {
      loading.value = true;
      try {
        // Fetch boarding houses, config and history
        const [bhRes, configRes] = await Promise.all([
          boardingHouseService.getAll({ size: 100 }),
          taxService.getSetting(),
          loadHistory(),
        ]);
        allBoardingHouses.value = bhRes.data.content || [];

        if (configRes.data) {
          config.value = {
            annualThreshold: configRes.data.annualThreshold,
            vatRate: configRes.data.vatRate,
            pitRate: configRes.data.pitRate,
          };
        }

        // Compute preview
        await calculatePreview();
      } catch (err) {
        console.error("Lỗi tải dữ liệu khởi tạo:", err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      load();
    });

    return {
      loading,
      calculating,
      submitting,
      exportingExcel,
      savingConfig,
      allBoardingHouses,
      selectedBoardingHouseId,
      year,
      periodType,
      periodValue,
      quarters,
      months,
      years,
      config,
      showConfig,
      preview,
      declarations,
      showReceipt,
      receipt,
      toast,
      currentDate,
      formatMoney,
      formatDate,
      saveConfig,
      calculatePreview,
      submitDeclaration,
      handleExportExcel,
    };
  },
};
