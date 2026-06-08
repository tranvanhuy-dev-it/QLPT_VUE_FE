<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Header Block -->
    <div class="mb-6 pb-4 border-b border-border-main flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <FormButton @click="goBack" variant="secondary" class="!p-1.5">
          <AppIcon name="arrow-left" class="text-text-sub !w-4 !h-4" />
        </FormButton>
        <h2 class="text-base sm:text-xl font-bold text-text-main flex items-center gap-2 flex-wrap">
          <span></span>
          <span v-if="tenant" class="text-primary text-black">{{ tenant.fullName }}</span>
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
    <LoadingState v-if="loading" message="Đang tải chi tiết tài khoản người thuê..." />

    <!-- Main Content Area -->
    <div v-else-if="tenant" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Detailed Info -->
      <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs lg:col-span-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
          <DetailField label="Tên đăng nhập (Username)" :value="tenant.username" value-class="font-semibold" />

          <DetailField label="Họ và tên" :value="tenant.fullName" value-class="font-medium" />

          <DetailField label="Số điện thoại" :value="tenant.phone" />

          <DetailField label="Email" :value="tenant.email" />

          <DetailField label="Số CMND/CCCD" :value="tenant.identityCard" />

          <div class="grid grid-cols-2 gap-4">
            <DetailField label="Ngày cấp" :value="formatDate(tenant.idCardIssueDate)" />
            <DetailField label="Nơi cấp" :value="tenant.idCardIssuePlace" />
          </div>

          <DetailField label="Hộ khẩu thường trú" :value="tenant.permanentAddress" class="md:col-span-2" />
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
            <FormButton v-if="tenant.status === 'ACTIVE'" @click="handleToggleStatus"
              :disabled="tenant.hasActiveContract"
              :title="tenant.hasActiveContract ? 'Tài khoản đang có hợp đồng hoạt động, không thể khóa' : 'Khóa tài khoản'"
              variant="danger" class="w-full flex items-center justify-center gap-2">
              <AppIcon name="lock" class="!w-4 !h-4" />
              <span>Khóa tài khoản</span>
            </FormButton>

            <FormButton v-else @click="handleToggleStatus" variant="success"
              class="w-full flex items-center justify-center gap-2">
              <AppIcon name="lock-open" class="!w-4 !h-4" />
              <span>Mở khóa tài khoản</span>
            </FormButton>

            <FormButton @click="handleResetPassword" variant="warning"
              class="w-full flex items-center justify-center gap-2">
              <AppIcon name="key" class="!w-4 !h-4" />
              <span>Đặt lại mật khẩu</span>
            </FormButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Confirm Modal -->
    <ConfirmModal :show="confirmModal.show" :title="confirmModal.title" :message="confirmModal.message"
      :type="confirmModal.type" :confirmText="confirmModal.confirmText" :cancelText="confirmModal.cancelText"
      :showCancel="confirmModal.showCancel" @confirm="onConfirmModal" @cancel="closeConfirmModal" />
  </div>
</template>

<script src="./TenantDetail.js"></script>
