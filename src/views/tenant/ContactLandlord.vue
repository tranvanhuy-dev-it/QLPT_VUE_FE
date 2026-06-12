<template>
  <div class="p-6 bg-bg-main min-h-full">
    <!-- Welcome Banner -->
    <div
      class="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-4 md:p-6 rounded-2xl mb-6 shadow-md shadow-indigo-500/20">
      <!-- Glow effect inside banner -->
      <div
        class="absolute -top-1/2 -right-10 w-[280px] h-[280px] bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none">
      </div>

      <div class="relative z-10">
        <span class="block text-xs uppercase tracking-widest opacity-90 font-semibold mb-1">Cổng hỗ trợ người thuê</span>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white leading-tight">Liên hệ chủ nhà</h1>
        <p class="text-sm opacity-85 mt-1">Thông tin liên lạc trực tiếp với chủ dãy trọ của bạn</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Đang tải thông tin liên hệ...</span>
    </div>

    <div v-else>
      <div v-if="!landlord"
        class="bg-card border border-border-main rounded-2xl p-12 text-center text-text-sub text-base font-semibold shadow-xs">
        ⚠️ Hiện tại tài khoản của bạn chưa được liên kết vào hợp đồng thuê phòng nào nên chưa có thông tin chủ nhà. Vui lòng liên hệ chủ trọ để kích hoạt!
      </div>

      <div v-else class="max-w-2xl mx-auto bg-card border border-border-main rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <!-- Landlord profile header with avatar -->
        <div class="relative bg-slate-50 dark:bg-slate-900/40 p-6 border-b border-border-main/60 flex flex-col sm:flex-row items-center gap-5">
          <div class="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold border border-primary/20 shrink-0 select-none">
            {{ landlordInitial }}
          </div>
          <div class="text-center sm:text-left">
            <h2 class="text-xl font-bold text-text-main leading-tight">{{ landlord.fullName || 'Chủ trọ chưa cập nhật tên' }}</h2>
            <p class="text-xs font-semibold text-primary uppercase tracking-wider mt-1.5">Chủ nhà trọ của bạn</p>
            <p class="text-xs text-text-sub mt-1">Đang thuê tại dãy: <span class="font-semibold text-text-main">{{ boardingHouseName }}</span></p>
          </div>
        </div>

        <!-- Contact Detail Items -->
        <div class="p-6 space-y-4">
          <!-- Phone Number Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-border-main rounded-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <AppIcon name="phone" size="md" />
              </div>
              <div>
                <span class="text-[10px] text-text-sub font-bold uppercase tracking-wider">Số điện thoại</span>
                <p class="text-sm font-bold text-text-main mt-0.5">{{ landlord.phone || 'Chưa cập nhật' }}</p>
              </div>
            </div>
            <div v-if="landlord.phone" class="flex flex-wrap gap-2">
              <a :href="'tel:' + landlord.phone" class="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg transition-colors shadow-xs">
                <AppIcon name="phone" size="sm" />
                Gọi điện
              </a>
              <button @click="copyToClipboard(landlord.phone, 'Số điện thoại')" class="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main px-3 py-2 rounded-lg transition-colors">
                Sao chép
              </button>
              <a :href="'https://zalo.me/' + landlord.phone" target="_blank" class="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40 px-3 py-2 rounded-lg transition-colors">
                Zalo
              </a>
              <button 
                @click="showChatPanel = !showChatPanel" 
                class="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors shadow-xs border-0 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.497c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                Nhắn tin trực tiếp
              </button>
            </div>
          </div>

          <!-- Email Address Row -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-border-main rounded-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <AppIcon name="mail" size="md" />
              </div>
              <div>
                <span class="text-[10px] text-text-sub font-bold uppercase tracking-wider">Địa chỉ Email</span>
                <p class="text-sm font-bold text-text-main mt-0.5">{{ landlord.email || 'Chưa cập nhật' }}</p>
              </div>
            </div>
            <div v-if="landlord.email" class="flex gap-2">
              <a :href="'mailto:' + landlord.email" class="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg transition-colors shadow-xs">
                Gửi Email
              </a>
              <button @click="copyToClipboard(landlord.email, 'Địa chỉ email')" class="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main px-3 py-2 rounded-lg transition-colors">
                Sao chép
              </button>
            </div>
          </div>

          <!-- Permanent Address Row -->
          <div class="flex items-start gap-3 p-4 bg-slate-50/50 dark:bg-slate-900/10 border border-border-main rounded-xl">
            <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <AppIcon name="map-pin" size="md" />
            </div>
            <div>
              <span class="text-[10px] text-text-sub font-bold uppercase tracking-wider">Văn phòng / Địa chỉ liên hệ</span>
              <p class="text-sm font-semibold text-text-main mt-0.5 leading-relaxed">{{ landlord.permanentAddress || 'Chưa cập nhật địa chỉ' }}</p>
            </div>
          </div>
        </div>

        <!-- Chat Panel (Direct Message) -->
        <div v-if="showChatPanel && currentRoom" class="border-t border-border-main flex flex-col h-[400px] bg-slate-50/10 dark:bg-slate-900/5">
          <!-- Chat header -->
          <div class="px-6 py-3 border-b border-border-main bg-slate-50/50 dark:bg-slate-900/10 flex items-center justify-between shrink-0">
            <span class="font-bold text-xs text-text-main">Hội thoại trực tiếp với chủ nhà</span>
            <button @click="showChatPanel = false" class="text-text-sub hover:text-text-main border-0 bg-transparent cursor-pointer flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Chat messages area -->
          <div ref="messageContainerRef" class="flex-grow overflow-y-auto p-6 space-y-3 min-h-0 flex flex-col">
            <!-- Load older messages button -->
            <div v-if="hasMore" class="flex justify-center pb-2">
              <button @click="loadMoreMessages" class="px-4 py-1.5 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition rounded-full cursor-pointer" :disabled="loadingMessages">
                Tải thêm tin nhắn cũ
              </button>
            </div>
            
            <div v-if="loadingMessages && currentRoomMessages.length === 0" class="flex justify-center py-6">
              <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Messages list -->
            <template v-else>
              <div v-for="msg in currentRoomMessages" :key="msg.id" class="flex flex-col max-w-[80%]" :class="msg.senderUsername === currentUser?.username ? 'self-end items-end ml-auto' : 'self-start items-start mr-auto'">
                <div class="px-3 py-2 rounded-2xl text-[12px] leading-relaxed break-words" :class="msg.senderUsername === currentUser?.username ? 'bg-primary text-white rounded-tr-none' : 'bg-card border border-border-main text-text-main rounded-tl-none'">
                  {{ msg.content }}
                </div>
                <span class="text-[9px] text-text-sub mt-1 px-1">{{ formatMessageTime(msg.createdAt) }}</span>
              </div>
            </template>
          </div>

          <!-- Input field -->
          <div class="p-4 border-t border-border-main bg-card shrink-0">
            <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
              <input v-model="newMessageText" type="text" placeholder="Nhập tin nhắn để gửi cho chủ nhà..." class="flex-grow bg-slate-50 dark:bg-slate-900 border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-main focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20" :disabled="isSending" @keyup.enter.exact.prevent="handleSendMessage" />
              <button type="submit" class="p-2.5 bg-primary hover:bg-primary-dark transition text-white rounded-xl flex items-center justify-center shrink-0 border-0 cursor-pointer shadow-xs disabled:opacity-50" :disabled="!newMessageText.trim() || isSending">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                  <path d="M3.478 2.404a.75.75 0 0 0-.967.96l5.003 9.135a.75.75 0 0 0 1.325-.006l4.947-9.135a.75.75 0 0 0-.974-.959L3.478 2.404Z" />
                  <path d="M12.958 8.64a.75.75 0 0 1-.085 1.056L7.54 13.5a.75.75 0 0 1-1.077-.107l-3.5-4.5a.75.75 0 1 1 1.186-.922l2.96 3.805 4.8-3.75a.75.75 0 0 1 1.047.114Z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Clipboard Alert Toast -->
    <Transition name="fade">
      <div v-if="toast.show" class="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-white/10 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 text-emerald-400">
          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script src="./ContactLandlord.js"></script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
