<template>
  <div class="p-4 sm:p-6 md:p-8 bg-bg-main min-h-full flex flex-col gap-6">
    <!-- Header Block -->
    <div class="mb-2 pb-4 border-b border-border-main flex justify-between items-center flex-wrap gap-4">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-text-main flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-primary">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Cài Đặt Hệ Thống</span>
        </h2>
        <p class="text-[11px] text-text-sub mt-1">Cấu hình tài khoản ngân hàng nhận thanh toán gói cước và các thông tin liên hệ hỗ trợ của Admin.</p>
      </div>
    </div>

    <!-- Settings Card -->
    <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs max-w-xl w-full">
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-3 text-text-sub">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs">Đang tải cài đặt hệ thống...</span>
      </div>

      <form v-else @submit.prevent="saveSettings" class="space-y-5">
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-primary uppercase tracking-wider border-b border-border-main/50 pb-2">Thông tin thanh toán ngân hàng</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              type="text"
              label="Tên ngân hàng"
              v-model="form.bankName"
              placeholder="Ví dụ: VietinBank, MBBank,..."
              required
            />
            <FormInput
              type="text"
              label="Số tài khoản"
              v-model="form.bankAccount"
              placeholder="Nhập số tài khoản ngân hàng"
              required
            />
          </div>
          
          <FormInput
            type="text"
            label="Tên chủ tài khoản (Viết hoa không dấu)"
            v-model="form.accountName"
            placeholder="Ví dụ: TRAN VAN HUY"
            required
          />
        </div>

        <div class="space-y-4 pt-2">
          <h3 class="text-xs font-bold text-primary uppercase tracking-wider border-b border-border-main/50 pb-2">Thông tin liên hệ & hiển thị</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              type="text"
              label="Số điện thoại liên hệ"
              v-model="form.phone"
              placeholder="Ví dụ: 0365943254"
              required
            />
            <FormInput
              type="email"
              label="Email hỗ trợ"
              v-model="form.email"
              placeholder="Ví dụ: admin@gmail.com"
              required
            />
          </div>

          <FormInput
            type="text"
            label="Họ và tên người đại diện"
            v-model="form.fullName"
            placeholder="Ví dụ: Trần Văn Huy"
            required
          />
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-border-main/60">
          <FormButton type="submit" variant="primary" :loading="saving">
            Lưu cài đặt
          </FormButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script src="./AdminSettings.js"></script>
