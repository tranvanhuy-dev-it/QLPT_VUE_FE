<template>
  <div class="h-full flex flex-col bg-bg-main px-4 pt-1 pb-4 lg:p-6 overflow-hidden chat-container-safe">
    <!-- Chat Container -->
    <div
      class="flex-grow bg-card border border-border-main rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-0 max-w-4xl mx-auto w-full">
      <!-- Loading Rooms State -->
      <div v-if="loadingRooms" class="flex-grow flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Đang kết nối cuộc trò chuyện...</span>
      </div>

      <template v-else-if="!currentRoom">
        <!-- Empty / No Landlord state -->
        <div class="flex-grow flex flex-col items-center justify-center p-8 text-center text-text-sub select-none">
          <div
            class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4 border border-border-main">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2"
              stroke="currentColor" class="w-8 h-8 text-primary/85 animate-pulse">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025 10.314 10.314 0 0 1-2.286-2.25C1.761 15.305 1 13.73 1 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <h4 class="font-bold text-sm text-text-main mb-1">Không tìm thấy thông tin chủ nhà</h4>
          <p class="text-xs max-w-[320px] leading-relaxed mb-4">
            Tài khoản của bạn chưa được liên kết với chủ nhà nào. Vui lòng liên hệ với chủ dãy trọ của bạn để được thêm
            vào hệ thống!
          </p>
          <router-link to="/tenant"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main rounded-xl text-xs font-bold no-underline transition-colors border border-border-main/40">
            Quay lại Tổng quan
          </router-link>
        </div>
      </template>

      <!-- Active Chat Interface -->
      <template v-else>
        <!-- Chat Header -->
        <div
          class="px-6 py-4 border-b border-border-main bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3.5">
            <!-- Back button -->
            <router-link to="/tenant"
              class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-text-sub border-0 cursor-pointer flex items-center justify-center transition-colors"
              title="Quay lại Tổng quan">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </router-link>

            <!-- Landlord Avatar -->
            <div
              class="w-11 h-11 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold flex items-center justify-center text-lg select-none">
              {{ landlordInfo?.fullName ? landlordInfo.fullName.charAt(0).toUpperCase() : 'L' }}
            </div>
            <div>
              <h3 class="font-bold text-sm text-text-main">
                {{ landlordInfo?.fullName || 'Chủ trọ / Quản lý' }}
              </h3>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-[10px] text-text-sub font-semibold tracking-wider uppercase">Chủ trọ của bạn</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Call Phone Link -->
            <a v-if="landlordInfo?.phone" :href="`tel:${landlordInfo.phone}`"
              class="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100/80 rounded-xl text-emerald-600 dark:text-emerald-400 transition-colors border border-emerald-500/10 flex items-center justify-center"
              title="Gọi điện trực tiếp">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2"
                stroke="currentColor" class="w-4.5 h-4.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 0 1-7.147-7.147c-.155-.441.011-.928.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Chat Messages Area -->
        <div ref="messageContainerRef"
          class="flex-grow overflow-y-auto p-6 space-y-4 min-h-0 flex flex-col bg-slate-50/10 dark:bg-slate-900/5">
          <!-- Load older messages button -->
          <div v-if="hasMore" class="flex justify-center pb-2">
            <button @click="loadMoreMessages"
              class="px-4 py-1.5 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition rounded-full cursor-pointer"
              :disabled="loadingMessages">
              <span v-if="loadingMessages">Đang tải tin nhắn cũ...</span>
              <span v-else>Tải thêm tin nhắn cũ</span>
            </button>
          </div>

          <div v-if="loadingMessages && currentRoomMessages.length === 0" class="flex justify-center py-12">
            <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- Messages List -->
          <template v-else>
            <div v-for="msg in currentRoomMessages" :key="msg.id" class="flex flex-col max-w-[85%] sm:max-w-[70%]"
              :class="msg.senderUsername === currentUser?.username ? 'self-end items-end ml-auto' : 'self-start items-start mr-auto'">
              <!-- Bubble -->
              <div
                class="px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words shadow-2xs transition-all duration-200"
                :class="msg.senderUsername === currentUser?.username
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-card border border-border-main text-text-main rounded-tl-none'">
                {{ msg.content }}
              </div>

              <!-- Time tag -->
              <span class="text-[9px] text-text-sub font-semibold mt-1 px-1">
                {{ formatMessageTime(msg.createdAt) }}
              </span>
            </div>
          </template>
        </div>

        <!-- Message Input Fofoter -->
        <div class="p-4 border-t border-border-main bg-card shrink-0">
          <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
            <input v-model="newMessageText" type="text" placeholder="Nhập nội dung tin nhắn gửi cho chủ nhà..."
              class="flex-grow bg-slate-50 dark:bg-slate-900 border border-border-main rounded-xl px-4 py-3 text-xs text-text-main focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-150"
              :disabled="isSending" @keyup.enter.exact.prevent="handleSendMessage" @focus="handleFocus" />
            <button type="submit"
              class="p-3 flex items-center justify-center shrink-0 border-0 cursor-pointer rounded-xl transition-all duration-200 group active:scale-95"
              :class="newMessageText.trim() && !isSending
                ? 'bg-gradient-to-br from-primary via-primary to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 text-white hover:-translate-y-[1px]'
                : 'bg-slate-100 dark:bg-slate-800/60 text-slate-300 dark:text-neutral-600 cursor-not-allowed shadow-none'"
              :disabled="!newMessageText.trim() || isSending">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                class="w-4.5 h-4.5 transform transition-transform duration-200"
                :class="{ 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rotate-12': newMessageText.trim() && !isSending }">
                <path
                  d="M3.478 2.404a.75.75 0 0 0-.967.96L5.003 12l-2.492 8.636a.75.75 0 0 0 .967.96L21.75 12 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>

<script src="./TenantChat.js"></script>

<style scoped>
/* Scoped styles for micro-animations and aesthetic refinements */
.chat-container-safe {
  padding-left: 1rem !important;
  padding-right: 1rem !important;
  padding-top: 0.5rem !important;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 24px)) !important;
}

@media (min-width: 1024px) {
  .chat-container-safe {
    padding: 1.5rem !important;
  }
}

.bg-primary {
  background-color: var(--primary-color, #4f46e5);
}

.hover\:bg-primary-dark:hover {
  background-color: var(--primary-dark, #4338ca);
}

.text-primary {
  color: var(--primary-color, #4f46e5);
}
</style>
