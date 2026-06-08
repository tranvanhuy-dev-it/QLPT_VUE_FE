<template>
  <div class="p-6">
    <header class="flex justify-between items-center mb-6 pb-5 border-b border-border-main/50">
      <div>
        <h1 class="font-extrabold text-2xl text-text-main tracking-tight">Danh Sách Chủ Trọ</h1>
        <p class="text-xs text-text-sub mt-1">Quản lý và kiểm duyệt tài khoản đăng ký sử dụng hệ thống Nhà Trọ Thông Minh</p>
      </div>
    </header>

    <!-- Landlords Table Card -->
    <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
        <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Đang tải dữ liệu chủ trọ...</span>
      </div>

      <div v-else>
        <div class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
          <table class="w-full text-sm text-left text-text-main border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
              <tr>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Tên đăng nhập</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Họ và tên</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Số điện thoại</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Email</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Trạng thái</th>
                <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="landlord in landlords" :key="landlord.id" class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all duration-150">
                <td class="py-3.5 px-4 font-semibold text-indigo-600">{{ landlord.username }}</td>
                <td class="py-3.5 px-4 font-medium">{{ landlord.fullName }}</td>
                <td class="py-3.5 px-4 text-text-sub">{{ landlord.phone || '-' }}</td>
                <td class="py-3.5 px-4 text-text-sub">{{ landlord.email || '-' }}</td>
                <td class="py-3.5 px-4">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', 
                    landlord.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-950/35 dark:text-emerald-400' : 
                    (landlord.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-950/35 dark:text-amber-400' : 'bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-950/35 dark:text-rose-400')
                  ]">
                    {{ landlord.status === 'ACTIVE' ? 'Kích hoạt' : (landlord.status === 'PENDING' ? 'Chờ duyệt' : 'Bị Khóa') }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right flex justify-end gap-2">
                  <button 
                    @click="toggleStatus(landlord.id)" 
                    :class="['inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all duration-150', landlord.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/30' : 'bg-indigo-600 text-white hover:bg-indigo-700']"
                  >
                    {{ landlord.status === 'ACTIVE' ? 'Khóa' : (landlord.status === 'PENDING' ? 'Duyệt' : 'Mở khóa') }}
                  </button>
                  <button 
                    @click="resetPassword(landlord)"
                    class="inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all duration-150 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200/30"
                    title="Đặt lại mật khẩu về số điện thoại của chủ trọ"
                  >
                    Reset MK
                  </button>
                </td>
              </tr>
              <tr v-if="landlords.length === 0">
                <td colspan="6" class="text-center text-text-sub py-16">
                  Chưa có tài khoản chủ trọ nào đăng ký.
                </td>
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
              class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150" 
              :disabled="page === 0" 
              @click="changePage(page - 1)"
            >
              Trước
            </button>
            <button 
              class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150" 
              :disabled="page >= totalPages - 1" 
              @click="changePage(page + 1)"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./AdminDashboard.js"></script>
