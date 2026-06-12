import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useContractStore } from '../../stores/contract.js';
import { useChatStore } from '../../stores/chat.js';
import { useAuthStore } from '../../stores/auth.js';
import AppIcon from '../../components/ui/icons/AppIcon.vue';

export default {
  name: 'ContactLandlord',
  components: {
    AppIcon,
  },
  setup() {
    const contractStore = useContractStore();
    const chatStore = useChatStore();
    const authStore = useAuthStore();

    const activeContract = ref(null);
    const loading = ref(true);
    const showChatPanel = ref(false);
    const newMessageText = ref('');
    const messageContainerRef = ref(null);
    const isSending = ref(false);

    const landlord = computed(() => activeContract.value?.room?.boardingHouse?.landlord || null);
    
    const landlordInitial = computed(() => {
      const name = landlord.value?.fullName;
      return name ? name.charAt(0).toUpperCase() : 'L';
    });

    const boardingHouseName = computed(() => {
      return activeContract.value?.room?.boardingHouse?.name || 'Chưa xác định';
    });

    const currentRoom = computed(() => chatStore.rooms[0] || null);
    const currentRoomMessages = computed(() => chatStore.currentRoomMessages);
    const loadingMessages = computed(() => chatStore.loadingMessages);
    const hasMore = computed(() => chatStore.hasMore);
    const currentUser = computed(() => authStore.user);

    const toast = ref({
      show: false,
      message: '',
    });

    const copyToClipboard = (text, type) => {
      if (!text) return;
      navigator.clipboard.writeText(text)
        .then(() => {
          toast.value.show = true;
          toast.value.message = `Đã sao chép ${type} vào bộ nhớ tạm!`;
          setTimeout(() => {
            toast.value.show = false;
          }, 2500);
        })
        .catch(err => {
          console.error('Lỗi khi sao chép:', err);
        });
    };

    const scrollToBottom = () => {
      const container = messageContainerRef.value;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    };

    const loadMoreMessages = async () => {
      if (loadingMessages.value || !hasMore.value || !currentRoom.value) return;
      
      const container = messageContainerRef.value;
      const previousScrollHeight = container ? container.scrollHeight : 0;
      
      const nextPage = chatStore.currentPage + 1;
      await chatStore.fetchRoomMessages(currentRoom.value.id, nextPage, true);
      
      await nextTick();
      if (container) {
        container.scrollTop = container.scrollHeight - previousScrollHeight;
      }
    };

    const handleSendMessage = async () => {
      if (!newMessageText.value.trim() || isSending.value || !currentRoom.value) return;

      const text = newMessageText.value.trim();
      newMessageText.value = '';
      isSending.value = true;

      try {
        await chatStore.sendMessage(currentRoom.value.id, text);
        await nextTick();
        scrollToBottom();
      } catch (error) {
        console.error('Không thể gửi tin nhắn:', error);
        newMessageText.value = text;
      } finally {
        isSending.value = false;
      }
    };

    // Watch for showChatPanel to auto-fetch messages
    watch(showChatPanel, async (show) => {
      if (show && currentRoom.value) {
        await chatStore.fetchRoomMessages(currentRoom.value.id);
        await chatStore.markAsRead(currentRoom.value.id);
        await nextTick();
        scrollToBottom();
      }
    });

    // Watch for incoming messages
    watch(
      () => currentRoomMessages.value.length,
      (newVal, oldVal) => {
        if (showChatPanel.value && newVal > oldVal && chatStore.currentPage === 0) {
          nextTick(() => {
            scrollToBottom();
          });
        }
      }
    );

    const formatMessageTime = (dateTimeStr) => {
      if (!dateTimeStr) return '';
      const date = new Date(dateTimeStr);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(async () => {
      loading.value = true;
      try {
        const contractsList = await contractStore.fetchContracts();
        activeContract.value = contractsList.find(c => c.status === 'ACTIVE') || null;

        if (activeContract.value) {
          // Initialize chat rooms and WebSocket
          chatStore.connectWebSocket();
          await chatStore.fetchChatRooms();
          
          if (chatStore.rooms.length > 0) {
            chatStore.currentRoomId = chatStore.rooms[0].id;
          }
        }
      } catch (err) {
        console.error('Không thể tải dữ liệu liên hệ chủ nhà:', err);
      } finally {
        loading.value = false;
      }
    });

    return {
      activeContract,
      loading,
      landlord,
      landlordInitial,
      boardingHouseName,
      toast,
      showChatPanel,
      newMessageText,
      messageContainerRef,
      isSending,
      currentRoom,
      currentRoomMessages,
      loadingMessages,
      hasMore,
      currentUser,
      copyToClipboard,
      loadMoreMessages,
      handleSendMessage,
      formatMessageTime,
    };
  },
};
