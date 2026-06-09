import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '../../components/ui/PageHeader.vue';
import EmptyState from '../../components/ui/EmptyState.vue';
import Modal from '../../components/ui/Modal.vue';
import FormInput from '../../components/ui/FormInput.vue';
import FormSelect from '../../components/ui/FormSelect.vue';
import FormButton from '../../components/ui/FormButton.vue';
import AppIcon from '../../components/ui/icons/AppIcon.vue';
import ConfirmModal from '../../components/ui/ConfirmModal.vue';
import { useBoardingHouseStore } from '../../stores/boardingHouse.js';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'BoardingHouses',
  components: {
    PageHeader,
    EmptyState,
    Modal,
    FormInput,
    FormSelect,
    FormButton,
    ConfirmModal,
    AppIcon,
  },
  setup() {
    const router = useRouter();
    const { confirmModal, showAlert, showConfirm, onConfirmModal, closeConfirmModal } = useConfirmModal();
    const houseIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>`;

    const store = useBoardingHouseStore();
    const boardingHouses = computed(() => store.boardingHouses);
    const loading = computed(() => store.loading);

    const goToDetail = (id) => {
      router.push({ name: 'BoardingHouseDetail', params: { id } });
    };

    const DEFAULT_RULES = `1. Tuân thủ nghiêm ngặt các quy định về phòng cháy chữa cháy (PCCC). Không tàng trữ, sử dụng các chất dễ cháy nổ trong phòng.
2. Giữ gìn trật tự và không gây tiếng ồn lớn sau 22h00 tối.
3. Không tàng trữ, sử dụng chất cấm hoặc thực hiện các hành vi vi phạm pháp luật tại nhà trọ.
4. Giữ gìn vệ sinh chung, để rác đúng nơi quy định và tham gia vệ sinh hành lang định kỳ.
5. Để xe gọn gàng đúng khu vực quy định trong nhà xe của dãy trọ.
6. Khi có bạn bè hoặc người thân đến chơi và ở lại qua đêm, vui lòng khai báo với chủ trọ để đăng ký tạm trú.`;

    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const editId = ref(null);

    const popularBanks = [
      { code: 'MB', name: 'MBBank (Ngân hàng Quân đội)' },
      { code: 'VCB', name: 'Vietcombank' },
      { code: 'ICB', name: 'VietinBank' },
      { code: 'BIDV', name: 'BIDV' },
      { code: 'TCB', name: 'Techcombank' },
      { code: 'ACB', name: 'ACB' },
      { code: 'VPB', name: 'VPBank' },
      { code: 'TPB', name: 'TPBank' },
      { code: 'VIB', name: 'VIB' },
      { code: 'STB', name: 'Sacombank' },
      { code: 'HDB', name: 'HDBank' },
      { code: 'SHB', name: 'SHB' }
    ];

    const form = ref({
      name: '',
      address: '',
      defaultElectricityRate: 3500,
      defaultWaterRate: 15000,
      waterBillingType: 'BY_INDEX',
      bankName: '',
      bankAccountNumber: '',
      bankAccountName: '',
      rules: '',
      fixedBillingDay: null,
      extraFees: [],
    });

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
    };

    const formatWaterBillingType = (type) => {
      switch (type) {
        case 'BY_INDEX': return 'Theo chỉ số điện nước';
        case 'FIXED_PER_PERSON': return 'Theo người ở';
        default: return type;
      }
    };

    const addExtraFeeRow = () => {
      form.value.extraFees.push({
        id: null,
        name: '',
        defaultPrice: 0,
        unitType: 'FIXED_PER_ROOM',
      });
    };

    const removeExtraFeeRow = (index) => {
      form.value.extraFees.splice(index, 1);
    };

    const openAddModal = () => {
      form.value.rules = DEFAULT_RULES;
      showAddModal.value = true;
    };

    const saveHouse = async () => {
      try {
        if (showEditModal.value) {
          await store.updateBoardingHouse(editId.value, form.value);
        } else {
          await store.createBoardingHouse(form.value);
        }
        closeModal();
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Không thể lưu thông tin dãy trọ', 'danger');
      }
    };

    const editHouse = (house) => {
      editId.value = house.id;
      form.value = {
        name: house.name,
        address: house.address,
        defaultElectricityRate: house.defaultElectricityRate,
        defaultWaterRate: house.defaultWaterRate,
        waterBillingType: house.waterBillingType,
        bankName: house.bankName || '',
        bankAccountNumber: house.bankAccountNumber || '',
        bankAccountName: house.bankAccountName || '',
        rules: house.rules || '',
        fixedBillingDay: house.fixedBillingDay || null,
        extraFees: (house.extraFees || []).map(ef => ({
          id: ef.id,
          name: ef.name,
          defaultPrice: ef.defaultPrice,
          unitType: ef.unitType,
        })),
      };
      showEditModal.value = true;
    };

    const deleteHouse = async (id) => {
      showConfirm(
        'Xóa dãy trọ',
        'Bạn có chắc chắn muốn xóa dãy trọ này? Hành động này sẽ xóa toàn bộ các phòng trọ và dữ liệu liên quan!',
        'danger',
        async () => {
          try {
            await store.deleteBoardingHouse(id);
          } catch (err) {
            showAlert('Lỗi', err.response?.data?.error || 'Xóa dãy trọ thất bại', 'danger');
          }
        }
      );
    };

    const closeModal = () => {
      showAddModal.value = false;
      showEditModal.value = false;
      editId.value = null;
      form.value = {
        name: '',
        address: '',
        defaultElectricityRate: 3500,
        defaultWaterRate: 15000,
        waterBillingType: 'BY_INDEX',
        bankName: '',
        bankAccountNumber: '',
        bankAccountName: '',
        rules: '',
        fixedBillingDay: null,
        extraFees: [],
      };
    };

    const showRuleBuilder = ref(false);
    const ruleTemplate = ref({
      enabledCurfew: true,
      curfewStart: '23:00',
      curfewEnd: '05:00',
      selfUnlock: true,
      enabledDryingArea: true,
      enabledNoised: true,
      noisedStart: '22:00',
      enabledOvernight: true,
      overnightFee: 50000,
      enabledTrash: true,
      trashTime: '19:00',
      enabledPets: true,
      petsPolicy: 'NO_PETS',
      enabledPccc: true,
      enabledVehicle: true,
      enabledRegister: true,
      enabledSocialEvils: true,
      enabledCommonHygiene: true,
      enabledRoomEquipments: true,
    });

    const applyRulesTemplate = () => {
      let r = [];
      let idx = 1;
      
      if (ruleTemplate.value.enabledRegister) {
        r.push(`${idx++}. Đăng ký tạm trú: Khách thuê có nghĩa vụ cung cấp đầy đủ giấy tờ tùy thân (CCCD/Hộ chiếu) trong vòng 24 giờ kể từ khi dọn vào để chủ trọ thực hiện đăng ký tạm trú với cơ quan Công an theo quy định của Luật Cư trú.`);
      }

      if (ruleTemplate.value.enabledPccc) {
        r.push(`${idx++}. Tuân thủ nghiêm ngặt các quy định của pháp luật về Phòng cháy chữa cháy (PCCC). Không tàng trữ chất dễ cháy nổ, chất hóa học nguy hiểm. Tắt các thiết bị điện không cần thiết khi ra khỏi phòng.`);
      }
      
      if (ruleTemplate.value.enabledCurfew) {
        let curfewText = `${idx++}. Giờ giấc ra vào: Khóa cửa cổng từ ${ruleTemplate.value.curfewStart} và tự động mở khóa lại vào lúc ${ruleTemplate.value.curfewEnd} sáng hôm sau.`;
        if (ruleTemplate.value.selfUnlock) {
          curfewText += ` Khách thuê về trễ có thể tự mở khóa bằng vân tay/khóa riêng (vui lòng đóng cổng cẩn thận và hạn chế tiếng ồn tránh ảnh hưởng mọi người xung quanh).`;
        } else {
          curfewText += ` Khách ra vào ngoài khung giờ trên vui lòng liên hệ trước với chủ trọ/quản lý.`;
        }
        r.push(curfewText);
      } else {
        r.push(`${idx++}. Giờ giấc ra vào tự do, tuy nhiên khi ra vào nhớ khóa cửa cổng cẩn thận để đảm bảo an ninh.`);
      }

      if (ruleTemplate.value.enabledDryingArea) {
        r.push(`${idx++}. Sử dụng sân phơi đồ tự do tại khu vực quy định chung. Vui lòng giữ gìn vệ sinh và thu gom quần áo khi đã khô để nhường chỗ cho phòng khác.`);
      }

      if (ruleTemplate.value.enabledCommonHygiene) {
        r.push(`${idx++}. Giữ gìn vệ sinh chung: Giữ sạch sẽ khu vực lối đi, cầu thang và hành lang chung. Không để đồ đạc cá nhân, rác thải hoặc giày dép bừa bãi lấn chiếm không gian chung.`);
      }

      if (ruleTemplate.value.enabledRoomEquipments) {
        r.push(`${idx++}. Bảo quản trang thiết bị: Khách thuê có trách nhiệm giữ gìn và sử dụng đúng cách các trang thiết bị, vật dụng và nội thất được bàn giao trong phòng. Nếu xảy ra hư hỏng hoặc mất mát do lỗi chủ quan, khách thuê phải bồi thường thiệt hại theo giá trị thực tế.`);
      }
      
      if (ruleTemplate.value.enabledNoised) {
        r.push(`${idx++}. Giữ gìn trật tự chung, hạn chế tiếng ồn và không làm ảnh hưởng đến phòng khác sau ${ruleTemplate.value.noisedStart} tối.`);
      }
      
      if (ruleTemplate.value.enabledOvernight) {
        if (ruleTemplate.value.overnightFee > 0) {
          r.push(`${idx++}. Người thân hoặc bạn bè đến chơi qua đêm cần đăng ký tạm trú với chủ trọ. Phí lưu trú qua đêm là ${formatMoney(ruleTemplate.value.overnightFee)}đ/đêm.`);
        } else {
          r.push(`${idx++}. Khách ở lại qua đêm phải khai báo đầy đủ thông tin với chủ trọ trước 22:00 để đăng ký tạm trú.`);
        }
      }
      
      if (ruleTemplate.value.enabledTrash) {
        r.push(`${idx++}. Giữ gìn vệ sinh chung sạch sẽ. Bỏ rác đúng nơi quy định trước ${ruleTemplate.value.trashTime} hàng ngày.`);
      }
      
      if (ruleTemplate.value.enabledVehicle) {
        r.push(`${idx++}. Sắp xếp phương tiện đi lại gọn gàng, đúng vị trí quy định trong nhà xe.`);
      }
      
      if (ruleTemplate.value.enabledPets) {
        if (ruleTemplate.value.petsPolicy === 'NO_PETS') {
          r.push(`${idx++}. Nghiêm cấm nuôi động vật (chó, mèo, gia cầm...) trong khuôn viên dãy trọ.`);
        } else if (ruleTemplate.value.petsPolicy === 'ALLOWED_CONDITIONAL') {
          r.push(`${idx++}. Được nuôi thú cưng nhỏ, nhưng phải cam kết giữ gìn vệ sinh, không gây mùi hôi và không làm ồn ảnh hưởng phòng xung quanh.`);
        }
      }

      if (ruleTemplate.value.enabledSocialEvils) {
        r.push(`${idx++}. Nghiêm cấm tuyệt đối các hành vi vi phạm pháp luật tại nhà trọ: sử dụng, tàng trữ trái phép chất ma túy, đánh bạc ăn tiền, mại dâm, chứa chấp tội phạm hoặc truyền bá văn hóa phẩm đồi trụy.`);
      }
      
      form.value.rules = r.join('\n');
    };

    const fetchBoardingHouses = async () => {
      try {
        await store.fetchBoardingHouses();
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Không thể tải danh sách dãy trọ', 'danger');
      }
    };

    onMounted(() => {
      fetchBoardingHouses();
    });

    return {
      houseIcon,
      boardingHouses,
      loading,
      showAddModal,
      showEditModal,
      form,
      popularBanks,
      showRuleBuilder,
      ruleTemplate,
      applyRulesTemplate,
      goToDetail,
      saveHouse,
      editHouse,
      deleteHouse,
      closeModal,
      openAddModal,
      formatMoney,
      formatWaterBillingType,
      addExtraFeeRow,
      removeExtraFeeRow,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
