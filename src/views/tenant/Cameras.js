import { ref, onMounted } from 'vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import EmptyState from '../../components/ui/EmptyState.vue';
import CameraPlayer from '../../components/ui/CameraPlayer.vue';
import cameraService from '../../services/boardingHouseCameraService.js';
import { useConfirmModal } from '../../composables/useConfirmModal.js';

export default {
  name: 'TenantCameras',
  components: {
    PageHeader,
    EmptyState,
    CameraPlayer,
  },
  setup() {
    const cameraIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`;

    const { showAlert } = useConfirmModal();
    const cameras = ref([]);
    const loading = ref(false);

    const loadCameras = async () => {
      loading.value = true;
      try {
        const response = await cameraService.getTenantCameras();
        cameras.value = response.data;
      } catch (err) {
        console.error('Lỗi khi tải camera:', err);
        showAlert('Lỗi', 'Không thể tải luồng camera của dãy trọ.', 'danger');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadCameras();
    });

    return {
      cameraIcon,
      cameras,
      loading,
    };
  },
};
