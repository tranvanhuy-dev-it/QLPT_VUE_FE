<template>
  <div class="p-4 sm:p-6 md:p-8 bg-bg-main min-h-full flex flex-col gap-6">
    <!-- Header Block -->
    <div class="pb-4 border-b border-border-main flex justify-between items-center flex-wrap gap-4">
      <div>
        <h2 class="text-base sm:text-lg font-bold text-text-main flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-primary">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Lịch Sử Đăng Nhập Hệ Thống</span>
        </h2>
        <p class="text-[11px] text-text-sub mt-1">Giám sát và kiểm tra hoạt động đăng nhập của tất cả các tài khoản trên hệ thống.</p>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs flex flex-wrap gap-4 items-end">
      <!-- Search Input -->
      <div class="flex-grow min-w-[200px]">
        <label class="block text-[10px] font-bold text-text-sub uppercase tracking-wider mb-1.5">Tìm kiếm tài khoản</label>
        <div class="relative">
          <input 
            type="text" 
            v-model="filters.query" 
            @input="debouncedSearch"
            placeholder="Tìm theo username hoặc họ tên..." 
            class="w-full pl-8 pr-3 py-2 rounded-xl border border-border-main bg-white dark:bg-slate-900 text-text-main text-xs outline-none focus:border-primary transition-all"
          />
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-sub">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21-21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
          </span>
        </div>
      </div>

      <!-- Role Filter -->
      <div class="w-full sm:w-[160px]">
        <label class="block text-[10px] font-bold text-text-sub uppercase tracking-wider mb-1.5">Vai trò</label>
        <select 
          v-model="filters.role" 
          @change="fetchHistory"
          class="w-full px-3 py-2 rounded-xl border border-border-main bg-white dark:bg-slate-900 text-text-main text-xs outline-none focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị viên (Admin)</option>
          <option value="LANDLORD">Chủ trọ</option>
          <option value="TENANT">Người thuê</option>
        </select>
      </div>

      <!-- Active Status Filter -->
      <div class="w-full sm:w-[160px]">
        <label class="block text-[10px] font-bold text-text-sub uppercase tracking-wider mb-1.5">Trạng thái phiên</label>
        <select 
          v-model="filters.active" 
          @change="fetchHistory"
          class="w-full px-3 py-2 rounded-xl border border-border-main bg-white dark:bg-slate-900 text-text-main text-xs outline-none focus:border-primary transition-all cursor-pointer"
        >
          <option value="">Tất cả trạng thái</option>
          <option :value="true">Đang hoạt động</option>
          <option :value="false">Đã thu hồi / Hết hạn</option>
        </select>
      </div>

      <!-- Refresh Button -->
      <button 
        @click="fetchHistory" 
        class="btn btn-outline py-2 px-4 rounded-xl text-xs font-semibold border border-border-main hover:bg-border-main/20 flex items-center gap-1.5 h-[34px] cursor-pointer"
        title="Làm mới dữ liệu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        <span>Làm mới</span>
      </button>
    </div>

    <!-- Login History List Card -->
    <div class="bg-card border border-border-main rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3 text-text-sub">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs">Đang tải lịch sử đăng nhập...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="logs.length === 0" class="flex flex-col items-center justify-center py-20 text-center text-text-sub">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="font-semibold text-xs">Không tìm thấy bản ghi lịch sử đăng nhập nào</span>
        <span class="text-[10px] mt-0.5">Vui lòng điều chỉnh lại tiêu chí tìm kiếm/bộ lọc.</span>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
        <table class="w-full text-sm text-left border-collapse min-w-[700px]">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60 text-text-sub font-bold uppercase text-[11px] tracking-wider select-none">
              <th class="py-3 px-4">Tài khoản</th>
              <th class="py-3 px-4">Họ và tên</th>
              <th class="py-3 px-4">Vai trò</th>
              <th class="py-3 px-4">Thời gian</th>
              <th class="py-3 px-4">Địa chỉ IP</th>
              <th class="py-3 px-4">Thiết bị & Trình duyệt</th>
              <th class="py-3 px-4">Trạng thái phiên</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
              <td class="py-3.5 px-4 font-bold text-text-main">{{ log.username }}</td>
              <td class="py-3.5 px-4 font-medium text-text-main">{{ log.fullName || '-' }}</td>
              <td class="py-3.5 px-4">
                <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider',
                  log.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400' :
                  (log.role === 'LANDLORD' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400' : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400')
                ]">
                  {{ getRoleName(log.role) }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-text-sub whitespace-nowrap">{{ formatDateTime(log.loginTime) }}</td>
              <td class="py-3.5 px-4 text-text-main font-mono select-all">{{ log.ipAddress }}</td>
              <td class="py-3.5 px-4 text-text-main relative group" :title="log.userAgent">
                <span class="cursor-help border-b border-dotted border-text-sub">{{ formatUA(log.userAgent) }}</span>
              </td>
              <td class="py-3.5 px-4">
                <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold border',
                  log.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-slate-100 text-text-sub border-slate-200 dark:bg-slate-800 dark:text-text-sub dark:border-slate-700'
                ]">
                  {{ log.active ? 'Đang hoạt động' : 'Đã thu hồi / Hết hạn' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="logs.length > 0" class="p-4 border-t border-border-main/50 flex items-center justify-between flex-wrap gap-4 text-xs select-none">
        <span class="text-text-sub">
          Hiển thị bản ghi từ <strong>{{ pagination.start }}</strong> đến <strong>{{ pagination.end }}</strong> trên tổng số <strong>{{ pagination.totalElements }}</strong>
        </span>
        
        <div class="flex items-center gap-2">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 0"
            class="p-1.5 rounded-lg border border-border-main hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <span class="text-text-main font-semibold">Trang {{ currentPage + 1 }} / {{ pagination.totalPages }}</span>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage >= pagination.totalPages - 1"
            class="p-1.5 rounded-lg border border-border-main hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AdminLoginHistory.js"></script>
