import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useChatStore } from '../../stores/chat.js';
import { useAuthStore } from '../../stores/auth.js';

export default {
  name: 'TenantChat',
  setup() {
    const chatStore = useChatStore();
    const authStore = useAuthStore();

    const newMessageText = ref('');
    const messageContainerRef = ref(null);
    const isSending = ref(false);

    // For tenant, there's only one chat room (with their landlord)
    const currentRoom = computed(() => chatStore.rooms[0] || null);
    const currentRoomMessages = computed(() => chatStore.currentRoomMessages);
    const loadingRooms = computed(() => chatStore.loadingRooms);
    const loadingMessages = computed(() => chatStore.loadingMessages);
    const hasMore = computed(() => chatStore.hasMore);
    const currentUser = computed(() => authStore.user);

    // Landlord info derived from the chat room
    const landlordInfo = computed(() => {
      const room = currentRoom.value;
      if (!room) return null;
      // The tenant's partner (landlord) — from room.tenant we can't tell, but the API
      // returns the other party's info. We check the room metadata.
      return room.landlord || null;
    });

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

    const handleFocus = () => {
      // Reset viewport scroll to prevent the header/avatar from sliding up off-screen
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

    // Watch for incoming messages to auto-scroll
    watch(
      () => currentRoomMessages.value.length,
      (newVal, oldVal) => {
        if (newVal > oldVal && chatStore.currentPage === 0) {
          nextTick(() => {
            scrollToBottom();
          });
        }
      }
    );

    const formatTimeOnly = (dateTimeStr) => {
      if (!dateTimeStr) return '';
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

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
        minute: '2-digit',
      });
    };

    onMounted(async () => {
      if (authStore.isAuthenticated) {
        chatStore.connectWebSocket();
        await chatStore.fetchChatRooms();

        if (chatStore.rooms.length > 0) {
          const room = chatStore.rooms[0];
          chatStore.currentRoomId = room.id;
          await chatStore.fetchRoomMessages(room.id);
          await chatStore.markAsRead(room.id);
          await nextTick();
          scrollToBottom();
        }
      }
    });

    onUnmounted(() => {
      chatStore.currentRoomId = null;
    });

    return {
      currentRoom,
      currentRoomMessages,
      loadingRooms,
      loadingMessages,
      hasMore,
      newMessageText,
      messageContainerRef,
      isSending,
      currentUser,
      landlordInfo,
      loadMoreMessages,
      handleSendMessage,
      handleFocus,
      formatTimeOnly,
      formatMessageTime,
    };
  },
};
