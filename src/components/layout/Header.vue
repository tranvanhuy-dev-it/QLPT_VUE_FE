<template>
  <header 
    class="sticky top-0 bg-card border-b border-border-main flex items-center justify-between px-4 sm:px-6 md:px-8 z-30 shadow-xs shrink-0 h-14 lg:h-16"
    :class="{ 'hidden lg:flex': hideOnMobile }"
  >
    <div class="flex items-center">
      <!-- Breadcrumbs (Hidden on mobile/tablet, shown on desktop) -->
      <nav class="hidden lg:flex items-center gap-1.5 sm:gap-2 text-[0.8rem] sm:text-[0.85rem] font-medium truncate">
        <span class="text-text-sub">{{ parentRoute }}</span>
        <span class="text-border-main">/</span>
        <span class="text-primary font-semibold">{{ currentRoute }}</span>
      </nav>

      <!-- Mobile Brand Logo & Name (Shown on mobile/tablet, hidden on desktop) -->
      <div @click="goToOverview" class="flex lg:hidden items-center gap-2 cursor-pointer hover:opacity-90 active:scale-98 transition-all duration-100 select-none">
        <img src="/logo.ico" alt="Logo" class="w-7 h-7 rounded object-contain" />
        <span class="text-sm font-bold text-primary leading-tight">Nhà Trọ Thông Minh</span>
      </div>
    </div>
    
    <div class="flex-1 max-w-[300px] md:max-w-[400px] mx-4 hidden md:block">
      <!-- Global Search -->
      <div class="relative w-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-[1.125rem] h-[1.125rem] text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" class="w-full pl-9 pr-4 py-2 border border-border-main bg-slate-50 dark:bg-slate-900 text-text-main text-[0.85rem] outline-none transition-all duration-150 focus:bg-white focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)]" placeholder="Tìm kiếm..." />
      </div>
    </div>
    
    <div class="flex items-center gap-2 sm:gap-4 shrink-0">
      <!-- Icon Utilities -->
      <button class="bg-transparent border-0 text-text-sub cursor-pointer p-1.5 relative flex items-center justify-center transition-all duration-150 hover:bg-slate-100 hover:text-text-main hidden sm:flex" title="Trợ giúp">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 010 5.25H12M8.25 9.75v5.25m0-5.25h-1.5m1.5 5.25h-1.5m1.5 0h8.25m-11.25-10.5h15a2.25 2.25 0 012.25 2.25v13.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 015.25 3z" />
        </svg>
      </button>
      <!-- Mobile Camera Button (Hidden on desktop, shown on mobile for Landlord/Tenant) -->
      <router-link 
        v-if="role === 'LANDLORD' || role === 'TENANT'"
        :to="role === 'LANDLORD' ? '/landlord/cameras' : '/tenant/cameras'"
        class="lg:hidden text-text-sub cursor-pointer p-1.5 relative flex items-center justify-center transition-all duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-main rounded-lg" 
        title="Hệ thống Camera"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </router-link>

      <!-- Notifications Dropdown Container -->
      <div class="relative notifications-dropdown-container flex items-center">
        <!-- Notification bell button -->
        <button 
          @click="toggleNotifications"
          class="bg-transparent border-0 text-text-sub cursor-pointer p-1.5 relative flex items-center justify-center transition-all duration-150 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-text-main rounded-lg" 
          title="Thông báo"
        >
          <!-- Unread count badge -->
          <div 
            v-if="unreadCount > 0" 
            class="absolute top-[1px] right-[1px] min-w-[14px] h-[14px] px-1 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center border border-white dark:border-slate-900 leading-none shadow-xs"
          >
            {{ unreadCount }}
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <!-- Dropdown Popover -->
        <div 
          v-if="showNotificationsDropdown" 
          class="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto top-16 sm:top-12 w-auto sm:w-96 bg-card border border-border-main rounded-2xl shadow-xl py-3 z-50 text-xs mt-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <!-- Header -->
          <div class="px-4 pb-2 border-b border-border-main flex items-center justify-between">
            <span class="font-bold text-[0.85rem] text-text-main">Thông báo</span>
            <button 
              v-if="unreadCount > 0"
              @click="markAllAsRead" 
              class="text-primary hover:underline font-semibold bg-transparent border-0 cursor-pointer"
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>

          <!-- Body list -->
          <div class="max-h-[360px] overflow-y-auto pr-0.5">
            <!-- Loading -->
            <div v-if="loadingNotifications" class="flex justify-center items-center py-8">
              <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center py-8 text-center text-text-sub">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-300 dark:text-slate-700 mb-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span>Không có thông báo nào</span>
            </div>

            <!-- Notification Items -->
            <div v-else class="divide-y divide-border-main/50">
              <div 
                v-for="notif in notifications" 
                :key="notif.id"
                @click="handleNotificationClick(notif)"
                class="px-3 sm:px-4 py-2.5 sm:py-3 flex gap-2.5 sm:gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors relative"
                :class="{'bg-primary/5 dark:bg-primary/5': !notif.isRead}"
              >
                <!-- Icon based on type -->
                <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" :class="getIconClass(notif.type)">
                  <svg v-if="notif.type === 'INVOICE_NEW'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <svg v-else-if="notif.type === 'PAYMENT_CONFIRMED'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else-if="notif.type === 'CONTRACT_ACTIVE'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0 pr-2">
                  <div class="font-bold text-text-main text-[0.8rem] truncate">{{ notif.title }}</div>
                  <div class="text-[0.75rem] text-text-sub line-clamp-2 mt-0.5 leading-relaxed">{{ notif.content }}</div>
                  <div class="text-[0.675rem] text-slate-400 mt-1 font-medium">{{ formatTime(notif.createdAt) }}</div>
                </div>

                <!-- Blue indicator for unread -->
                <div v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-primary absolute right-3 top-1/2 -translate-y-1/2 shrink-0"></div>
              </div>

              <!-- Load more button -->
              <div v-if="hasMore" class="p-2 border-t border-border-main/40 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                <button 
                  @click.stop="loadMoreNotifications"
                  class="w-full py-2 text-primary hover:text-primary-dark font-bold bg-transparent border-0 cursor-pointer flex items-center justify-center gap-1.5 text-[0.75rem]"
                  :disabled="loadingNotifications"
                >
                  <span v-if="loadingNotifications" class="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>Xem thêm thông báo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Dropdown Container -->
      <div class="relative profile-dropdown-container flex items-center border-l border-border-main pl-2 sm:pl-4">
        <!-- Dropdown trigger -->
        <div 
          @click="showDropdown = !showDropdown" 
          class="flex items-center gap-2 sm:gap-3 cursor-pointer py-1.5 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all duration-150 select-none border border-transparent hover:border-border-main/50"
        >
          <div class="w-8 h-8 rounded-full bg-sky-100 text-primary flex items-center justify-center font-bold text-[0.85rem] shrink-0 border border-primary/20">
            <span>{{ userInitial }}</span>
          </div>
          <div class="flex flex-col hidden sm:flex max-w-[110px] text-left">
            <span class="text-[0.825rem] font-semibold text-text-main truncate leading-snug">{{ username }}</span>
            <span class="text-[0.675rem] text-text-sub uppercase font-bold tracking-wide truncate mt-0.5">{{ roleLabel }}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3 text-text-sub transition-transform duration-200" :class="{'rotate-180': showDropdown}">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <!-- Dropdown Card -->
        <div 
          v-if="showDropdown" 
          class="absolute right-0 top-12 w-48 bg-card border border-border-main rounded-xl shadow-lg py-1.5 z-50 text-xs mt-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <button @click="openProfileModal" class="w-full text-left px-4 py-2.5 text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-text-sub">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span class="font-medium">Thông tin cá nhân</span>
          </button>
          
          <button @click="openPasswordModal" class="w-full text-left px-4 py-2.5 text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-text-sub">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <span class="font-medium">Đổi mật khẩu</span>
          </button>

          <!-- Gói dịch vụ - only for Landlord -->
          <button v-if="role === 'LANDLORD'" @click="navigateToUpgrade" class="w-full text-left px-4 py-2.5 text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-text-sub">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">Gói dịch vụ</span>
          </button>

          <!-- Chế độ tối/sáng -->
          <button @click="toggleTheme" class="w-full text-left px-4 py-2.5 text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-2">
            <!-- Sun icon (shown in dark mode) -->
            <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-text-sub">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21M4.978 4.978l1.59 1.59m10.864 10.864l1.59 1.59m-18 0l1.59-1.59m10.864-10.864l1.59-1.59M3 12h2.25m13.5 0H21M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
            </svg>
            <!-- Moon icon (shown in light mode) -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-text-sub">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            <span class="font-medium">{{ theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối' }}</span>
          </button>
          
          <div class="border-t border-border-main my-1"></div>
          
          <button @click="handleLogout" class="w-full text-left px-4 py-2.5 text-danger hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="font-bold">Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 1: THÔNG TIN CÁ NHÂN -->
    <Modal v-if="showProfileModal" title="Thông Tin Cá Nhân" maxWidth="sm" @close="showProfileModal = false">
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div>
          <FormInput
            type="text"
            label="Họ và tên"
            v-model="profileForm.fullName"
            placeholder="Nhập họ và tên của bạn"
            required
          />
        </div>
        <div>
          <FormInput
            type="email"
            label="Địa chỉ Email"
            v-model="profileForm.email"
            placeholder="example@domain.com"
          />
        </div>
        <div>
          <FormInput
            type="text"
            label="Số điện thoại"
            v-model="profileForm.phone"
            placeholder="Nhập số điện thoại liên hệ"
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-border-main">
          <FormButton type="button" variant="secondary" @click="showProfileModal = false">Đóng</FormButton>
          <FormButton type="submit" variant="primary">Lưu thay đổi</FormButton>
        </div>
      </form>
    </Modal>

    <!-- MODAL 2: ĐỔI MẬT KHẨU -->
    <Modal v-if="showPasswordModal" title="Đổi Mật Khẩu" maxWidth="sm" @close="showPasswordModal = false">
      <form @submit.prevent="savePassword" class="space-y-4">
        <div>
          <FormInput
            type="password"
            label="Mật khẩu hiện tại"
            v-model="passwordForm.oldPassword"
            placeholder="Nhập mật khẩu hiện tại"
            required
          />
        </div>
        <div>
          <FormInput
            type="password"
            label="Mật khẩu mới"
            v-model="passwordForm.newPassword"
            placeholder="Tối thiểu 6 ký tự"
            required
          />
        </div>
        <div>
          <FormInput
            type="password"
            label="Xác nhận mật khẩu mới"
            v-model="passwordForm.confirmPassword"
            placeholder="Nhập lại mật khẩu mới"
            required
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-border-main">
          <FormButton type="button" variant="secondary" @click="showPasswordModal = false">Hủy</FormButton>
          <FormButton type="submit" variant="primary">Đổi mật khẩu</FormButton>
        </div>
      </form>
    </Modal>

    <!-- CONFIRM MODAL -->
    <ConfirmModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :type="confirmModal.type"
      :confirm-text="confirmModal.confirmText"
      :cancel-text="confirmModal.cancelText"
      :show-cancel="confirmModal.showCancel"
      @confirm="onConfirmModal"
      @cancel="closeConfirmModal"
    />
  </header>
</template>

<script src="./Header.js"></script>
