<template>
  <div class="h-full flex flex-col bg-bg-main p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] lg:p-6 overflow-hidden">
    <!-- Main Chat Workspace Card -->
    <div class="flex-1 bg-card border border-border-main rounded-2xl shadow-xs overflow-hidden flex flex-col lg:grid lg:grid-cols-12 min-h-0">
      
      <!-- LEFT COLUMN: Inbox Rooms List -->
      <div 
        class="col-span-12 lg:col-span-4 border-r border-border-main flex flex-col min-h-0 h-full"
        :class="{ 'hidden lg:flex': mobileShowChat }"
      >
        <!-- Inbox Header -->
        <div class="p-4 border-b border-border-main flex items-center gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/10">
          <router-link 
            to="/landlord"
            class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-text-sub border-0 cursor-pointer flex items-center justify-center transition-colors"
            title="Quay lại Tổng quan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </router-link>
          <h2 class="text-base font-bold text-text-main flex items-center gap-2">
            Hộp thư trò chuyện
          </h2>
        </div>

        <!-- Room Items list -->
        <div class="flex-grow overflow-y-auto min-h-0 divide-y divide-border-main/40">
          <div v-if="loadingRooms" class="flex flex-col items-center justify-center py-12 gap-2 text-text-sub">
            <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs font-medium">Đang tải cuộc trò chuyện...</span>
          </div>

          <div v-else-if="rooms.length === 0" class="flex flex-col items-center justify-center py-16 px-4 text-center text-text-sub">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.083.185.13.39.13.606v5.367c0 .803-.65 1.45-1.45 1.45H5.25c-.803 0-1.45-.647-1.45-1.45V9.117c0-.216.047-.42.13-.606M20.25 8.511a2.625 2.625 0 0 0-5.228-.582v.003c0 .02-.008.037-.023.048L12 10.158l-3.007-2.18a.072.072 0 0 0-.023-.048v-.004A2.625 2.625 0 0 0 3.75 8.511m16.5 0v0a2.625 2.625 0 0 1-2.625 2.59H6.375A2.625 2.625 0 0 1 3.75 8.511" />
            </svg>
            <span class="text-xs font-semibold">Chưa có cuộc trò chuyện nào.</span>
            <p class="text-[11px] mt-1 text-slate-400">Các cuộc hội thoại sẽ tự động xuất hiện khi có hợp đồng thuê hoạt động.</p>
          </div>

          <div 
            v-else
            v-for="room in rooms" 
            :key="room.id"
            @click="selectRoom(room)"
            class="p-4 flex gap-3 cursor-pointer transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/40 relative select-none"
            :class="{ 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary': selectedRoom && selectedRoom.id === room.id }"
          >
            <!-- User initial avatar -->
            <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
              {{ room.tenant.fullName ? room.tenant.fullName.charAt(0).toUpperCase() : 'U' }}
            </div>

            <!-- Content preview -->
            <div class="flex-grow min-w-0">
              <div class="flex justify-between items-baseline mb-0.5">
                <span class="font-bold text-xs text-text-main truncate max-w-[150px]">{{ room.tenant.fullName }}</span>
                <span class="text-[10px] text-text-sub font-semibold">{{ formatTimeOnly(room.lastMessageTime) }}</span>
              </div>

              <p 
                class="text-xs text-text-sub truncate pr-4"
                :class="{ 'font-semibold text-text-main': room.unreadCount > 0 }"
              >
                {{ room.lastMessage || 'Chưa có tin nhắn nào...' }}
              </p>
            </div>

            <!-- Unread badge -->
            <div v-if="room.unreadCount > 0" class="absolute right-4 bottom-4 min-w-[16px] h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm leading-none border border-white dark:border-slate-900">
              {{ room.unreadCount }}
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Chat Details Frame -->
      <div 
        class="col-span-12 lg:col-span-8 flex flex-col min-h-0 h-full bg-slate-50/20 dark:bg-slate-900/5"
        :class="{ 'hidden lg:flex': !mobileShowChat, 'flex': mobileShowChat }"
      >
        <template v-if="selectedRoom">
          <!-- Chat box Header -->
          <div class="p-4 border-b border-border-main flex items-center justify-between shrink-0 bg-card z-10 shadow-xs">
            <div class="flex items-center gap-3">
              <!-- Back button -->
              <button 
                @click="mobileShowChat = false; selectedRoom = null"
                class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-text-sub border-0 cursor-pointer flex items-center justify-center transition-colors"
                title="Quay lại danh sách"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
              </button>
              
              <!-- Info -->
              <div>
                <h3 class="font-bold text-xs sm:text-sm text-text-main">
                  {{ selectedRoom.tenant.fullName }}
                </h3>
                <span class="text-[10px] sm:text-xs text-primary font-bold">
                  Trò chuyện trực tiếp
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <!-- Call button link -->
              <a 
                v-if="selectedRoom.tenant.phone"
                :href="`tel:${selectedRoom.tenant.phone}`"
                class="p-2 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100/80 rounded-xl text-emerald-600 transition-colors border border-emerald-500/10 flex items-center justify-center"
                title="Gọi điện"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-4.5 h-4.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a12.035 12.035 0 0 1-7.147-7.147c-.155-.441.011-.928.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
              </a>
              
              <!-- Profile link -->
              <router-link
                :to="`/landlord/tenants/${selectedRoom.tenant.id}`"
                class="p-2 bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100/80 rounded-xl text-sky-600 transition-colors border border-sky-500/10 flex items-center justify-center"
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
            class="flex-grow overflow-y-auto p-4 space-y-3 min-h-0 flex flex-col"
          >
            <!-- Load older messages button -->
            <div v-if="hasMore" class="flex justify-center pb-2">
              <button 
                @click="loadMoreMessages" 
                class="px-4 py-1.5 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition rounded-full cursor-pointer"
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
                v-for="(msg, index) in currentRoomMessages" 
                :key="msg.id"
                class="flex flex-col max-w-[85%] sm:max-w-[70%]"
                :class="msg.senderUsername === currentUser?.username ? 'self-end items-end' : 'self-start items-start'"
              >
                <!-- Message bubble -->
                <div 
                  class="px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed break-words"
                  :class="msg.senderUsername === currentUser?.username 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-card border border-border-main text-text-main rounded-tl-none'"
                >
                  {{ msg.content }}
                </div>
                
                <!-- Time stamp -->
                <span class="text-[9px] text-text-sub font-semibold mt-1 px-1">
                  {{ formatMessageTime(msg.createdAt) }}
                </span>
              </div>
            </template>
          </div>

          <!-- Message Input area -->
          <div class="p-4 border-t border-border-main bg-card shrink-0">
            <form @submit.prevent="handleSendMessage" class="flex items-center gap-2">
              <input 
                v-model="newMessageText"
                type="text" 
                placeholder="Nhập tin nhắn..." 
                class="flex-grow bg-slate-50 dark:bg-slate-900 border border-border-main rounded-xl px-4 py-2.5 text-xs text-text-main focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                :disabled="isSending"
                @keyup.enter.exact.prevent="handleSendMessage"
              />
              <button 
                type="submit" 
                class="p-2.5 flex items-center justify-center shrink-0 border-0 cursor-pointer rounded-xl transition-all duration-200 group active:scale-95"
                :class="newMessageText.trim() && !isSending 
                  ? 'bg-gradient-to-br from-primary via-primary to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 text-white hover:-translate-y-[1px]' 
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-300 dark:text-neutral-600 cursor-not-allowed shadow-none'"
                :disabled="!newMessageText.trim() || isSending"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  class="w-4.5 h-4.5 transform transition-transform duration-200"
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
          <div class="flex-grow flex flex-col items-center justify-center p-8 text-center text-text-sub select-none">
            <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4 border border-border-main">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.2" stroke="currentColor" class="w-8 h-8 text-primary/80">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025 10.314 10.314 0 0 1-2.286-2.25C1.761 15.305 1 13.73 1 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
            </div>
            <h4 class="font-bold text-sm text-text-main mb-1">Bắt đầu trò chuyện</h4>
            <p class="text-xs max-w-[280px] leading-relaxed">
              Chọn một cuộc hội thoại từ danh sách bên trái để trao đổi tin nhắn trực tiếp với khách thuê phòng của bạn.
            </p>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script src="./Chat.js"></script>
