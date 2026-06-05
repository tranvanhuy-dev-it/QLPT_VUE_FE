<template>
  <div class="flex min-h-screen bg-bg-main">
    <!-- Sidebar -->
    <aside class="w-[280px] bg-card border-r border-border-main flex flex-col p-6 sticky top-0 h-screen shrink-0 shadow-xs justify-between">
      <div>
        <!-- Brand logotype -->
        <div class="flex items-center gap-3 mb-8">
          <div class="w-[38px] h-[38px] rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 font-black text-lg">
            A
          </div>
          <div class="flex flex-col">
            <h3 class="text-sm font-bold text-text-main leading-tight tracking-wider">ADMIN PORTAL</h3>
            <p class="text-[10px] text-text-sub uppercase font-semibold">Hệ thống quản lý</p>
          </div>
        </div>

        <nav class="flex flex-col gap-1.5">
          <router-link to="/admin" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-950/35 font-semibold text-sm transition-all duration-150 border-l-3 border-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-4.5 h-4.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Quản Lý Chủ Trọ</span>
          </router-link>
        </nav>
      </div>

      <button @click="logout" class="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-red-50 dark:hover:bg-red-950/35 hover:text-danger hover:border-danger/25 cursor-pointer transition-all duration-150">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Đăng Xuất</span>
      </button>
    </aside>

    <!-- Main Dashboard Area -->
    <main class="flex-1 p-8 overflow-y-auto">
      <header class="flex justify-between items-center mb-8 pb-5 border-b border-border-main/50">
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
                    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', landlord.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-950/35 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-950/35 dark:text-rose-400']">
                      {{ landlord.status === 'ACTIVE' ? 'Kích hoạt' : 'Bị Khóa' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button 
                      @click="toggleStatus(landlord.id)" 
                      :class="['inline-flex items-center px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all duration-150', landlord.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/30' : 'bg-indigo-600 text-white hover:bg-indigo-700']"
                    >
                      {{ landlord.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Kích hoạt lại' }}
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
    </main>
  </div>
</template>

<script src="./AdminDashboard.js"></script>
