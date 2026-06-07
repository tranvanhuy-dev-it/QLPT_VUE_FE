<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <PageHeader title="Tài Khoản Người Thuê"
      subtitle="Cấp tài khoản đăng nhập để người ở có thể tự xem hóa đơn và chỉ số phòng mình" :icon="tenantIcon"
      :showAdd="true" addText="Thêm" searchPlaceholder="Tìm theo tên, liên hệ..." v-model="searchQuery"
      @add-click="showAddModal = true" />

    <!-- Tenants List -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
      <DataTable
        :headers="tableHeaders"
        :items="filteredTenants"
        :loading="loading"
        loadingText="Đang tải danh sách tài khoản người thuê..."
        emptyText="Không tìm thấy tài khoản người thuê trọ nào."
        showPagination
        :page="page"
        :totalPages="totalPages"
        :totalElements="totalElements"
        unit="tài khoản"
        @change-page="changePage"
      >
        <template #cell(actions)="{ item }">
          <div class="flex justify-center">
            <button
              v-if="item.status === 'ACTIVE'"
              @click.stop="toggleTenantStatus(item)"
              :disabled="item.hasActiveContract"
              :title="item.hasActiveContract ? 'Tài khoản đang có hợp đồng hoạt động, không thể khóa' : 'Khóa tài khoản'"
              :class="item.hasActiveContract 
                ? 'text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50' 
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-600 dark:border-rose-400'"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border duration-150"
            >
              Khóa
            </button>
            <button
              v-else
              @click.stop="toggleTenantStatus(item)"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 duration-150"
            >
              Mở khóa
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Add Tenant Modal -->
    <Modal v-if="showAddModal" title="Cấp Tài Khoản Cho Người Ở" maxWidth="md" @close="closeModal">
      <form @submit.prevent="createTenantAccount">
        <div class="mb-4">
          <FormInput
            type="text"
            label="Tên đăng nhập"
            v-model="form.username"
            placeholder="Ví dụ: nguyenvanan (viết liền không dấu)"
            required
          />
        </div>

        <div class="mb-4">
          <FormInput
            type="password"
            label="Mật khẩu ban đầu"
            v-model="form.password"
            placeholder="Tối thiểu 6 ký tự"
            required
          />
        </div>

        <div class="mb-4">
          <FormInput
            type="text"
            label="Họ và tên người thuê"
            v-model="form.fullName"
            placeholder="Nhập tên đầy đủ người ở"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <FormInput
              type="text"
              label="Số điện thoại"
              v-model="form.phone"
              placeholder="Số điện thoại liên hệ"
            />
          </div>

          <div>
            <FormInput
              type="email"
              label="Email"
              v-model="form.email"
              placeholder="Địa chỉ email"
            />
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="closeModal" variant="secondary">Hủy</FormButton>
          <FormButton type="submit">Tạo</FormButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script src="./Tenants.js"></script>
