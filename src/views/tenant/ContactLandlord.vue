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
