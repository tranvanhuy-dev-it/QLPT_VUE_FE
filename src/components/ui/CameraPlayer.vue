<template>
  <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-border-main/50 shadow-md group">
    <!-- Camera Name Overlay -->
    <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-white z-10 flex items-center gap-1.5 border border-white/10">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      <span>{{ camera.name }}</span>
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
      <button @click="retry" class="mt-1 px-2.5 py-1 text-[9px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded transition-all">Thử lại</button>
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

    <!-- Control Actions overlay on hover -->
    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-10">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import Hls from 'hls.js';

export default {
  name: 'CameraPlayer',
  props: {
    camera: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const videoRef = ref(null);
    const loading = ref(true);
    const isError = ref(false);
    let hls = null;

    const streamUrl = computed(() => {
      let url = props.camera.streamUrl;
      if (!url) return '';
      
      // Basic authentication URL generation
      if (props.camera.username && props.camera.password) {
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
      const url = props.camera.streamUrl || '';
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

    const initializePlayer = () => {
      loading.value = true;
      isError.value = false;

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

    onMounted(() => {
      // Small timeout to let ref bind
      setTimeout(() => {
        initializePlayer();
      }, 100);
    });

    onUnmounted(() => {
      destroyPlayer();
    });

    watch(() => props.camera, () => {
      initializePlayer();
    }, { deep: true });

    return {
      videoRef,
      loading,
      isError,
      streamUrl,
      isHls,
      onPlaying,
      onError,
      retry
    };
  }
};
</script>
