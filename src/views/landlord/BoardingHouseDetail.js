import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoardingHouseStore } from '../../stores/boardingHouse.js';
import FormInput from '../../components/ui/FormInput.vue';
import FormSelect from '../../components/ui/FormSelect.vue';
import FormButton from '../../components/ui/FormButton.vue';
import ConfirmModal from '../../components/ui/ConfirmModal.vue';
import AppIcon from '../../components/ui/icons/AppIcon.vue';
import LoadingState from '../../components/ui/LoadingState.vue';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'BoardingHouseDetail',
  components: {
    FormInput,
    FormSelect,
    FormButton,
    ConfirmModal,
    AppIcon,
    LoadingState,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useBoardingHouseStore();
    const { confirmModal, showAlert, showConfirm, onConfirmModal, closeConfirmModal } = useConfirmModal();

    const houseId = route.params.id;
    const house = ref(null);
    const loading = ref(true);
    const activeTab = ref('info');

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
      extraFees: [],
    });

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
    });

    const formatMoney = (amount) => {
      if (amount === undefined || amount === null) return '0';
      return Math.round(amount).toLocaleString('vi-VN');
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

    const loadHouseDetails = async () => {
      loading.value = true;
      try {
        const data = await store.fetchBoardingHouseById(houseId);
        house.value = data;
        form.value = {
          name: data.name,
          address: data.address,
          defaultElectricityRate: data.defaultElectricityRate,
          defaultWaterRate: data.defaultWaterRate,
          waterBillingType: data.waterBillingType,
          bankName: data.bankName || '',
          bankAccountNumber: data.bankAccountNumber || '',
          bankAccountName: data.bankAccountName || '',
          rules: data.rules || '',
          extraFees: (data.extraFees || []).map(ef => ({
            id: ef.id,
            name: ef.name,
            defaultPrice: ef.defaultPrice,
            unitType: ef.unitType,
          })),
        };
      } catch (err) {
        console.error('Lỗi khi tải thông tin dãy trọ:', err);
        showAlert('Lỗi', 'Không thể tải thông tin chi tiết dãy trọ', 'danger');
        router.push({ name: 'BoardingHouses' });
      } finally {
        loading.value = false;
      }
    };

    const handleSave = async () => {
      try {
        await store.updateBoardingHouse(houseId, form.value);
        showAlert('Thành công', 'Cập nhật thông tin dãy trọ thành công!', 'success', () => {
          router.push({ name: 'BoardingHouses' });
        });
      } catch (err) {
        showAlert('Lỗi', err.response?.data?.error || 'Cập nhật dãy trọ thất bại', 'danger');
      }
    };

    const handleDelete = async () => {
      showConfirm(
        'Xóa dãy trọ',
        'Bạn có chắc chắn muốn xóa dãy trọ này? Hành động này sẽ xóa toàn bộ các phòng trọ và dữ liệu liên quan!',
        'danger',
        async () => {
          try {
            await store.deleteBoardingHouse(houseId);
            showAlert('Thành công', 'Xóa dãy trọ thành công!', 'success', () => {
              router.push({ name: 'BoardingHouses' });
            });
          } catch (err) {
            showAlert('Lỗi', err.response?.data?.error || 'Xóa dãy trọ thất bại', 'danger');
          }
        }
      );
    };

    const goBack = () => {
      router.push({ name: 'BoardingHouses' });
    };

    onMounted(() => {
      loadHouseDetails();
    });

    return {
      house,
      loading,
      form,
      popularBanks,
      activeTab,
      showRuleBuilder,
      ruleTemplate,
      addExtraFeeRow,
      removeExtraFeeRow,
      applyRulesTemplate,
      handleSave,
      handleDelete,
      goBack,
      formatMoney,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
