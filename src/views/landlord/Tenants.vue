<template>
  <div class="p-4 bg-bg-main min-h-full">
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
        :clickable="true"
        @change-page="changePage"
        @row-click="onRowClick"
      />
    </div>

    <!-- Add Tenant Modal -->
    <Modal v-if="showAddModal" title="Cấp Tài Khoản Cho Người Ở" maxWidth="md" @close="closeModal">
      <form @submit.prevent="createTenantAccount">
        <div class="mb-4">
          <FormInput type="text" label="Tên đăng nhập" v-model="form.username"
            placeholder="Ví dụ: nguyenvanan (viết liền không dấu)" required />
        </div>
        <div class="mb-4">
          <FormInput type="password" label="Mật khẩu ban đầu" v-model="form.password"
            placeholder="Tối thiểu 6 ký tự" required />
        </div>
        <div class="mb-4">
          <FormInput type="text" label="Họ và tên người thuê" v-model="form.fullName"
            placeholder="Nhập tên đầy đủ người ở" required />
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <FormInput type="text" label="Số điện thoại" v-model="form.phone"
              placeholder="Số điện thoại liên hệ" />
          </div>
          <div>
            <FormInput type="email" label="Email" v-model="form.email" placeholder="Địa chỉ email" />
          </div>
        </div>
        <div class="mb-4">
          <FormInput type="text" label="Số CMND/CCCD" v-model="form.identityCard"
            placeholder="Nhập số định danh cá nhân" />
        </div>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <FormInput type="date" label="Ngày cấp" v-model="form.idCardIssueDate" />
          </div>
          <div>
            <FormInput type="text" label="Nơi cấp" v-model="form.idCardIssuePlace"
              placeholder="Ví dụ: Cục Cảnh sát QLHC về TTXH" />
          </div>
        </div>
        <div class="mb-6">
          <FormInput type="text" label="Hộ khẩu thường trú" v-model="form.permanentAddress"
            placeholder="Địa chỉ thường trú ghi trên CCCD" />
        </div>
        <div class="flex gap-3 justify-end mt-4">
          <FormButton type="button" @click="closeModal" variant="secondary">Hủy</FormButton>
          <FormButton type="submit">Tạo</FormButton>
        </div>
      </form>
    </Modal>

    <!-- Custom Confirm Modal -->
    <ConfirmModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :type="confirmModal.type"
      :confirmText="confirmModal.confirmText"
      :cancelText="confirmModal.cancelText"
      :showCancel="confirmModal.showCancel"
      @confirm="onConfirmModal"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script src="./Tenants.js"></script>
