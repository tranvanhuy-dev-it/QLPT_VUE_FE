<template>
  <div class="p-4 bg-bg-main min-h-full create-contract-page">
    <!-- Header Block -->
    <div class="mb-6 pb-4 border-b border-border-main flex items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <FormButton @click="goBack" variant="secondary" class="!p-1.5">
          <AppIcon name="arrow-left" class="!w-4 !h-4" />
        </FormButton>
        <h2 class="text-base sm:text-xl font-bold text-text-main">
          Tạo Hợp Đồng Thuê Mới
        </h2>
      </div>
      
      <!-- Top Actions -->
      <div v-if="vacantRooms.length > 0" class="flex items-center gap-2">
        <FormButton type="button" @click="goBack" variant="secondary" size="sm">Hủy</FormButton>
        <FormButton type="submit" form="create-contract-form" variant="primary" size="sm">Lưu hợp đồng</FormButton>
      </div>
    </div>

    <!-- Main Form Area -->
    <div class="w-full">
      <div v-if="loading && vacantRooms.length === 0" class="bg-card border border-border-main rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <span class="text-xs text-text-sub font-medium">Đang tải dữ liệu...</span>
      </div>

      <div v-else-if="vacantRooms.length === 0" class="bg-card border border-border-main rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center py-12 gap-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-text-sub opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <div>
          <h4 class="text-base font-bold text-text-main mb-1">Không có phòng trống nào khả dụng</h4>
          <p class="text-xs text-text-sub max-w-sm">Tất cả các phòng trong hệ thống đều đang được thuê. Vui lòng thêm phòng trống mới hoặc thanh lý hợp đồng hiện tại của một phòng để tiếp tục.</p>
        </div>
        <div class="flex gap-3 mt-4">
          <FormButton type="button" @click="goBack" variant="secondary">Quay lại</FormButton>
          <FormButton type="button" @click="goToRooms" variant="primary">Quản lý phòng trọ</FormButton>
        </div>
      </div>
      
      <form v-else id="create-contract-form" @submit.prevent="saveContract" class="space-y-6">
        <!-- Section 1: Room & Tenant -->
        <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-sub mb-4">1. Đối tượng hợp đồng</h3>
          
          <!-- Room selection -->
          <div class="mb-4">
            <FormSelect
              label="Chọn phòng trống"
              v-model="form.roomId"
              @change="onRoomChange"
              required
            >
              <option v-for="r in vacantRooms" :key="r.id" :value="r.id">
                Phòng {{ r.roomNumber }} - {{ r.boardingHouse.name }}
              </option>
            </FormSelect>
          </div>

          <!-- Tenant selection / creation -->
          <div class="border border-border-main/50 rounded-xl p-4 bg-slate-50/40 dark:bg-slate-900/10">
            <div v-if="!showInlineTenantForm">
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold text-text-main">Khách thuê đại diện</span>
                <button type="button" @click="showInlineTenantForm = true" class="text-xs font-semibold text-primary hover:underline cursor-pointer">
                  + Tạo tài khoản mới cho khách thuê
                </button>
              </div>
              
              <div v-if="tenantsList.length === 0" class="text-center py-6 bg-card border border-border-main/50 rounded-xl">
                <p class="text-xs text-text-sub mb-3">Không tìm thấy tài khoản người thuê trọ nào chưa có hợp đồng.</p>
                <FormButton type="button" size="sm" @click="goToTenants" variant="secondary">Quản lý người thuê</FormButton>
              </div>
              <FormSelect
                v-else
                v-model="form.tenantId"
                required
              >
                <option v-for="t in tenantsList" :key="t.id" :value="t.id">
                  {{ t.fullName }} ({{ t.username }}) {{ t.phone ? '- ' + t.phone : '' }}
                </option>
              </FormSelect>
            </div>

            <!-- Inline Tenant Form -->
            <div v-else class="space-y-4">
              <div class="flex justify-between items-center border-b border-border-main pb-2 mb-2">
                <span class="text-xs font-bold text-text-main">Tạo tài khoản khách thuê mới</span>
                <button type="button" @click="showInlineTenantForm = false" class="text-xs font-semibold text-primary hover:underline cursor-pointer" :disabled="inlineTenantLoading">
                  Chọn tài khoản có sẵn
                </button>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput type="text" label="Tên đăng nhập (username)" v-model="inlineTenantForm.username" placeholder="Ví dụ: nguyenvanan" required />
                <FormInput type="password" label="Mật khẩu" v-model="inlineTenantForm.password" placeholder="Tối thiểu 6 ký tự" required />
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput type="text" label="Họ và tên người thuê" v-model="inlineTenantForm.fullName" placeholder="Nhập tên đầy đủ" required />
                <FormInput type="text" label="Số điện thoại" v-model="inlineTenantForm.phone" placeholder="Số điện thoại liên hệ" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput type="email" label="Email" v-model="inlineTenantForm.email" placeholder="Địa chỉ email" />
                <FormInput type="text" label="Số CMND/CCCD" v-model="inlineTenantForm.identityCard" placeholder="Nhập số định danh cá nhân" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput type="date" label="Ngày cấp CCCD" v-model="inlineTenantForm.idCardIssueDate" />
                <FormInput type="text" label="Nơi cấp CCCD" v-model="inlineTenantForm.idCardIssuePlace" placeholder="Ví dụ: Cục Cảnh sát QLHC..." />
              </div>

              <FormInput type="text" label="Hộ khẩu thường trú" v-model="inlineTenantForm.permanentAddress" placeholder="Địa chỉ thường trú ghi trên CCCD" />
              
              <div class="flex justify-end gap-2 pt-2">
                <FormButton type="button" size="sm" variant="secondary" @click="showInlineTenantForm = false" :disabled="inlineTenantLoading">Quay lại</FormButton>
                <FormButton type="button" size="sm" @click="createInlineTenant" :loading="inlineTenantLoading">Tạo tài khoản</FormButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Contract Terms -->
        <div class="bg-card border border-border-main rounded-2xl p-5 shadow-xs">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-sub mb-4">2. Điều khoản thời hạn & Giá</h3>
          
          <!-- Contract dates -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FormInput type="date" label="Ngày bắt đầu thuê" v-model="form.startDate" required />
            <FormInput type="date" label="Ngày hết hạn (để trống nếu không thời hạn)" v-model="form.endDate" />
          </div>

          <!-- Price & Deposit -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FormInput type="number" label="Tiền đặt cọc (VNĐ)" v-model="form.deposit" min="0" required />
            <FormInput type="number" label="Giá thuê phòng thỏa thuận (đ/tháng)" v-model="form.contractedRoomPrice" min="0" required />
          </div>

          <!-- Occupants & Fixed billing day -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput type="number" label="Số người ở thực tế" v-model="form.numberOfTenants" min="1" required />
            <FormInput type="number" label="Ngày tính tiền cố định hàng tháng (1-31)" v-model="form.fixedBillingDay" min="1" max="31" placeholder="Để trống nếu tính theo ngày dọn vào" />
          </div>
        </div>

        <!-- Section 3: Extra Fees -->
        <div v-if="availableExtraFees.length > 0" class="bg-card border border-border-main rounded-2xl p-5 shadow-xs">
          <h3 class="text-xs font-bold uppercase tracking-wider text-text-sub mb-4">3. Phụ phí & Dịch vụ đi kèm</h3>
          <div class="flex flex-col gap-2.5">
            <div v-for="ef in availableExtraFees" :key="ef.id"
              class="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border border-border-main rounded-xl px-4 py-3">
              <Checkbox v-model="ef.selected" :label="ef.name" />
              <div class="flex items-center gap-2">
                <input type="number" v-model.number="ef.customPrice" min="0"
                  class="w-24 text-right border border-border-main rounded px-2 py-1 bg-card text-text-main text-xs font-bold outline-none focus:border-primary" />
                <span class="text-xs text-text-sub font-semibold">đ/{{ ef.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}</span>
              </div>
            </div>
          </div>
        </div>


      </form>
    </div>

    <!-- Confirm Modal -->
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

<script src="./CreateContract.js"></script>
