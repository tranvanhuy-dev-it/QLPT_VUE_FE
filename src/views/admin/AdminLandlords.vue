<template>
  <div class="p-4 sm:p-6 md:p-8 bg-bg-main min-h-full flex flex-col gap-6 relative">
    <!-- Header Block -->
    <div class="mb-2 pb-4 border-b border-border-main flex justify-between items-center flex-wrap gap-4">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-text-main flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-primary">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.978 11.978 0 0112 20.25a11.98 11.98 0 01-3-1.013v-.109m6 0a11.92 11.92 0 001.378-3.07M9 19.128v-.003c0-1.113.285-2.16.786-3.07M9 19.128v.109A11.978 11.978 0 016 20.25a11.98 11.98 0 01-3-1.013v-.109m6 0A11.92 11.92 0 004.12 19.128M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm6-3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <span>Quản Lý Tài Khoản Chủ Trọ</span>
        </h2>
        <p class="text-[11px] text-text-sub mt-1">Danh sách tất cả tài khoản chủ trọ đăng ký trên hệ thống. Nhấp vào dòng để xem chi tiết.</p>
      </div>
    </div>

    <!-- Landlord List Table -->
    <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs transition-all duration-300 w-full">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Đang tải danh sách chủ trọ...</span>
      </div>

      <div v-else>
        <div class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
          <table class="w-full text-sm text-left text-text-main border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
              <tr class="text-[11px] uppercase tracking-wider text-text-sub font-bold">
                <th class="py-3 px-4">Tên đăng nhập</th>
                <th class="py-3 px-4">Họ và tên</th>
                <th class="py-3 px-4">Liên hệ</th>
                <th class="py-3 px-4">Ngày đăng ký</th>
                <th class="py-3 px-4">Hạn sử dụng</th>
                <th class="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="item in landlords" 
                :key="item.id" 
                @click="selectLandlord(item)"
                :class="['border-b border-border-main/30 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors text-xs', 
                  selectedLandlord?.id === item.id ? 'bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary' : '']"
              >
                <td class="py-3 px-4 font-bold text-primary">{{ item.username }}</td>
                <td class="py-3 px-4 font-semibold text-text-main">{{ item.fullName }}</td>
                <td class="py-3 px-4">
                  <div class="text-[11px] text-text-main font-medium">{{ item.email || '-' }}</div>
                  <div class="text-[10px] text-text-sub mt-0.5">{{ item.phone || '-' }}</div>
                </td>
                <td class="py-3 px-4 text-text-sub">{{ formatDate(item.createdAt) }}</td>
                <td class="py-3 px-4">
                  <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border', getSubscriptionStatusInfo(item).badgeClass]">
                    {{ getSubscriptionStatusInfo(item).label }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span :class="['inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold', item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20']">
                    {{ item.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa' }}
                  </span>
                </td>
              </tr>
              <tr v-if="landlords.length === 0">
                <td colspan="6" class="text-center text-text-sub py-16 italic text-xs">Chưa có chủ trọ nào đăng ký.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-border-main/50">
          <span class="text-xs text-text-sub">
            Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} chủ trọ)
          </span>
          <div class="flex gap-2">
            <button 
              class="px-3 py-1.5 border border-border-main rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-text-main"
              :disabled="page === 0" 
              @click="changePage(page - 1)"
            >
              Trước
            </button>
            <button 
              class="px-3 py-1.5 border border-border-main rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-text-main"
              :disabled="page >= totalPages - 1" 
              @click="changePage(page + 1)"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: CHI TIẾT TÀI KHOẢN CHỦ TRỌ -->
    <Modal v-if="selectedLandlord" title="Chi Tiết Tài Khoản Chủ Trọ" maxWidth="md" @close="selectedLandlord = null">
      <div class="space-y-5">
        <!-- Details Info -->
        <div class="space-y-3.5 text-xs text-text-main">
          <div class="flex items-center gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {{ selectedLandlord.fullName ? selectedLandlord.fullName.charAt(0).toUpperCase() : 'L' }}
            </div>
            <div>
              <h4 class="font-bold text-sm">{{ selectedLandlord.fullName }}</h4>
              <p class="text-[10px] text-text-sub">Tên đăng nhập: @{{ selectedLandlord.username }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2">
            <div class="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-border-main/40">
              <span class="text-[10px] text-text-sub block mb-0.5">Số điện thoại:</span>
              <strong class="font-semibold text-[11px] block select-all">{{ selectedLandlord.phone || '-' }}</strong>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-border-main/40">
              <span class="text-[10px] text-text-sub block mb-0.5">Email liên hệ:</span>
              <strong class="font-semibold text-[11px] block select-all truncate" :title="selectedLandlord.email">{{ selectedLandlord.email || '-' }}</strong>
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-border-main/40 space-y-2.5">
            <div class="flex justify-between items-center text-[11px]">
              <span class="text-text-sub font-medium">Trạng thái:</span>
              <span :class="['font-bold px-2 py-0.5 rounded text-[10px]', selectedLandlord.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700']">
                {{ selectedLandlord.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang bị khóa' }}
              </span>
            </div>
            <div class="flex justify-between items-center text-[11px]">
              <span class="text-text-sub font-medium">Hạn sử dụng:</span>
              <strong class="font-semibold">{{ getSubscriptionStatusInfo(selectedLandlord).expiryDate || 'Không có' }}</strong>
            </div>
            <div class="flex justify-between items-center text-[11px]">
              <span class="text-text-sub font-medium">Gói cước:</span>
              <span :class="['font-bold px-1.5 py-0.5 rounded text-[9px] border', getSubscriptionStatusInfo(selectedLandlord).badgeClass]">
                {{ getSubscriptionStatusInfo(selectedLandlord).label }}
              </span>
            </div>
            <div class="flex justify-between items-center text-[11px]">
              <span class="text-text-sub font-medium">Ngày đăng ký:</span>
              <strong class="font-medium text-text-sub">{{ formatDate(selectedLandlord.createdAt) }}</strong>
            </div>
          </div>
        </div>

        <!-- Action Panel -->
        <div class="border-t border-border-main/60 pt-4 flex flex-col gap-2">
          <span class="text-[10px] font-bold text-text-sub uppercase tracking-wider mb-1">Hành động quản lý</span>
          
          <!-- Gia han -->
          <FormButton @click="openExtendModal" variant="primary" class="w-full justify-center text-xs py-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mr-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Gia hạn gói cước</span>
          </FormButton>

          <!-- Khoa / Mo khoa -->
          <FormButton 
            @click="toggleStatus(selectedLandlord)" 
            :variant="selectedLandlord.status === 'ACTIVE' ? 'secondary' : 'primary'"
            class="w-full justify-center text-xs py-2"
          >
            <svg v-if="selectedLandlord.status === 'ACTIVE'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mr-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mr-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h16.5m-16.5-12a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25v-12z" />
            </svg>
            <span>{{ selectedLandlord.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản' }}</span>
          </FormButton>

          <!-- Reset Mật khẩu -->
          <FormButton @click="resetPassword(selectedLandlord)" variant="danger" class="w-full justify-center text-xs py-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mr-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            <span>Reset mật khẩu</span>
          </FormButton>
        </div>
      </div>
    </Modal>

    <!-- MODAL: GIA HẠN THỦ CÔNG -->
    <Modal v-if="showExtendModal" title="Gia Hạn Gói Cước Thủ Công" maxWidth="sm" @close="showExtendModal = false">
      <div class="space-y-4">
        <div class="bg-slate-50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-border-main/50 text-xs">
          <div>Họ và tên: <strong class="text-text-main">{{ selectedLandlord?.fullName }}</strong></div>
          <div class="mt-1">Tài khoản: <strong class="text-text-main">@{{ selectedLandlord?.username }}</strong></div>
          <div class="mt-1">Hạn hiện tại: <strong class="text-text-main">{{ getSubscriptionStatusInfo(selectedLandlord).expiryDate || 'Đã hết hạn/Chưa có' }}</strong></div>
        </div>

        <div>
          <label class="text-xs font-bold text-text-main block mb-1.5">Chọn thời gian gia hạn:</label>
          <select 
            v-model="extendMonths" 
            class="w-full text-xs border border-border-main rounded-lg px-3 py-2 bg-card text-text-main outline-none focus:border-primary cursor-pointer"
          >
            <option :value="3">Gia hạn 3 Tháng (Cộng 90 ngày)</option>
            <option :value="6">Gia hạn 6 Tháng (Cộng 180 ngày)</option>
            <option :value="12">Gia hạn 12 Tháng (Cộng 360 ngày)</option>
            <option :value="24">Gia hạn 24 Tháng (Cộng 720 ngày)</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-border-main/60">
          <FormButton type="button" variant="secondary" @click="showExtendModal = false">Hủy</FormButton>
          <FormButton type="button" variant="primary" :loading="extending" @click="submitManualExtension">
            Xác nhận gia hạn
          </FormButton>
        </div>
      </div>
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
  </div>
</template>

<script src="./AdminLandlords.js"></script>
