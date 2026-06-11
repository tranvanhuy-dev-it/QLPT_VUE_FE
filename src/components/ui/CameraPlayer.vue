<template>
  <div ref="containerRef" @click="toggleControls" class="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-border-main/50 shadow-md group cursor-pointer">
    <!-- Camera Name Overlay -->
    <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-white z-10 flex items-center gap-1.5 border border-white/10">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      <span>{{ camera.name }}</span>
      <slot v-if="showControls" name="header-extra"></slot>
    </div>

    <!-- Live Badge -->
    <div class="absolute top-3 right-3 bg-red-600 px-2 py-0.5 rounded text-[9px] font-extrabold text-white z-10 tracking-widest uppercase shadow-xs flex items-center gap-1">
      <span class="w-1 h-1 rounded-full bg-white animate-ping"></span>
      <span>LIVE</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-2.5 z-5 text-slate-400">
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-[10px] font-semibold tracking-wide">Đang kết nối camera...</span>
    </div>

    <!-- Error State -->
    <div v-if="isError" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-2 z-5 text-center px-4">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-7 h-7 text-rose-500">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
      <span class="text-[10px] font-bold text-slate-300">Không thể tải luồng camera</span>
      <span class="text-[9px] text-slate-500 leading-normal max-w-[200px]">Đường dẫn lỗi hoặc thiết bị không cùng mạng LAN với camera.</span>
      <button @click.stop="retry" class="mt-1 px-2.5 py-1 text-[9px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded transition-all">Thử lại</button>
    </div>

    <!-- Video Element (HLS) -->
    <video
      v-if="isHls"
      ref="videoRef"
      class="w-full h-full object-cover"
      autoplay
      muted
      playsinline
      @playing="onPlaying"
      @error="onError"
    ></video>

    <!-- Image Element (MJPEG) -->
    <img
      v-else
      :src="streamUrl"
      class="w-full h-full object-cover"
      @load="onPlaying"
      @error="onError"
      alt="Camera stream"
    />

    <!-- Control Actions overlay (visible when clicked/tapped) -->
    <div 
      class="absolute inset-0 bg-black/45 backdrop-blur-[1px] transition-opacity duration-300 z-10"
      :class="showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
    >
      <!-- Bottom Left Action: Settings Button (Gear icon) -->
      <div v-if="showSettings" class="absolute bottom-3 left-3 pointer-events-auto">
        <button 
          type="button"
          @click.stop="onSettingsClick" 
          class="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition active:scale-95 border border-white/10 shadow-sm"
          title="Cài đặt camera"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </button>
      </div>

      <!-- Bottom Right Action: Landscape / Fullscreen Zoom Button -->
      <div class="absolute bottom-3 right-3 pointer-events-auto">
        <button 
          type="button"
          @click.stop="toggleFullscreen" 
          class="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition active:scale-95 border border-white/10 shadow-sm"
          :title="isFullscreen ? 'Thu nhỏ' : 'Xem ngang màn hình'"
        >
          <!-- Fullscreen Expand Icon (when not fullscreen) -->
          <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
          </svg>
          <!-- Fullscreen Exit Icon (when fullscreen) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3 3m12 6V4.5M15 9h4.5M15 9l6-6M9 15v4.5M9 15H4.5M9 15l-6 6m12-9v4.5M15 15h4.5M15 15l6 6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import Hls from 'hls.js';
import cameraService from '../../services/boardingHouseCameraService.js';

export default {
  name: 'CameraPlayer',
  props: {
    camera: {
      type: Object,
      required: true
    },
    showSettings: {
      type: Boolean,
      default: true
    }
  },
  emits: ['settings-click'],
  setup(props, { emit }) {
    const videoRef = ref(null);
    const containerRef = ref(null);
    const isFullscreen = ref(false);
    const loading = ref(true);
    const isError = ref(false);
    const showControls = ref(false);
    const liveStreamUrl = ref('');
    let hideTimeout = null;
    let hls = null;

    const resetHideTimeout = () => {
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        showControls.value = false;
      }, 4000);
    };

    const toggleControls = () => {
      showControls.value = !showControls.value;
      if (showControls.value) {
        resetHideTimeout();
      } else {
        clearTimeout(hideTimeout);
      }
    };

    const onSettingsClick = () => {
      showControls.value = false;
      clearTimeout(hideTimeout);
      emit('settings-click', props.camera);
    };

    const streamUrl = computed(() => {
      let url = props.camera.brand?.toUpperCase() === 'IMOU' ? liveStreamUrl.value : props.camera.streamUrl;
      if (!url) return '';
      
      // Basic authentication URL generation
      if (props.camera.brand?.toUpperCase() !== 'IMOU' && props.camera.username && props.camera.password) {
        const protocolMatch = url.match(/^https?:\/\//);
        if (protocolMatch) {
          const protocol = protocolMatch[0];
          const rest = url.substring(protocol.length);
          return `${protocol}${encodeURIComponent(props.camera.username)}:${encodeURIComponent(props.camera.password)}@${rest}`;
        }
      }
      return url;
    });

    const isHls = computed(() => {
      if (props.camera.brand?.toUpperCase() === 'IMOU') return true;
      const url = streamUrl.value || props.camera.streamUrl || '';
      return url.toLowerCase().includes('.m3u8') || url.toLowerCase().includes('hls');
    });

    const onPlaying = () => {
      loading.value = false;
      isError.value = false;
    };

    const onError = (e) => {
      console.error('Camera playback error:', e);
      loading.value = false;
      isError.value = true;
    };

    const initializePlayer = async () => {
      loading.value = true;
      isError.value = false;

      // 1. Nếu là camera IMOU, lấy URL luồng động mới nhất từ backend
      if (props.camera.brand?.toUpperCase() === 'IMOU' && props.camera.id) {
        try {
          const response = await cameraService.getCameraStream(props.camera.id);
          liveStreamUrl.value = response.data.streamUrl;
        } catch (err) {
          console.error('Lỗi khi lấy luồng động camera Imou:', err);
          onError(err);
          return;
        }
      }

      if (isHls.value) {
        // Clear previous HLS instance if any
        destroyPlayer();
        
        const video = videoRef.value;
        if (!video) return;

        if (Hls.isSupported()) {
          hls = new Hls({
            maxMaxBufferLength: 10,
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl.value);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(err => {
              console.warn('Auto play was prevented, waiting for user interaction:', err);
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('Fatal network error in HLS, attempting to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('Fatal media error in HLS, attempting to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  onError(data);
                  break;
              }
            }
          });
        } 
        // For Safari which natively supports HLS
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl.value;
          video.addEventListener('canplay', () => {
            video.play().catch(err => console.warn(err));
          });
          video.addEventListener('error', onError);
        } else {
          onError('HLS is not supported in this browser');
        }
      }
    };

    const destroyPlayer = () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      if (videoRef.value) {
        videoRef.value.removeAttribute('src');
        videoRef.value.load();
      }
    };

    const retry = () => {
      initializePlayer();
    };

    const toggleFullscreen = async () => {
      resetHideTimeout();
      const container = containerRef.value;
      if (!container) return;

      try {
        if (!document.fullscreenElement) {
          if (container.requestFullscreen) {
            await container.requestFullscreen();
          } else if (container.webkitRequestFullscreen) {
            await container.webkitRequestFullscreen();
          } else if (container.msRequestFullscreen) {
            await container.msRequestFullscreen();
          }
          
          // Try to lock orientation to landscape
          if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape').catch(err => {
              console.warn('Orientation lock failed:', err);
            });
          }
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
          }
        }
      } catch (err) {
        console.error('Fullscreen toggle error:', err);
      }
    };

    const handleFullscreenChange = () => {
      isFullscreen.value = !!document.fullscreenElement;
      // If exiting fullscreen, unlock orientation
      if (!isFullscreen.value && screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };

    onMounted(() => {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);

      // Small timeout to let ref bind
      setTimeout(() => {
        initializePlayer();
      }, 100);
    });

    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      clearTimeout(hideTimeout);
      destroyPlayer();
    });

    watch(() => props.camera, () => {
      liveStreamUrl.value = ''; // Reset link động cũ
      initializePlayer();
    }, { deep: true });

    return {
      videoRef,
      containerRef,
      isFullscreen,
      loading,
      isError,
      showControls,
      toggleControls,
      onSettingsClick,
      streamUrl,
      isHls,
      onPlaying,
      onError,
      retry,
      toggleFullscreen
    };
  }
};
</script>
