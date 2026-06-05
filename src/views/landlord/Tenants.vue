<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <PageHeader 
      title="Tài Khoản Người Thuê" 
      subtitle="Cấp tài khoản đăng nhập để người ở có thể tự xem hóa đơn và chỉ số phòng mình" 
      :icon="tenantIcon"
      :showAdd="true"
      addText="Cấp Tài Khoản Mới"
      searchPlaceholder="Tìm theo tên, liên hệ..."
      v-model="searchQuery"
      @add-click="showAddModal = true"
    />

    <!-- Tenants List -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-4 text-text-sub">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Đang tải danh sách tài khoản người thuê...</span>
      </div>

      <div v-else>
        <div class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
          <table class="w-full text-sm text-left text-text-main border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
              <tr>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Tên tài khoản (username)</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Họ và tên</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Số điện thoại</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Email</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tenant in filteredTenants" :key="tenant.id" class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150">
                <td class="py-2.5 px-4 font-semibold text-primary">{{ tenant.username }}</td>
                <td class="py-2.5 px-4 font-medium">{{ tenant.fullName }}</td>
                <td class="py-2.5 px-4 text-text-sub">{{ tenant.phone || '-' }}</td>
                <td class="py-2.5 px-4 text-text-sub">{{ tenant.email || '-' }}</td>
                <td class="py-2.5 px-4">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', tenant.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400']">
                    {{ tenant.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa' }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredTenants.length === 0">
                <td colspan="5" class="text-center text-text-sub py-12">
                  Không tìm thấy tài khoản người thuê trọ nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-border-main/50">
          <span class="text-xs text-text-sub">
            Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} tài khoản)
          </span>
          <div class="flex gap-2">
            <button class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150" :disabled="page === 0" @click="changePage(page - 1)">
              Trước
            </button>
            <button class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150" :disabled="page >= totalPages - 1" @click="changePage(page + 1)">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Tenant Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-card border border-border-main rounded-2xl shadow-lg w-full max-w-[500px] p-6 relative">
        <h3 class="text-lg font-bold text-text-main mb-6">Cấp Tài Khoản Cho Người Ở</h3>
        
        <form @submit.prevent="createTenantAccount">
          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-semibold text-text-sub uppercase">Tên đăng nhập *</label>
            <input type="text" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.username" placeholder="Ví dụ: nguyenvanan (viết liền không dấu)" required />
          </div>

          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-semibold text-text-sub uppercase">Mật khẩu ban đầu *</label>
            <input type="password" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.password" placeholder="Tối thiểu 6 ký tự" required />
          </div>

          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-semibold text-text-sub uppercase">Họ và tên người thuê *</label>
            <input type="text" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.fullName" placeholder="Nhập tên đầy đủ người ở" required />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Số điện thoại</label>
              <input type="text" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.phone" placeholder="Số điện thoại liên hệ" />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Email</label>
              <input type="email" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.email" placeholder="Địa chỉ email" />
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-4">
            <button type="button" @click="closeModal" class="px-4 py-2 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all">Hủy</button>
            <button type="submit" class="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary-hover cursor-pointer transition-all">Tạo</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script src="./Tenants.js"></script>
