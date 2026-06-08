import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useContractStore } from '../../stores/contract.js';
import FormButton from '../../components/FormButton.vue';
import FormInput from '../../components/FormInput.vue';
import FormSelect from '../../components/FormSelect.vue';
import Checkbox from '../../components/Checkbox.vue';
import Modal from '../../components/Modal.vue';
import contractService from '../../services/contractService.js';

export default {
  name: 'ContractDetail',
  components: {
    FormButton,
    FormInput,
    FormSelect,
    Checkbox,
    Modal,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const contractStore = useContractStore();

    const contract = computed(() => contractStore.currentContract);
    const extraFees = computed(() => contractStore.currentExtraFees);
    const loading = computed(() => contractStore.loading);
    const isEditMode = ref(false);
    const numberOfTenants = ref(1);
    const saving = ref(false);
    const activeTab = ref('summary'); // 'summary' or 'contract'
    const showPreviewModal = ref(false);

    // Addendum state
    const addendums = ref([]);
    const loadingAddendums = ref(false);
    const showAddendumModal = ref(false);
    const savingAddendum = ref(false);
    const availableExtraFees = ref([]);

    // Addendum print state
    const selectedAddendum = ref(null);
    const selectedAddendumNum = ref(0);
    const showPrintAddendumModal = ref(false);

    const addendumForm = ref({
      startDate: new Date().toISOString().substring(0, 10),
      roomPrice: 0,
      electricityRate: 0,
      waterRate: 0,
      waterBillingType: 'BY_INDEX',
      numberOfTenants: 1,
      description: '',
    });

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const printContract = () => {
      const printElement = document.getElementById("contract-print-area");
      if (!printElement) return;
      const printContent = printElement.innerHTML;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Hợp đồng thuê phòng trọ - Phòng ${contract.value?.room?.roomNumber}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
              body {
                font-family: 'Lora', 'Times New Roman', Times, serif;
                color: #000;
                background-color: #fff;
                line-height: 1.25;
                padding: 6mm 12mm 5mm 12mm;
                margin: 0;
                font-size: 12px !important;
              }
              @page {
                size: A4;
                margin: 0;
              }
              h3 {
                font-size: 15px !important;
                margin-top: 5px !important;
                margin-bottom: 5px !important;
              }
              h4 {
                font-size: 12px !important;
              }
              h5 {
                font-size: 11px !important;
              }
              .text-center { text-align: center !important; }
              .text-justify { text-align: justify !important; }
              .font-bold { font-weight: bold !important; }
              .font-semibold { font-weight: 600 !important; }
              .uppercase { text-transform: uppercase !important; }
              .tracking-widest { letter-spacing: 0.1em !important; }
              .tracking-wide { letter-spacing: 0.05em !important; }
              .my-8 { margin-top: 5px !important; margin-bottom: 5px !important; }
              .mb-6 { margin-bottom: 0.3rem !important; }
              .mb-1 { margin-bottom: 0.1rem !important; }
              .mt-1 { margin-top: 0.1rem !important; }
              .mt-2 { margin-top: 0.2rem !important; }
              .mt-8 { margin-top: 0.6rem !important; }
              .mt-12 { margin-top: 1rem !important; }
              .pb-8 { padding-bottom: 0.4rem !important; }
              .pt-4 { padding-top: 0.25rem !important; }
              .pt-2 { padding-top: 0.12rem !important; }
              .space-y-4 > * + * { margin-top: 0.35rem !important; }
              .space-y-1 > * + * { margin-top: 0.1rem !important; }
              .space-y-0\\.5 > * + * { margin-top: 0.05rem !important; }
              .grid { display: grid !important; }
              .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
              .gap-2 { gap: 0.15rem !important; }
              .pl-4 { padding-left: 0.75rem !important; }
              .pl-5 { padding-left: 1rem !important; }
              .list-none { list-style-type: none !important; }
              .border-t { border-top: 1px solid #cbd5e1 !important; }
              .border-dashed { border-style: dashed !important; }
              .border-border-main\\/50 { border-color: rgba(226, 232, 240, 0.5) !important; }
              .text-xs { font-size: 12px !important; }
              .text-\\[10px\\] { font-size: 9.5px !important; }
              .italic { font-style: italic !important; }
              .block { display: block !important; }
              .mt-0\\.5 { margin-top: 0.08rem !important; }
              .mb-16 { margin-bottom: 1.25rem !important; }
              
              /* Signature section formatting */
              .signature-section {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
                width: 100% !important;
                margin-top: 1rem !important;
                page-break-inside: avoid !important;
              }
              .signature-section > div {
                width: 45% !important;
                min-width: 45% !important;
                text-align: center !important;
                display: block !important;
              }
              
              /* Force grid double columns inside print */
              .grid-cols-1.sm\\:grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              .sm\\:col-span-2 {
                grid-column: span 2 / span 2 !important;
              }
            </style>
          </head>
          <body>
            <div class="print-contract-container">
              ${printContent}
            </div>
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

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const d = new Date(dateString);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const formatWaterBillingType = (type) => {
      switch (type) {
        case 'BY_INDEX': return 'Theo chỉ số (đ/m³)';
        case 'FIXED_PER_PERSON': return 'Theo đầu người (đ/người)';
        default: return type;
      }
    };

    const fetchContractDetail = async () => {
      try {
        const contractId = route.params.id;
        const res = await contractStore.fetchContractDetail(contractId);
        numberOfTenants.value = res.contract.numberOfTenants;

        // Automatically toggle edit mode if queried
        if (route.query.edit === 'true') {
          isEditMode.value = true;
          activeTab.value = 'summary';
        }

        // Fetch addendums
        await fetchAddendums();
      } catch (err) {
        alert(err.response?.data?.error || 'Không thể tải thông tin chi tiết hợp đồng');
        router.push({ name: 'Contracts' });
      }
    };

    const fetchAddendums = async () => {
      try {
        loadingAddendums.value = true;
        const contractId = route.params.id;
        const res = await contractService.getAddendums(contractId);
        addendums.value = res.data || [];
      } catch (err) {
        console.error('Không tải được danh sách phụ lục:', err);
      } finally {
        loadingAddendums.value = false;
      }
    };

    const openAddendumModal = async () => {
      if (!contract.value) return;
      // Pre-fill with latest addendum values or contract defaults
      const latest = addendums.value.length > 0 ? addendums.value[0] : null;
      const bh = contract.value.room.boardingHouse;

      addendumForm.value = {
        startDate: new Date().toISOString().substring(0, 10),
        roomPrice: latest ? latest.roomPrice : contract.value.contractedRoomPrice,
        electricityRate: latest ? latest.electricityRate : bh.defaultElectricityRate,
        waterRate: latest ? latest.waterRate : bh.defaultWaterRate,
        waterBillingType: latest ? latest.waterBillingType : bh.waterBillingType,
        numberOfTenants: latest ? latest.numberOfTenants : contract.value.numberOfTenants,
        description: '',
      };

      // Load extra fees from boarding house
      try {
        const response = await contractService.getBoardingHouseExtraFees(bh.id);
        const latestFees = latest?.extraFees || [];
        availableExtraFees.value = (response.data || []).map(ef => {
          const matched = latestFees.find(lf => lf.extraFee?.id === ef.id);
          return {
            ...ef,
            selected: !!matched || latestFees.length === 0,
            customPrice: matched ? matched.customPrice : ef.defaultPrice,
          };
        });
      } catch (err) {
        console.error('Không tải được dịch vụ dãy trọ:', err);
        availableExtraFees.value = [];
      }

      showAddendumModal.value = true;
    };

    const saveAddendum = async () => {
      savingAddendum.value = true;
      try {
        const extraFeesPayload = availableExtraFees.value
          .filter(ef => ef.selected)
          .map(ef => ({
            extraFeeId: ef.id,
            customPrice: ef.customPrice,
          }));

        const payload = {
          ...addendumForm.value,
          extraFees: extraFeesPayload,
        };

        await contractService.createAddendum(contract.value.id, payload);
        showAddendumModal.value = false;
        alert('Thêm phụ lục hợp đồng thành công!');
        // Reload contract details and addendums
        await fetchContractDetail();
      } catch (err) {
        alert(err.response?.data?.error || 'Thêm phụ lục hợp đồng thất bại');
      } finally {
        savingAddendum.value = false;
      }
    };

    const openPrintAddendumModal = (addendum, num) => {
      selectedAddendum.value = addendum;
      selectedAddendumNum.value = num;
      showPrintAddendumModal.value = true;
    };

    const printAddendum = () => {
      const printElement = document.getElementById("addendum-print-area");
      if (!printElement) return;
      const printContent = printElement.innerHTML;
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Phụ lục hợp đồng thuê phòng - Phòng ${contract.value?.room?.roomNumber}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
              body {
                font-family: 'Lora', 'Times New Roman', Times, serif;
                color: #000;
                background-color: #fff;
                line-height: 1.25;
                padding: 6mm 12mm 5mm 12mm;
                margin: 0;
                font-size: 12px !important;
              }
              @page {
                size: A4;
                margin: 0;
              }
              h3 {
                font-size: 15px !important;
                margin-top: 5px !important;
                margin-bottom: 5px !important;
              }
              h4 {
                font-size: 12px !important;
              }
              h5 {
                font-size: 11px !important;
              }
              .text-center { text-align: center !important; }
              .text-justify { text-align: justify !important; }
              .font-bold { font-weight: bold !important; }
              .font-semibold { font-weight: 600 !important; }
              .uppercase { text-transform: uppercase !important; }
              .tracking-widest { letter-spacing: 0.1em !important; }
              .tracking-wide { letter-spacing: 0.05em !important; }
              .my-8 { margin-top: 5px !important; margin-bottom: 5px !important; }
              .mb-6 { margin-bottom: 0.3rem !important; }
              .mb-1 { margin-bottom: 0.1rem !important; }
              .mt-1 { margin-top: 0.1rem !important; }
              .mt-2 { margin-top: 0.2rem !important; }
              .mt-8 { margin-top: 0.6rem !important; }
              .mt-12 { margin-top: 1rem !important; }
              .pb-8 { padding-bottom: 0.4rem !important; }
              .pt-4 { padding-top: 0.25rem !important; }
              .pt-2 { padding-top: 0.12rem !important; }
              .space-y-4 > * + * { margin-top: 0.35rem !important; }
              .space-y-1 > * + * { margin-top: 0.1rem !important; }
              .space-y-0\\.5 > * + * { margin-top: 0.05rem !important; }
              .grid { display: grid !important; }
              .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
              .gap-2 { gap: 0.15rem !important; }
              .pl-4 { padding-left: 0.75rem !important; }
              .pl-5 { padding-left: 1rem !important; }
              .list-none { list-style-type: none !important; }
              .border-t { border-top: 1px solid #cbd5e1 !important; }
              .border-dashed { border-style: dashed !important; }
              .border-border-main\\/50 { border-color: rgba(226, 232, 240, 0.5) !important; }
              .text-xs { font-size: 12px !important; }
              .text-\\[10px\\] { font-size: 9.5px !important; }
              .italic { font-style: italic !important; }
              .block { display: block !important; }
              .mt-0\\.5 { margin-top: 0.08rem !important; }
              .mb-16 { margin-bottom: 1.25rem !important; }
              
              /* Signature section formatting */
              .signature-section {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                justify-content: space-between !important;
                align-items: flex-start !important;
                width: 100% !important;
                margin-top: 1rem !important;
                page-break-inside: avoid !important;
              }
              .signature-section > div {
                width: 45% !important;
                min-width: 45% !important;
                text-align: center !important;
                display: block !important;
                color: #000 !important;
              }
              
              /* Force grid double columns inside print */
              .grid-cols-1.sm\\:grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              .sm\\:col-span-2 {
                grid-column: span 2 / span 2 !important;
              }
            </style>
          </head>
          <body>
            <div class="print-contract-container">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };

    const toggleEditMode = () => {
      if (isEditMode.value) {
        // Cancel: reset number of tenants
        numberOfTenants.value = contract.value.numberOfTenants;
        isEditMode.value = false;
      } else {
        isEditMode.value = true;
      }
    };

    const submitEdit = async () => {
      if (numberOfTenants.value < 1) {
        alert('Số người ở phải từ 1 người trở lên.');
        return;
      }

      if (contract.value && numberOfTenants.value > contract.value.room.maxPeople) {
        alert(`Số người ở không được vượt quá sức chứa tối đa của phòng (${contract.value.room.maxPeople} người).`);
        return;
      }

      saving.value = true;
      try {
        await contractStore.updateContract(contract.value.id, {
          numberOfTenants: numberOfTenants.value
        });
        alert('Cập nhật số người ở thành công!');
        isEditMode.value = false;
      } catch (err) {
        alert(err.response?.data?.error || 'Cập nhật số người ở thất bại');
      } finally {
        saving.value = false;
      }
    };

    const goBack = () => {
      if (window.history.state && window.history.state.back) {
        router.back();
      } else {
        router.push({ name: 'Contracts' });
      }
    };

    const terminateContract = async () => {
      if (confirm('Bạn có chắc chắn muốn thanh lý hợp đồng này ngay bây giờ? Phòng trọ sẽ chuyển sang trạng thái trống.')) {
        try {
          await contractStore.terminateContract(contract.value.id);
          alert('Đã thanh lý hợp đồng thành công!');
          await fetchContractDetail();
        } catch (err) {
          alert(err.response?.data?.error || 'Thanh lý hợp đồng thất bại');
        }
      }
    };

    onMounted(() => {
      fetchContractDetail();
    });

    const docTienBangChu = (soTien) => {
      if (soTien === undefined || soTien === null || isNaN(soTien)) return '';
      soTien = Math.round(soTien);
      if (soTien === 0) return 'Không';

      const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
      const donVi = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

      const docBlock = (number, showZero) => {
        let tram = Math.floor(number / 100);
        let chuc = Math.floor((number % 100) / 10);
        let donvi = number % 10;
        let result = "";

        if (tram > 0 || showZero) {
          result += chuSo[tram] + " trăm ";
        }

        if (chuc > 1) {
          result += chuSo[chuc] + " mươi ";
        } else if (chuc === 1) {
          result += "mười ";
        } else if (tram > 0 && donvi > 0) {
          result += "lẻ ";
        }

        if (donvi > 0) {
          if (donvi === 5 && chuc >= 1) {
            result += "lăm ";
          } else if (donvi === 1 && chuc > 1) {
            result += "mốt ";
          } else {
            result += chuSo[donvi] + " ";
          }
        }

        return result;
      };

      let str = "";
      let blocks = [];
      let temp = soTien;

      while (temp > 0) {
        blocks.push(temp % 1000);
        temp = Math.floor(temp / 1000);
      }

      for (let i = blocks.length - 1; i >= 0; i--) {
        let blockText = docBlock(blocks[i], i < blocks.length - 1);
        if (blockText !== "") {
          str += blockText + donVi[i] + " ";
        }
      }

      str = str.trim();
      if (str.length > 0) {
        str = str.substring(0, 1).toUpperCase() + str.substring(1);
      }
      return str;
    };

    return {
      contract,
      extraFees,
      loading,
      isEditMode,
      numberOfTenants,
      saving,
      formatMoney,
      formatDate,
      formatWaterBillingType,
      docTienBangChu,
      toggleEditMode,
      submitEdit,
      goBack,
      terminateContract,
      printContract,
      activeTab,
      currentDay,
      currentMonth,
      currentYear,
      showPreviewModal,
      // Addendums
      addendums,
      loadingAddendums,
      showAddendumModal,
      savingAddendum,
      addendumForm,
      availableExtraFees,
      openAddendumModal,
      saveAddendum,
      // Addendum print
      selectedAddendum,
      selectedAddendumNum,
      showPrintAddendumModal,
      openPrintAddendumModal,
      printAddendum,
    };
  }
};
