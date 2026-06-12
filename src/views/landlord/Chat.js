import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useChatStore } from '../../stores/chat.js';
import { useAuthStore } from '../../stores/auth.js';
import { formatDateTime, formatDate } from '../../utils/date.js';

export default {
  name: 'LandlordChat',
  setup() {
    const chatStore = useChatStore();
    const authStore = useAuthStore();

    const newMessageText = ref('');
    const selectedRoom = ref(null);
    const messageContainerRef = ref(null);
    const isSending = ref(false);
    const mobileShowChat = ref(false);

    const rooms = computed(() => chatStore.rooms);
    const currentRoomMessages = computed(() => chatStore.currentRoomMessages);
    const loadingRooms = computed(() => chatStore.loadingRooms);
    const loadingMessages = computed(() => chatStore.loadingMessages);
    const hasMore = computed(() => chatStore.hasMore);

    const currentUser = computed(() => authStore.user);

    const selectRoom = async (room) => {
      selectedRoom.value = room;
      mobileShowChat.value = true;
      await chatStore.fetchRoomMessages(room.id);
      await chatStore.markAsRead(room.id);
      await nextTick();
      scrollToBottom();
    };

    const loadMoreMessages = async () => {
      if (loadingMessages.value || !hasMore.value) return;
      
      // Save scroll height before loading more
      const container = messageContainerRef.value;
      const previousScrollHeight = container ? container.scrollHeight : 0;
      
      const nextPage = chatStore.currentPage + 1;
      await chatStore.fetchRoomMessages(selectedRoom.value.id, nextPage, true);
      
      await nextTick();
      
      // Restore scroll position
      if (container) {
        container.scrollTop = container.scrollHeight - previousScrollHeight;
      }
    };

    const handleSendMessage = async () => {
      if (!newMessageText.value.trim() || isSending.value || !selectedRoom.value) return;

      const text = newMessageText.value.trim();
      newMessageText.value = '';
      isSending.value = true;

      try {
        await chatStore.sendMessage(selectedRoom.value.id, text);
        await nextTick();
        scrollToBottom();
      } catch (error) {
        console.error('Không thể gửi tin nhắn:', error);
        newMessageText.value = text; // Restore text on error
      } finally {
        isSending.value = false;
      }
    };

    const handleFocus = () => {
      // Reset viewport scroll to prevent the header from sliding up off-screen
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        scrollToBottom();
      }, 80);
      
      // Secondary check to override delayed OS keyboard layout transitions
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
      }, 250);
    };

    const scrollToBottom = () => {
      const container = messageContainerRef.value;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    };

    // Watch for new messages in current room to auto scroll to bottom
    watch(
      () => currentRoomMessages.value.length,
      (newVal, oldVal) => {
        // Only scroll if we are appending a new message at the bottom (newVal > oldVal)
        // and we aren't loading page (> 0 increment and not loading older messages)
        if (newVal > oldVal && chatStore.currentPage === 0) {
          nextTick(() => {
            scrollToBottom();
          });
        }
      }
    );

    // Watch selectedRoom to keep chatStore.currentRoomId in sync
    watch(selectedRoom, (newRoom) => {
      chatStore.currentRoomId = newRoom ? newRoom.id : null;
    });

    const formatTimeOnly = (dateTimeStr) => {
      if (!dateTimeStr) return '';
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatMessageTime = (dateTimeStr) => {
      if (!dateTimeStr) return '';
      const date = new Date(dateTimeStr);
      const now = new Date();
      
      // If today, return time only
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }
      
      // Otherwise return date and time
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(async () => {
      // Connect WebSocket if authenticated
      if (authStore.isAuthenticated) {
        chatStore.connectWebSocket();
      }
    });

    onUnmounted(() => {
      // Clear currentRoomId when leaving Chat page
      chatStore.currentRoomId = null;
    });

    return {
      rooms,
      selectedRoom,
      currentRoomMessages,
      loadingRooms,
      loadingMessages,
      hasMore,
      newMessageText,
      messageContainerRef,
      isSending,
      currentUser,
      mobileShowChat,
      selectRoom,
      loadMoreMessages,
      handleSendMessage,
      handleFocus,
      formatTimeOnly,
      formatMessageTime,
      formatDateTime,
      formatDate
    };
  }
};
