<template>
  <div class="h-full flex flex-col bg-card overflow-hidden chat-container-safe" :class="{ 'keyboard-open': isKeyboardOpen }">
    <!-- Main Chat Workspace Card -->
    <div class="flex-grow bg-card overflow-hidden flex flex-col lg:grid lg:grid-cols-12 min-h-0 w-full">
      
      <!-- LEFT COLUMN: Inbox Rooms List -->
      <div 
        class="col-span-12 lg:col-span-4 border-r border-border-main/50 flex flex-col min-h-0 h-full bg-white dark:bg-[#151515]"
        :class="{ 'hidden lg:flex': mobileShowChat }"
      >
        <!-- Inbox Header -->
        <div class="p-4.5 border-b border-border-main/50 flex items-center gap-3 shrink-0 bg-slate-50/20 dark:bg-slate-900/5">
          <router-link 
            to="/landlord"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-text-sub border-0 cursor-pointer flex items-center justify-center transition-all active:scale-95"
            title="Quay lại Tổng quan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4.5 h-4.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </router-link>
          <h2 class="text-sm font-extrabold text-text-main flex items-center gap-2 tracking-tight">
            Hộp thư trò chuyện
          </h2>
        </div>

        <!-- Room Items list -->
        <div class="flex-grow overflow-y-auto min-h-0 py-2.5 px-2.5 space-y-1 bg-slate-50/10 dark:bg-slate-900/5 scrollbar-thin">
          <div v-if="loadingRooms" class="flex flex-col items-center justify-center py-16 gap-3 text-text-sub">
            <div class="w-7 h-7 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <span class="text-xs font-semibold animate-pulse">Đang tải hộp thư...</span>
          </div>

          <div v-else-if="rooms.length === 0" class="flex flex-col items-center justify-center py-16 px-4 text-center text-text-sub select-none">
            <div class="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 border border-border-main flex items-center justify-center mb-3.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 text-primary/80">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.083.185.13.39.13.606v5.367c0 .803-.65 1.45-1.45 1.45H5.25c-.803 0-1.45-.647-1.45-1.45V9.117c0-.216.047-.42.13-.606M20.25 8.511a2.625 2.625 0 0 0-5.228-.582v.003c0 .02-.008.037-.023.048L12 10.158l-3.007-2.18a.072.072 0 0 0-.023-.048v-.004A2.625 2.625 0 0 0 3.75 8.511m16.5 0v0a2.625 2.625 0 0 1-2.625 2.59H6.375a2.625 2.625 0 0 1-2.625-2.59" />
              </svg>
            </div>
            <span class="text-xs font-bold text-text-main">Chưa có hội thoại</span>
            <p class="text-[11px] mt-1.5 text-text-sub leading-relaxed max-w-[200px] mx-auto">Cuộc hội thoại sẽ tự động kích hoạt khi có hợp đồng thuê hoạt động với khách hàng.</p>
          </div>

          <div 
            v-else
            v-for="room in rooms" 
            :key="room.id"
            @click="selectRoom(room)"
            class="px-4 py-3.5 rounded-2xl flex gap-3.5 cursor-pointer transition-all duration-250 border border-transparent select-none relative"
            :class="selectedRoom && selectedRoom.id === room.id 
              ? 'bg-primary/5 dark:bg-primary/10 border-primary/20 shadow-2xs scale-[1.01]' 
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-border-main/30'"
          >
            <!-- User initial avatar -->
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-purple-500/15 text-primary border border-primary/10 font-bold flex items-center justify-center shrink-0 shadow-2xs text-xs tracking-wider">
              {{ room.tenant.fullName ? room.tenant.fullName.charAt(0).toUpperCase() : 'U' }}
            </div>

            <!-- Content preview -->
            <div class="flex-grow min-w-0">
              <div class="flex justify-between items-baseline mb-1">
                <span class="font-extrabold text-xs text-text-main truncate max-w-[130px] sm:max-w-[150px]">{{ room.tenant.fullName }}</span>
                <span class="text-[9px] text-text-sub/80 font-bold uppercase tracking-wider">{{ formatTimeOnly(room.lastMessageTime) }}</span>
              </div>

              <p 
                class="text-xs text-text-sub truncate pr-6"
                :class="{ 'font-extrabold text-text-main dark:text-neutral-200': room.unreadCount > 0 }"
              >
                {{ room.lastMessage || 'Chưa có tin nhắn nào...' }}
              </p>
            </div>

            <!-- Unread badge -->
            <div v-if="room.unreadCount > 0" class="absolute right-4 top-1/2 -translate-y-1/2 min-w-[16px] h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-md shadow-danger/20 leading-none border border-white dark:border-slate-900">
              {{ room.unreadCount }}
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Chat Details Frame -->
      <div 
        class="col-span-12 lg:col-span-8 flex flex-col min-h-0 h-full bg-slate-50/10 dark:bg-slate-900/5"
        :class="{ 'hidden lg:flex': !mobileShowChat, 'flex': mobileShowChat }"
      >
        <template v-if="selectedRoom">
          <!-- Chat box Header -->
          <div class="p-4 border-b border-border-main/50 flex items-center justify-between shrink-0 bg-white/70 dark:bg-[#151515]/70 backdrop-blur-md z-10 shadow-xs">
            <div class="flex items-center gap-3">
              <!-- Back button -->
              <button 
                @click="mobileShowChat = false; selectedRoom = null"
                class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-text-sub border-0 cursor-pointer flex items-center justify-center transition-all active:scale-95"
                title="Quay lại danh sách"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4.5 h-4.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>
              
              <!-- Info -->
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-purple-500/15 text-primary border border-primary/10 font-bold flex items-center justify-center shrink-0 text-xs">
                  {{ selectedRoom.tenant.fullName ? selectedRoom.tenant.fullName.charAt(0).toUpperCase() : 'U' }}
                </div>
                <div>
                  <h3 class="font-extrabold text-sm text-text-main tracking-tight leading-tight">
                    {{ selectedRoom.tenant.fullName }}
                  </h3>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="relative flex h-1.5 w-1.5">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span class="text-[9px] text-primary font-extrabold tracking-wider uppercase">
                      Hội thoại trực tiếp
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <!-- Call button link -->
              <a 
                v-if="selectedRoom.tenant.phone"
                :href="`tel:${selectedRoom.tenant.phone}`"
                class="p-2 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 transition-all border border-emerald-500/10 flex items-center justify-center shadow-xs active:scale-95"
                title="Gọi điện"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 0 1-7.147-7.147c-.155-.441.011-.928.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </a>
              
              <!-- Profile link -->
              <router-link
                :to="`/landlord/tenants/${selectedRoom.tenant.id}`"
                class="p-2 bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100/60 dark:hover:bg-sky-900/30 rounded-xl text-sky-600 dark:text-sky-400 transition-all border border-sky-500/10 flex items-center justify-center shadow-xs active:scale-95"
                title="Hồ sơ khách thuê"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </router-link>
            </div>
          </div>

          <!-- Messages Body -->
          <div 
            ref="messageContainerRef"
            class="flex-grow overflow-y-auto px-6 py-5 space-y-4 min-h-0 flex flex-col bg-gradient-to-br from-slate-50/40 via-slate-100/10 to-indigo-50/5 dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0f172a]/10 scrollbar-thin scrollbar-thumb-border-main"
          >
            <!-- Load older messages button -->
            <div v-if="hasMore" class="flex justify-center pb-2">
              <button 
                @click="loadMoreMessages" 
                class="px-5 py-2 text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/30 transition-all rounded-full cursor-pointer shadow-xs active:scale-95"
                :disabled="loadingMessages"
              >
                <span v-if="loadingMessages">Đang tải tin nhắn cũ...</span>
                <span v-else>Tải thêm tin nhắn cũ</span>
              </button>
            </div>

            <div v-if="loadingMessages && currentRoomMessages.length === 0" class="flex justify-center py-12">
              <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Messages list -->
            <template v-else>
              <div 
                v-for="msg in currentRoomMessages" 
                :key="msg.id"
                class="flex flex-col max-w-[85%] sm:max-w-[70%] animate-message-fade-in"
                :class="msg.senderUsername === currentUser?.username ? 'self-end items-end ml-auto' : 'self-start items-start mr-auto'"
              >
                <!-- Message bubble -->
                <div 
                  class="px-4 py-2.5 text-[13px] leading-relaxed break-words shadow-2xs hover:shadow-xs transition-all duration-200 chat-bubble-sent"
                  :class="msg.senderUsername === currentUser?.username 
                    ? 'bg-gradient-to-tr from-primary to-indigo-600 dark:from-primary dark:to-indigo-500 text-white chat-bubble-sent' 
                    : 'bg-card border border-border-main/70 text-text-main chat-bubble-received dark:bg-slate-900/60 dark:backdrop-blur-xs'"
                >
                  {{ msg.content }}
                </div>
                
                <!-- Time stamp -->
                <span class="text-[9px] text-text-sub/75 font-semibold mt-1.5 px-1 tracking-wide uppercase">
                  {{ formatMessageTime(msg.createdAt) }}
                </span>
              </div>
            </template>
          </div>

          <!-- Message Input area -->
          <div class="p-4 border-t border-border-main/50 bg-white/95 dark:bg-[#151515]/95 backdrop-blur-md shrink-0 z-10 shadow-md chat-footer-safe">
            <form @submit.prevent="handleSendMessage" class="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
              <input 
                v-model="newMessageText"
                type="text" 
                placeholder="Nhập tin nhắn..." 
                class="flex-grow bg-slate-50 dark:bg-slate-900/50 border border-border-main px-4 py-3.5 text-xs text-text-main focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200 placeholder-text-sub/50 dark:placeholder-neutral-500 chat-input-rounded"
                :disabled="isSending"
                @keyup.enter.exact.prevent="handleSendMessage"
                @focus="handleFocus"
                @blur="handleBlur"
              />
              <button 
                type="submit" 
                class="p-3.5 flex items-center justify-center shrink-0 border-0 cursor-pointer transition-all duration-250 group active:scale-95 shadow-xs chat-button-rounded"
                :class="newMessageText.trim() && !isSending 
                  ? 'bg-gradient-to-br from-primary via-primary to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 text-white hover:-translate-y-[1px]' 
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-neutral-700 cursor-not-allowed shadow-none border border-border-main/30'"
                :disabled="!newMessageText.trim() || isSending"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  class="w-4.5 h-4.5 transform transition-transform duration-250"
                  :class="{ 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rotate-12': newMessageText.trim() && !isSending }"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.967.96L5.003 12l-2.492 8.636a.75.75 0 0 0 .967.96L21.75 12 3.478 2.404Z" />
                </svg>
              </button>
            </form>
          </div>
        </template>

        <!-- EMPTY STATE (No selected chat room) -->
        <template v-else>
          <div class="flex-grow flex flex-col items-center justify-center p-8 text-center text-text-sub select-none bg-gradient-to-br from-slate-50/40 via-slate-100/10 to-indigo-50/5 dark:from-[#0a0a0a] dark:to-[#0c0c0c]">
            <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-primary/10 to-indigo-500/5 dark:from-primary/10 dark:to-indigo-500/20 flex items-center justify-center mb-5 border border-primary/10 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" class="w-10 h-10 text-primary animate-pulse">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025 10.314 10.314 0 0 1-2.286-2.25C1.761 15.305 1 13.73 1 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <h4 class="font-bold text-base text-text-main mb-2 tracking-tight">Hộp thư trò chuyện</h4>
            <p class="text-xs text-text-sub max-w-[280px] leading-relaxed">
              Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu trao đổi tin nhắn trực tiếp với khách thuê phòng của bạn.
            </p>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script src="./Chat.js"></script>

<style scoped>
main .chat-container-safe {
  padding: 0 !important;
}

main .chat-container-safe.keyboard-open {
  padding: 0 !important;
}

@media (min-width: 1024px) {
  main .chat-container-safe {
    padding: 0 !important;
  }
}

.chat-footer-safe {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px)) !important;
}

.keyboard-open .chat-footer-safe {
  padding-bottom: 1rem !important;
}

.bg-primary {
  background-color: var(--primary-color, #0066cc);
}

.text-primary {
  color: var(--primary-color, #0066cc);
}

/* Rounded overrides for v4 compatibility */
.chat-bubble-sent {
  border-radius: 18px 18px 4px 18px !important;
}

.chat-bubble-received {
  border-radius: 18px 18px 18px 4px !important;
}

.chat-input-rounded {
  border-radius: 22px !important;
}

.chat-button-rounded {
  border-radius: 18px !important;
}

/* Micro-animations */
@keyframes messageFadeIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-message-fade-in {
  animation: messageFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--border-color, #e5e7eb);
  border-radius: 99px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary, #9ca3af);
}
</style>
