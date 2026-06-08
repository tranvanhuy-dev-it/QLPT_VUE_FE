<template>
  <header class="sticky top-0 h-16 bg-card border-b border-border-main flex items-center justify-between px-4 sm:px-6 md:px-8 z-30 shadow-xs shrink-0">
    <div class="flex items-center">
      <!-- Mobile Sidebar Toggle -->
      <button 
        @click="toggleSidebar" 
        class="lg:hidden p-1.5 rounded-lg text-text-sub hover:bg-slate-100 hover:text-text-main mr-2 cursor-pointer flex items-center justify-center shrink-0"
        title="Mở menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-1.5 sm:gap-2 text-[0.8rem] sm:text-[0.85rem] font-medium truncate">
        <span class="text-text-sub">{{ parentRoute }}</span>
        <span class="text-border-main">/</span>
        <span class="text-primary font-semibold">{{ currentRoute }}</span>
      </nav>
    </div>
    
    <div class="flex-1 max-w-[300px] md:max-w-[400px] mx-4 hidden md:block">
      <!-- Global Search -->
      <div class="relative w-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-1/2 -translate-y-1/2 w-[1.125rem] h-[1.125rem] text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" class="w-full pl-9 pr-4 py-2 border border-border-main bg-slate-50 dark:bg-slate-900 text-text-main text-[0.85rem] outline-none transition-all duration-150 focus:bg-white focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,102,204,0.08)]" placeholder="Tìm kiếm nhanh..." />
      </div>
    </div>
    
    <div class="flex items-center gap-2 sm:gap-4 shrink-0">
      <!-- Icon Utilities -->
      <button class="bg-transparent border-0 text-text-sub cursor-pointer p-1.5 relative flex items-center justify-center transition-all duration-150 hover:bg-slate-100 hover:text-text-main hidden sm:flex" title="Trợ giúp">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9.75h4.875a2.625 2.625 0 010 5.25H12M8.25 9.75v5.25m0-5.25h-1.5m1.5 5.25h-1.5m1.5 0h8.25m-11.25-10.5h15a2.25 2.25 0 012.25 2.25v13.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 015.25 3z" />
        </svg>
      </button>
      <button class="bg-transparent border-0 text-text-sub cursor-pointer p-1.5 relative flex items-center justify-center transition-all duration-150 hover:bg-slate-100 hover:text-text-main" title="Thông báo">
        <div class="absolute top-[3px] right-[3px] w-1.5 h-1.5 rounded-full bg-danger"></div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      <!-- Theme Toggle -->
      <button 
        @click="toggleTheme" 
        class="bg-transparent border-0 text-text-sub cursor-pointer p-1.5 flex items-center justify-center transition-all duration-150 hover:bg-slate-100 hover:text-text-main rounded-lg cursor-pointer"
        :title="theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
      >
        <!-- Sun icon (shown in dark mode) -->
        <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21M4.978 4.978l1.59 1.59m10.864 10.864l1.59 1.59m-18 0l1.59-1.59m10.864-10.864l1.59-1.59M3 12h2.25m13.5 0H21M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
        </svg>
        <!-- Moon icon (shown in light mode) -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      </button>
      
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
  </header>
</template>

<script src="./Header.js"></script>
