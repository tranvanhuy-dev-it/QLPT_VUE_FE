<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Header Block -->
    <div class="mb-6 pb-4 border-b border-border-main flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <FormButton @click="goBack" variant="secondary" class="!p-1.5">
          <AppIcon name="arrow-left" class="text-text-sub !w-4 !h-4" />
        </FormButton>
        <h2 class="text-base sm:text-xl font-bold text-text-main flex items-center gap-2 flex-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="text-primary w-5 h-5 shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          <span>Cài đặt & Quyền riêng tư</span>
        </h2>
      </div>
    </div>

    <!-- Main Container -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <!-- Left Column: Tab Menu Selector -->
      <div class="md:col-span-1">
        <div class="bg-card border border-border-main rounded-2xl p-3 shadow-xs flex flex-col gap-1.5">
          <button 
            @click="activeTab = 'profile'"
            :class="['w-full text-left px-4 py-3 rounded-xl font-semibold text-xs transition-all duration-150 flex items-center gap-2.5 cursor-pointer',
              activeTab === 'profile' ? 'bg-primary text-white shadow-sm' : 'text-text-main hover:bg-slate-50 dark:hover:bg-slate-800']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span>Thông tin cá nhân</span>
          </button>

          <button 
            @click="activeTab = 'security'"
            :class="['w-full text-left px-4 py-3 rounded-xl font-semibold text-xs transition-all duration-150 flex items-center gap-2.5 cursor-pointer',
              activeTab === 'security' ? 'bg-primary text-white shadow-sm' : 'text-text-main hover:bg-slate-50 dark:hover:bg-slate-800']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <span>Đổi mật khẩu</span>
          </button>

          <button 
            @click="activeTab = 'sessions'"
            :class="['w-full text-left px-4 py-3 rounded-xl font-semibold text-xs transition-all duration-150 flex items-center gap-2.5 cursor-pointer',
              activeTab === 'sessions' ? 'bg-primary text-white shadow-sm' : 'text-text-main hover:bg-slate-50 dark:hover:bg-slate-800']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
            <span>Lịch sử đăng nhập & Thiết bị</span>
          </button>

          <button 
            @click="activeTab = 'preferences'"
            :class="['w-full text-left px-4 py-3 rounded-xl font-semibold text-xs transition-all duration-150 flex items-center gap-2.5 cursor-pointer',
              activeTab === 'preferences' ? 'bg-primary text-white shadow-sm' : 'text-text-main hover:bg-slate-50 dark:hover:bg-slate-800']"
          >
            <!-- Sun/Moon icon in menu -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21M4.978 4.978l1.59 1.59m10.864 10.864l1.59 1.59m-18 0l1.59-1.59m10.864-10.864l1.59-1.59M3 12h2.25m13.5 0H21M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
            </svg>
            <span>Tùy chọn hiển thị</span>
          </button>

          <button 
            v-if="isLandlord"
            @click="activeTab = 'imou'"
            :class="['w-full text-left px-4 py-3 rounded-xl font-semibold text-xs transition-all duration-150 flex items-center gap-2.5 cursor-pointer',
              activeTab === 'imou' ? 'bg-primary text-white shadow-sm' : 'text-text-main hover:bg-slate-50 dark:hover:bg-slate-800']"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.333-7.26 5.977 5.977 0 0 0-10.807-3.911C7.82 7.586 5.86 8.513 5.373 9.91A4.49 4.49 0 0 0 2.25 15Z" />
            </svg>
            <span>Cấu hình Imou Cloud</span>
          </button>
        </div>
      </div>

      <!-- Right Column: Settings Forms -->
      <div class="md:col-span-3">
        <!-- 1. TAB: PROFILE SETTINGS -->
        <div v-if="activeTab === 'profile'" class="bg-card border border-border-main rounded-2xl p-5 shadow-xs animate-in fade-in duration-200">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
            <span>Cập nhật Thông tin cá nhân</span>
          </h3>

          <div v-if="loadingProfile" class="flex justify-center items-center py-12">
            <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <form v-else @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                type="text"
                label="Họ và tên"
                v-model="profileForm.fullName"
                placeholder="Nhập họ và tên đầy đủ"
                required
              />
              <FormInput
                type="text"
                label="Tên tài khoản (Không thể sửa)"
                v-model="profileForm.username"
                disabled
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                type="email"
                label="Địa chỉ Email"
                v-model="profileForm.email"
                placeholder="example@domain.com"
              />
              <FormInput
                type="text"
                label="Số điện thoại"
                v-model="profileForm.phone"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                type="text"
                label="Số CCCD / CMND"
                v-model="profileForm.identityCard"
                placeholder="Nhập số CCCD"
              />
              <FormInput
                type="date"
                label="Ngày cấp"
                v-model="profileForm.idCardIssueDate"
              />
              <FormInput
                type="text"
                label="Nơi cấp"
                v-model="profileForm.idCardIssuePlace"
                placeholder="Nơi cấp CCCD"
              />
            </div>

            <FormInput
              type="text"
              label="Địa chỉ thường trú"
              v-model="profileForm.permanentAddress"
              placeholder="Nhập địa chỉ thường trú"
            />

            <div class="flex justify-end gap-3 pt-4 border-t border-border-main/50">
              <FormButton type="button" variant="secondary" @click="resetProfileForm">Đặt lại</FormButton>
              <FormButton type="submit" :loading="savingProfile" variant="primary">Lưu thông tin</FormButton>
            </div>
          </form>
        </div>

        <!-- 2. TAB: SECURITY SETTINGS -->
        <div v-if="activeTab === 'security'" class="bg-card border border-border-main rounded-2xl p-5 shadow-xs animate-in fade-in duration-200">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            <span>Thay đổi Mật khẩu bảo mật</span>
          </h3>

          <form @submit.prevent="savePassword" class="space-y-4 max-w-lg">
            <FormInput
              type="password"
              label="Mật khẩu hiện tại"
              v-model="passwordForm.oldPassword"
              placeholder="Nhập mật khẩu hiện tại để xác thực"
              required
            />
            <FormInput
              type="password"
              label="Mật khẩu mới"
              v-model="passwordForm.newPassword"
              placeholder="Tối thiểu 6 ký tự"
              required
            />
            <FormInput
              type="password"
              label="Xác nhận mật khẩu mới"
              v-model="passwordForm.confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              required
            />

          </form>
        </div>

        <!-- 5. TAB: LOGIN HISTORY & DEVICES -->
        <div v-if="activeTab === 'sessions'" class="bg-card border border-border-main rounded-2xl p-5 shadow-xs animate-in fade-in duration-200">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
            <span>Lịch sử đăng nhập & Thiết bị</span>
          </h3>

          <p class="text-[11px] text-text-sub mb-6 leading-relaxed">
            Danh sách các thiết bị đã và đang đăng nhập vào tài khoản của bạn. Bạn có thể đăng xuất (thu hồi quyền truy cập) từ xa cho các thiết bị lạ hoặc không còn sử dụng.
          </p>

          <div v-if="loadingSessions" class="flex justify-center items-center py-12">
            <div class="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div v-else-if="sessions.length === 0" class="text-center py-12 text-text-sub">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-semibold text-xs">Không có dữ liệu phiên đăng nhập nào</span>
          </div>

          <div v-else class="space-y-4">
            <div v-for="session in sessions" :key="session.id" 
              class="border border-border-main rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all duration-150"
              :class="session.current ? 'bg-primary/5 border-primary/20 shadow-xs' : 'bg-transparent'"
            >
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-main shrink-0 mt-0.5"
                  :class="session.current ? 'text-primary bg-primary/10' : ''"
                >
                  <svg v-if="formatUA(session.userAgent).toLowerCase().includes('iphone') || formatUA(session.userAgent).toLowerCase().includes('android') || formatUA(session.userAgent).toLowerCase().includes('ios')" 
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H13.5a2.25 2.25 0 0 1 2.25 2.25v16.5a2.25 2.25 0 0 1-2.25 2.25H10.5A2.25 2.25 0 0 1 8.25 20.25V3.75a2.25 2.25 0 0 1 2.25-2.25Z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                  </svg>
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-xs text-text-main">{{ formatUA(session.userAgent) }}</span>
                    <span v-if="session.current" class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary text-white tracking-wider">
                      Thiết bị này
                    </span>
                    <span v-else-if="session.active" class="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400">
                      Đang hoạt động
                    </span>
                  </div>
                  <div class="text-[10px] text-text-sub mt-1 space-y-0.5">
                    <p class="m-0 flex items-center gap-1">
                      <span class="font-semibold">IP:</span> 
                      <span class="font-mono">{{ session.ipAddress }}</span>
                    </p>
                    <p class="m-0 flex items-center gap-1">
                      <span class="font-semibold">Đăng nhập lúc:</span>
                      <span>{{ formatDateTime(session.loginTime) }}</span>
                    </p>
                    <p v-if="session.lastActivityTime" class="m-0 flex items-center gap-1">
                      <span class="font-semibold">Hoạt động cuối:</span>
                      <span>{{ formatDateTime(session.lastActivityTime) }}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div v-if="!session.current && session.active" class="flex items-center sm:self-center shrink-0">
                <FormButton 
                  @click="confirmRevoke(session.id)" 
                  variant="danger" 
                  class="!py-1.5 !px-3 !text-[10px] font-bold flex items-center gap-1 cursor-pointer animate-in fade-in duration-150"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12" />
                  </svg>
                  <span>Đăng xuất thiết bị</span>
                </FormButton>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. TAB: DISPLAY PREFERENCES -->
        <div v-if="activeTab === 'preferences'" class="bg-card border border-border-main rounded-2xl p-5 shadow-xs animate-in fade-in duration-200">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-2.22 4.582l1.252 1.254a3 3 0 0 0 4.242 0l1.252-1.254a3 3 0 0 0-2.22-4.582V2.25a.75.75 0 0 0-1.5 0v13.872Z" />
            </svg>
            <span>Tùy chọn Giao diện hiển thị</span>
          </h3>

          <div class="space-y-6 max-w-lg">
            <div class="flex flex-col gap-2">
              <span class="text-xs font-semibold text-text-main">Chế độ giao diện (Theme Mode)</span>
              <p class="text-[10px] text-text-sub leading-normal m-0">
                Lựa chọn giữa giao diện sáng tinh gọn hoặc tối dịu mắt để phù hợp hơn với điều kiện ánh sáng xung quanh của bạn.
              </p>
              
              <div class="grid grid-cols-2 gap-4 mt-3">
                <!-- Light Mode Option Card -->
                <div 
                  @click="setTheme('light')"
                  :class="['border rounded-2xl p-4 cursor-pointer text-center transition-all duration-150 flex flex-col items-center justify-center gap-2.5 min-h-[100px]',
                    theme === 'light' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border-main hover:bg-slate-50 dark:hover:bg-slate-800']"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-amber-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21M4.978 4.978l1.59 1.59m10.864 10.864l1.59 1.59m-18 0l1.59-1.59m10.864-10.864l1.59-1.59M3 12h2.25m13.5 0H21M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
                  </svg>
                  <span class="font-bold text-xs text-text-main">Giao diện Sáng</span>
                </div>

                <!-- Dark Mode Option Card -->
                <div 
                  @click="setTheme('dark')"
                  :class="['border rounded-2xl p-4 cursor-pointer text-center transition-all duration-150 flex flex-col items-center justify-center gap-2.5 min-h-[100px]',
                    theme === 'dark' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border-main hover:bg-slate-50 dark:hover:bg-slate-800']"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-sky-400">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                  <span class="font-bold text-xs text-text-main">Giao diện Tối</span>
                </div>
              </div>
            </div>

            <!-- Font Size Option -->
            <div class="flex flex-col gap-2 border-t border-border-main/50 pt-5 mt-5 animate-in fade-in duration-200">
              <span class="text-xs font-semibold text-text-main">Cỡ chữ hiển thị (Font Size)</span>
              <p class="text-[10px] text-text-sub leading-normal m-0">
                Điều chỉnh kích thước chữ của toàn bộ hệ thống để tối ưu khả năng đọc thông tin.
              </p>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <!-- Small Size -->
                <div 
                  @click="setFontSize('small')"
                  :class="['border rounded-xl p-3 cursor-pointer text-center transition-all duration-150 flex flex-col items-center justify-center gap-1.5 min-h-[80px]',
                    fontSize === 'small' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border-main hover:bg-slate-50 dark:hover:bg-slate-800']"
                >
                  <span class="text-[11px] text-text-main font-normal">A</span>
                  <span class="font-bold text-[10px] text-text-main">Nhỏ</span>
                </div>

                <!-- Medium Size -->
                <div 
                  @click="setFontSize('medium')"
                  :class="['border rounded-xl p-3 cursor-pointer text-center transition-all duration-150 flex flex-col items-center justify-center gap-1.5 min-h-[80px]',
                    fontSize === 'medium' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border-main hover:bg-slate-50 dark:hover:bg-slate-800']"
                >
                  <span class="text-[13px] text-text-main font-normal">A</span>
                  <span class="font-bold text-[10px] text-text-main">Vừa (Mặc định)</span>
                </div>

                <!-- Large Size -->
                <div 
                  @click="setFontSize('large')"
                  :class="['border rounded-xl p-3 cursor-pointer text-center transition-all duration-150 flex flex-col items-center justify-center gap-1.5 min-h-[80px]',
                    fontSize === 'large' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border-main hover:bg-slate-50 dark:hover:bg-slate-800']"
                >
                  <span class="text-[15px] text-text-main font-normal">A</span>
                  <span class="font-bold text-[10px] text-text-main">Lớn</span>
                </div>

                <!-- Extra Large Size -->
                <div 
                  @click="setFontSize('xlarge')"
                  :class="['border rounded-xl p-3 cursor-pointer text-center transition-all duration-150 flex flex-col items-center justify-center gap-1.5 min-h-[80px]',
                    fontSize === 'xlarge' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border-main hover:bg-slate-50 dark:hover:bg-slate-800']"
                >
                  <span class="text-[18px] text-text-main font-normal">A</span>
                  <span class="font-bold text-[10px] text-text-main">Rất lớn</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. TAB: IMOU CLOUD CONFIGURATION -->
        <div v-if="activeTab === 'imou' && isLandlord" class="bg-card border border-border-main rounded-2xl p-5 shadow-xs animate-in fade-in duration-200">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-5 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.333-7.26 5.977 5.977 0 0 0-10.807-3.911C7.82 7.586 5.86 8.513 5.373 9.91A4.49 4.49 0 0 0 2.25 15Z" />
            </svg>
            <span>Cấu hình Imou Cloud Developer</span>
          </h3>

          <div class="mb-5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            <p class="font-semibold mb-1 flex items-center gap-1.5 text-blue-900 dark:text-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-blue-600 dark:text-blue-400">
                <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" />
              </svg>
              Hướng dẫn kết nối tài khoản nhà phát triển Imou:
            </p>
            <ol class="list-decimal pl-4 space-y-1 mt-1.5 text-text-sub">
              <li>Truy cập cổng thông tin nhà phát triển Imou tại: <a href="https://open.imoulife.com" target="_blank" class="text-primary hover:underline font-semibold">https://open.imoulife.com</a> và đăng ký tài khoản.</li>
              <li>Tạo một ứng dụng (App) trong phần Console để lấy thông tin <strong>App ID</strong> và <strong>App Secret</strong>.</li>
              <li>Sao chép và dán hai mã khóa đó vào các trường bên dưới và bấm "Lưu cấu hình".</li>
            </ol>
          </div>

          <form @submit.prevent="saveImouSettings" class="space-y-4 max-w-lg">
            <FormInput
              type="text"
              label="Imou App ID"
              v-model="imouForm.imouAppId"
              placeholder="Nhập App ID được cấp từ Imou Console"
            />
            <FormInput
              type="password"
              label="Imou App Secret"
              v-model="imouForm.imouAppSecret"
              placeholder="Nhập App Secret được cấp từ Imou Console"
            />

            <div class="flex justify-end gap-3 pt-4 border-t border-border-main/50">
              <FormButton type="button" variant="secondary" @click="resetImouForm">Đặt lại</FormButton>
              <FormButton type="submit" :loading="savingImou" variant="primary">Lưu cấu hình</FormButton>
            </div>
          </form>
        </div>
      </div>
    </div>

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
  </div>
</template>

<script src="./Settings.js"></script>
