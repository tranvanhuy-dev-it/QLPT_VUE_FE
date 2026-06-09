import { ref, onMounted, computed } from 'vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import EmptyState from '../../components/ui/EmptyState.vue';
import Modal from '../../components/ui/Modal.vue';
import FormInput from '../../components/ui/FormInput.vue';
import FormButton from '../../components/ui/FormButton.vue';
import AppIcon from '../../components/ui/icons/AppIcon.vue';
import ConfirmModal from '../../components/ui/ConfirmModal.vue';
import CameraPlayer from '../../components/ui/CameraPlayer.vue';
import { useBoardingHouseStore } from '../../stores/boardingHouse.js';
import cameraService from '../../services/boardingHouseCameraService.js';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'Cameras',
  components: {
    PageHeader,
    EmptyState,
    Modal,
    FormInput,
    FormButton,
    ConfirmModal,
    CameraPlayer,
    AppIcon,
  },
  setup() {
    const cameraIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`;

    const houseStore = useBoardingHouseStore();
    const { confirmModal, showAlert, showConfirm, onConfirmModal, closeConfirmModal } = useConfirmModal();

    const boardingHouses = computed(() => houseStore.boardingHouses);
    const cameras = ref([]);
    const loading = ref(false);
    const selectedHouseId = ref('');

    // Modal state
    const showModal = ref(false);
    const showGuideModal = ref(false);
    const editingCamera = ref(null);
    const saving = ref(false);
    const form = ref({
      boardingHouseId: '',
      name: '',
      streamUrl: '',
      username: '',
      password: '',
    });

    // Fetch all boarding houses & cameras
    const loadData = async () => {
      loading.value = true;
      try {
        // Fetch boarding houses if empty
        if (boardingHouses.value.length === 0) {
          await houseStore.fetchBoardingHouses();
        }
        
        // Fetch landlord cameras
        const response = await cameraService.getAllCameras();
        cameras.value = response.data;
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu camera:', err);
        showAlert('Lỗi', 'Không thể tải danh sách camera', 'danger');
      } finally {
        loading.value = false;
      }
    };

    // Filter cameras based on dropdown selection
    const filteredCameras = computed(() => {
      if (!selectedHouseId.value) {
        return cameras.value;
      }
      return cameras.value.filter(c => c.boardingHouseId === selectedHouseId.value);
    });

    // Get boarding house name by ID
    const getHouseName = (houseId) => {
      const house = boardingHouses.value.find(h => h.id === houseId);
      return house ? house.name : 'Dãy trọ không xác định';
    };

    // Modal actions
    const openAddModal = () => {
      editingCamera.value = null;
      form.value = {
        boardingHouseId: selectedHouseId.value || '', // preselect active house filter if set
        name: '',
        streamUrl: '',
        username: '',
        password: '',
      };
      showModal.value = true;
    };

    const openEditModal = (camera) => {
      editingCamera.value = camera;
      form.value = {
        boardingHouseId: camera.boardingHouseId,
        name: camera.name,
        streamUrl: camera.streamUrl,
        username: camera.username || '',
        password: camera.password || '',
      };
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      editingCamera.value = null;
    };

    const openGuideModal = () => {
      showGuideModal.value = true;
    };

    const closeGuideModal = () => {
      showGuideModal.value = false;
    };

    // Save camera (Add or Update)
    const saveCamera = async () => {
      if (!form.value.boardingHouseId) {
        showAlert('Cảnh báo', 'Vui lòng chọn dãy trọ liên kết!', 'warning');
        return;
      }
      saving.value = true;
      try {
        if (editingCamera.value) {
          await cameraService.updateCamera(editingCamera.value.id, form.value);
          showAlert('Thành công', 'Cập nhật camera thành công!', 'success');
        } else {
          await cameraService.addCamera(form.value.boardingHouseId, form.value);
          showAlert('Thành công', 'Thêm camera thành công!', 'success');
        }
        showModal.value = false;
        await loadData();
      } catch (err) {
        console.error('Lỗi khi lưu camera:', err);
        showAlert('Lỗi', err.response?.data?.error || 'Lưu camera thất bại', 'danger');
      } finally {
        saving.value = false;
      }
    };

    // Delete camera
    const deleteCamera = (camera) => {
      closeModal();
      showConfirm(
        'Xóa camera',
        `Bạn có chắc chắn muốn xóa camera "${camera.name}" ở dãy "${getHouseName(camera.boardingHouseId)}"?`,
        'danger',
        async () => {
          try {
            await cameraService.deleteCamera(camera.id);
            showAlert('Thành công', 'Xóa camera thành công!', 'success');
            await loadData();
          } catch (err) {
            console.error('Lỗi khi xóa camera:', err);
            showAlert('Lỗi', err.response?.data?.error || 'Xóa camera thất bại', 'danger');
          }
        }
      );
    };

    onMounted(() => {
      loadData();
    });

    return {
      cameraIcon,
      boardingHouses,
      cameras,
      filteredCameras,
      loading,
      selectedHouseId,
      showModal,
      showGuideModal,
      editingCamera,
      saving,
      form,
      getHouseName,
      openAddModal,
      openEditModal,
      closeModal,
      openGuideModal,
      closeGuideModal,
      saveCamera,
      deleteCamera,
      confirmModal,
      onConfirmModal,
      closeConfirmModal,
    };
  },
};
