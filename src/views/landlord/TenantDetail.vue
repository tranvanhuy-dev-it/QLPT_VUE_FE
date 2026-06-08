<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Header Block -->
    <div class="mb-6 pb-4 border-b border-border-main flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <button @click="goBack"
          class="inline-flex items-center justify-center p-1.5 rounded-lg border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
            stroke="currentColor" class="w-4 h-4 text-text-sub">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 class="text-xl font-bold text-text-main flex items-center gap-2 flex-wrap">
          <span>Chi Tiết Người Thuê</span>
          <span v-if="tenant" class="text-primary">{{ tenant.fullName }}</span>
          <span v-if="tenant" :class="[
            'text-[11px] font-semibold px-2.5 py-0.5 rounded border',
            tenant.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
          ]">
            {{ tenant.status === 'ACTIVE' ? 'Hoạt động' : 'Đang khóa' }}
          </span>
        </h2>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading"
      class="bg-card border border-border-main rounded-xl flex justify-center items-center min-h-[300px] shadow-xs">
      <div class="text-center flex flex-col items-center gap-2">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div class="text-text-sub text-xs">Đang tải chi tiết tài khoản người thuê...</div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div v-else-if="tenant" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Detailed Info -->
      <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs lg:col-span-2">
        <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm-1.2 6.44a3 3 0 1 1-5.1 0 3 3 0 0 1 5.1 0Z" />
          </svg>
          <span>Thông tin hồ sơ người ở</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
          <div>
            <label class="block text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1">Tên đăng nhập (Username)</label>
            <div class="text-sm font-semibold text-text-main bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-border-main/50">
              {{ tenant.username }}
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1">Họ và tên</label>
            <div class="text-sm font-medium text-text-main bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-border-main/50">
              {{ tenant.fullName }}
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1">Số điện thoại</label>
            <div class="text-sm text-text-main bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-border-main/50">
              {{ tenant.phone || '-' }}
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1">Email</label>
            <div class="text-sm text-text-main bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-border-main/50">
              {{ tenant.email || '-' }}
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1">Số CMND/CCCD</label>
            <div class="text-sm text-text-main bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-border-main/50">
              {{ tenant.identityCard || '-' }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1">Ngày cấp</label>
              <div class="text-sm text-text-main bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-border-main/50">
                {{ formatDate(tenant.idCardIssueDate) }}
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1">Nơi cấp</label>
              <div class="text-sm text-text-main bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-border-main/50">
                {{ tenant.idCardIssuePlace || '-' }}
              </div>
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1">Hộ khẩu thường trú</label>
            <div class="text-sm text-text-main bg-slate-50 dark:bg-slate-900/40 px-3 py-2 rounded-lg border border-border-main/50">
              {{ tenant.permanentAddress || '-' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Account Status & Critical Actions -->
      <div class="flex flex-col gap-6">
        <!-- Status Card -->
        <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-4">Trạng thái tài khoản</h3>
          
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-xs text-text-sub">Trạng thái hoạt động</span>
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                tenant.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-950/35 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-950/35 dark:text-rose-400'
              ]">
                {{ tenant.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa' }}
              </span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-xs text-text-sub">Hợp đồng hoạt động</span>
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                tenant.hasActiveContract
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200/50 dark:bg-indigo-950/35 dark:text-indigo-400'
                  : 'bg-slate-50 text-slate-600 border-slate-200/50 dark:bg-slate-950/35 dark:text-slate-400'
              ]">
                {{ tenant.hasActiveContract ? 'Có hợp đồng' : 'Không có' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Card -->
        <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-4">Thao tác tài khoản</h3>
          
          <div class="flex flex-col gap-3">
            <button
              v-if="tenant.status === 'ACTIVE'"
              @click="handleToggleStatus"
              :disabled="tenant.hasActiveContract"
              :title="tenant.hasActiveContract ? 'Tài khoản đang có hợp đồng hoạt động, không thể khóa' : 'Khóa tài khoản'"
              :class="tenant.hasActiveContract 
                ? 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-600 cursor-not-allowed' 
                : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-950/40'"
              class="w-full flex items-center justify-center gap-2 py-2 px-4 border text-xs font-semibold rounded-lg transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <span>Khóa tài khoản</span>
            </button>
            
            <button
              v-else
              @click="handleToggleStatus"
              class="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-950/40 text-xs font-semibold rounded-lg transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              <span>Mở khóa tài khoản</span>
            </button>

            <button
              @click="handleResetPassword"
              class="w-full flex items-center justify-center gap-2 py-2 px-4 bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-950/40 text-xs font-semibold rounded-lg transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
              <span>Đặt lại mật khẩu</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Confirm Modal -->
    <ConfirmModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :type="confirmModal.type"
      :confirmText="confirmModal.confirmText"
      :cancelText="confirmModal.cancelText"
      :showCancel="confirmModal.showCancel"
      @confirm="onConfirmModal"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script src="./TenantDetail.js"></script>
