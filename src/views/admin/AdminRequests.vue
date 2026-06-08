<template>
  <div class="p-4 sm:p-6 md:p-8 bg-bg-main min-h-full flex flex-col gap-6">
    <!-- Header Block -->
    <div class="mb-2 pb-4 border-b border-border-main flex justify-between items-center flex-wrap gap-4">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-text-main flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-primary">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a6.002 6.002 0 0110.838 0H2.25zM12 18.75a6.002 6.002 0 0110.838 0H12zm0 0V1.5" />
          </svg>
          <span>Duyệt Kích Hoạt Gói Cước</span>
        </h2>
        <p class="text-[11px] text-text-sub mt-1">Quản lý và kích hoạt các gói cước dịch vụ nâng cấp của chủ trọ sau khi chuyển khoản.</p>
      </div>

      <!-- Quick status summary badge -->
      <div v-if="pendingCount > 0" class="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
        <span>Có {{ pendingCount }} yêu cầu chờ xử lý</span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs">
      <!-- Filters and Title header -->
      <div class="flex justify-between items-center mb-5 pb-3 border-b border-border-main/50 gap-4 flex-wrap">
        <h3 class="text-sm font-bold text-text-main m-0 flex items-center gap-2">
          <span>Danh Sách Yêu Cầu Chuyển Khoản</span>
        </h3>
        <div class="flex items-center gap-2">
          <span class="text-xs text-text-sub font-semibold">Trạng thái lọc:</span>
          <select 
            v-model="selectedRequestStatus" 
            @change="onStatusFilterChange"
            class="text-xs border border-border-main rounded-lg px-2.5 py-1.5 bg-card text-text-main outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="PENDING">Chờ duyệt (PENDING)</option>
            <option value="APPROVED">Đã duyệt (APPROVED)</option>
            <option value="REJECTED">Từ chối (REJECTED)</option>
            <option value="">Tất cả trạng thái</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Đang tải danh sách yêu cầu...</span>
      </div>

      <!-- Table Content -->
      <div v-else>
        <div class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
          <table class="w-full text-sm text-left text-text-main border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
              <tr class="text-[11px] uppercase tracking-wider text-text-sub font-bold">
                <th class="py-3 px-4">Chủ trọ / Tài khoản</th>
                <th class="py-3 px-4">Gói cước đăng ký</th>
                <th class="py-3 px-4">Số tiền thanh toán</th>
                <th class="py-3 px-4">Nội dung chuyển khoản</th>
                <th class="py-3 px-4">Ngày yêu cầu</th>
                <th class="py-3 px-4 text-right">Trạng thái / Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="req in requests" :key="req.id" class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all duration-150 text-xs">
                <td class="py-3.5 px-4">
                  <div class="font-bold text-primary">@{{ req.user?.username }}</div>
                  <div class="text-[10px] text-text-sub font-medium mt-0.5">{{ req.user?.fullName }}</div>
                </td>
                <td class="py-3.5 px-4 font-semibold text-text-main">Mua gói {{ req.months }} tháng</td>
                <td class="py-3.5 px-4 font-bold text-text-main">{{ formatMoney(req.amount) }} đ</td>
                <td class="py-3.5 px-4">
                  <span class="font-mono bg-slate-100 dark:bg-slate-800 border border-border-main/60 px-2.5 py-1.5 rounded text-xs text-text-main font-bold select-all">
                    {{ req.paymentContent }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-text-sub">{{ formatDateTime(req.createdAt) }}</td>
                <td class="py-3.5 px-4 text-right">
                  <!-- Actions for PENDING status -->
                  <div v-if="req.status === 'PENDING'" class="flex justify-end gap-2">
                    <FormButton 
                      @click="handleApproveRequest(req)" 
                      variant="primary" 
                      size="sm"
                      class="!px-3 !py-1 text-[10.5px]"
                    >
                      Duyệt gói
                    </FormButton>
                    <FormButton 
                      @click="handleRejectRequest(req)" 
                      variant="danger" 
                      size="sm"
                      class="!px-3 !py-1 text-[10.5px]"
                    >
                      Từ chối
                    </FormButton>
                  </div>
                  <!-- Status labels for APPROVED/REJECTED status -->
                  <div v-else class="flex justify-end">
                    <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border',
                      req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400'
                    ]">
                      {{ req.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối' }}
                    </span>
                  </div>
                </td>
              </tr>
              <tr v-if="requests.length === 0">
                <td colspan="6" class="text-center text-text-sub py-16 italic text-xs">
                  Không tìm thấy yêu cầu gia hạn nào ứng với trạng thái đã chọn.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-border-main/50">
          <span class="text-xs text-text-sub">
            Trang {{ requestsPage + 1 }} / {{ requestsTotalPages }} (Tổng số: {{ requestsTotalElements }} bản ghi)
          </span>
          <div class="flex gap-2">
            <button 
              class="px-3 py-1.5 border border-border-main rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-text-main"
              :disabled="requestsPage === 0" 
              @click="changeRequestsPage(requestsPage - 1)"
            >
              Trước
            </button>
            <button 
              class="px-3 py-1.5 border border-border-main rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-text-main"
              :disabled="requestsPage >= requestsTotalPages - 1" 
              @click="changeRequestsPage(requestsPage + 1)"
            >
              Sau
            </button>
          </div>
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

<script src="./AdminRequests.js"></script>
