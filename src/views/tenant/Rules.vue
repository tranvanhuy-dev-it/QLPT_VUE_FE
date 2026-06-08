<template>
  <div class="p-6 bg-bg-main min-h-full">
    <PageHeader 
      title="Nội Quy Dãy Trọ" 
      subtitle="Tuân thủ nội quy giúp xây dựng môi trường sống văn minh, an toàn và hòa đồng" 
      :icon="rulesIcon"
      :showSearch="false"
    />

    <div>
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Đang tải nội quy...</span>
      </div>

      <div v-else>
        <!-- Not renting any room -->
        <div v-if="!activeContract" class="bg-card border border-border-main rounded-2xl p-12 text-center text-text-sub text-base font-semibold shadow-xs">
          ⚠️ Hiện tại tài khoản của bạn chưa được gắn vào hợp đồng thuê phòng nào. Vui lòng liên hệ chủ trọ để kích hoạt!
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <!-- Left/Main side: Rules Card -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-card border border-border-main rounded-2xl shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
              <!-- Header gradient bar -->
              <div class="h-2 bg-gradient-to-r from-primary to-sky-400"></div>
              
              <div class="p-6 md:p-8">
                <div class="flex items-center gap-3 border-b border-border-main/50 pb-6 mb-6">
                  <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-text-main">Quy định & Nội quy phòng trọ</h3>
                    <p class="text-xs text-text-sub">Áp dụng cho toàn bộ thành viên đang lưu trú tại dãy trọ</p>
                  </div>
                </div>

                <!-- Rules Content -->
                <div class="text-sm md:text-base text-text-main/90 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-5 md:p-6 border border-border-main/30 font-medium">
                  <div v-if="rules" class="space-y-4">
                    {{ rules }}
                  </div>
                  <div v-else class="text-center py-12 text-text-sub flex flex-col items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-text-sub/50">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    <span>Chủ trọ chưa cập nhật nội quy cụ thể cho dãy trọ này. Vui lòng tuân thủ các quy định văn hóa chung và liên hệ chủ trọ khi cần giải đáp thắc mắc.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right side: Info Card -->
          <div class="space-y-6">
            <!-- Boarding house detail summary -->
            <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200">
              <h4 class="text-xs font-bold text-primary uppercase tracking-wider mb-4">📍 Dãy Trọ Đang Thuê</h4>
              <div class="space-y-4 text-sm text-text-main">
                <div>
                  <div class="text-[11px] uppercase font-bold text-text-sub mb-0.5">Tên dãy trọ</div>
                  <div class="font-bold text-base text-text-main">{{ activeContract.room.boardingHouse.name }}</div>
                </div>
                <div class="border-t border-border-main/30 pt-3">
                  <div class="text-[11px] uppercase font-bold text-text-sub mb-0.5">Địa chỉ</div>
                  <div class="text-text-sub leading-normal">{{ activeContract.room.boardingHouse.address || 'Chưa cập nhật' }}</div>
                </div>
                <div class="border-t border-border-main/30 pt-3">
                  <div class="text-[11px] uppercase font-bold text-text-sub mb-0.5">Số phòng của bạn</div>
                  <div class="font-semibold text-text-main">Phòng {{ activeContract.room.roomNumber }}</div>
                </div>
              </div>
            </div>

            <!-- Landlord Contact info -->
            <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 bg-gradient-to-br from-card to-primary/5">
              <h4 class="text-xs font-bold text-success uppercase tracking-wider mb-4">📞 Hỗ Trợ & Liên Hệ</h4>
              <div class="space-y-3 text-sm text-text-main">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center font-bold text-sm shrink-0">
                    {{ activeContract.room.boardingHouse.landlord?.fullName?.charAt(0).toUpperCase() || 'C' }}
                  </div>
                  <div>
                    <div class="font-semibold text-text-main text-sm">{{ activeContract.room.boardingHouse.landlord?.fullName || 'Chủ trọ' }}</div>
                    <div class="text-[11px] text-text-sub">Người quản lý / Chủ dãy trọ</div>
                  </div>
                </div>
                
                <div class="border-t border-border-main/30 pt-3 flex flex-col gap-2">
                  <a v-if="activeContract.room.boardingHouse.landlord?.phone" 
                     :href="'tel:' + activeContract.room.boardingHouse.landlord?.phone" 
                     class="flex items-center gap-2.5 px-3 py-2 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 border border-border-main rounded-lg text-xs font-semibold text-text-main transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-success">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.194-4.174-7-7l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
                    </svg>
                    <span>Gọi điện: {{ activeContract.room.boardingHouse.landlord?.phone }}</span>
                  </a>
                  <a v-if="activeContract.room.boardingHouse.landlord?.email" 
                     :href="'mailto:' + activeContract.room.boardingHouse.landlord?.email" 
                     class="flex items-center gap-2.5 px-3 py-2 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 border border-border-main rounded-lg text-xs font-semibold text-text-main transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-primary">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    <span>Gửi email: {{ activeContract.room.boardingHouse.landlord?.email }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Rules.js"></script>
