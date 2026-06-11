<template>
  <div class="p-4 bg-bg-main min-h-full contracts-page">
    <PageHeader title="Hợp Đồng Thuê"
      subtitle="Quản lý hợp đồng cho thuê phòng, cấu hình phụ phí dịch vụ riêng biệt cho từng người ở"
      :icon="contractIcon" :showAdd="isLandlord" addText="Thêm"
      :disableAdd="false"
      searchPlaceholder="Tìm theo phòng, dãy trọ, khách thuê..." v-model="searchQuery" @add-click="openAddModal" />

    <!-- Contracts List -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
      <DataTable
        :headers="tableHeaders"
        :items="filteredContracts"
        :loading="loading"
        loadingText="Đang tải danh sách hợp đồng..."
        emptyText="Không tìm thấy hợp đồng nào."
        showPagination
        :page="page"
        :totalPages="totalPages"
        :totalElements="totalElements"
        unit="hợp đồng"
        clickable
        @change-page="changePage"
        @row-click="(item) => viewContractDetail(item.id)"
      />
    </div>

    <!-- Add Contract Modal -->
    <Modal v-if="showAddModal" title="Tạo Hợp Đồng Thuê Mới" maxWidth="lg" @close="closeModal">
      <!-- Cảnh báo nếu không có phòng trống -->
      <div v-if="vacantRooms.length === 0" class="p-6 text-center space-y-4">
        <div class="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-500 border border-amber-200 dark:border-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-sm sm:text-base font-bold text-text-main">Chưa Thể Tạo Hợp Đồng Mới</h3>
        <p class="text-xs text-text-sub max-w-md mx-auto leading-relaxed">
          Cần có ít nhất một <strong>phòng trống</strong> để tạo hợp đồng.
        </p>
        <div class="flex flex-col gap-3 pt-2 max-w-sm mx-auto">
          <div class="p-3 bg-slate-50 dark:bg-slate-900/40 border border-border-main rounded-xl flex items-center justify-between text-xs">
            <span class="text-text-sub font-semibold">Không có phòng trống</span>
            <FormButton @click="goToRooms" size="sm" variant="primary" class="!py-1.5 !px-3">Quản lý phòng</FormButton>
          </div>
        </div>
        <div class="pt-4 border-t border-border-main/50">
          <FormButton type="button" @click="closeModal" variant="secondary">Quay lại</FormButton>
        </div>
      </div>

      <form v-else @submit.prevent="saveContract">
        <!-- Chọn phòng và người ở -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <!-- Chọn phòng -->
            <FormSelect
              label="Chọn phòng trống"
              v-model="form.roomId"
              @change="onRoomChange"
              required
            >
              <option v-for="room in vacantRooms" :key="room.id" :value="room.id">
                Phòng {{ room.roomNumber }} - {{ room.boardingHouse.name }}
              </option>
            </FormSelect>
          </div>

          <!-- Chọn hoặc tạo người thuê -->
          <div>
            <div v-if="!showInlineTenantForm">
              <FormSelect
                label="Người thuê trọ"
                v-model="form.tenantId"
                :required="!showInlineTenantForm"
              >
                <option v-if="tenantsList.length === 0" value="" disabled>Chưa có khách thuê khả dụng</option>
                <option v-for="tenant in tenantsList" :key="tenant.id" :value="tenant.id">
                  {{ tenant.fullName }}
                </option>
              </FormSelect>
              <button
                type="button"
                @click="showInlineTenantForm = true"
                class="mt-1.5 text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Thêm tài khoản khách thuê mới
              </button>
            </div>

            <!-- Inline form tạo khách thuê mới -->
            <div v-else class="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 space-y-2.5">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Tạo tài khoản khách thuê mới
                </span>
                <button
                  type="button"
                  @click="showInlineTenantForm = false"
                  class="text-text-sub hover:text-text-main transition-colors p-0.5 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="grid grid-cols-1 gap-2">
                <div class="grid grid-cols-2 gap-2">
                  <FormInput
                    type="text"
                    label="Tên đăng nhập *"
                    v-model="inlineTenantForm.username"
                    placeholder="nguyenvana"
                    required
                  />
                  <FormInput
                    type="password"
                    label="Mật khẩu ban đầu *"
                    v-model="inlineTenantForm.password"
                    placeholder="Tối thiểu 6 ký tự"
                    required
                  />
                </div>
                <FormInput
                  type="text"
                  label="Họ và tên *"
                  v-model="inlineTenantForm.fullName"
                  placeholder="Nguyễn Văn A"
                  required
                />
                <div class="grid grid-cols-2 gap-2">
                  <FormInput
                    type="tel"
                    label="Số điện thoại"
                    v-model="inlineTenantForm.phone"
                    placeholder="0912345678"
                  />
                  <FormInput
                    type="email"
                    label="Email"
                    v-model="inlineTenantForm.email"
                    placeholder="example@email.com"
                  />
                </div>
                <FormInput
                  type="text"
                  label="Số CMND/CCCD"
                  v-model="inlineTenantForm.identityCard"
                  placeholder="Nhập số định danh cá nhân"
                />
                <div class="grid grid-cols-2 gap-2">
                  <FormInput
                    type="date"
                    label="Ngày cấp"
                    v-model="inlineTenantForm.idCardIssueDate"
                  />
                  <FormInput
                    type="text"
                    label="Nơi cấp"
                    v-model="inlineTenantForm.idCardIssuePlace"
                    placeholder="Cục Cảnh sát QLHC..."
                  />
                </div>
                <FormInput
                  type="text"
                  label="Hộ khẩu thường trú"
                  v-model="inlineTenantForm.permanentAddress"
                  placeholder="Địa chỉ thường trú ghi trên CCCD"
                />
              </div>

              <div class="flex gap-2 pt-1">
                <FormButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  @click="showInlineTenantForm = false"
                  class="flex-1"
                >Hủy</FormButton>
                <FormButton
                  type="button"
                  size="sm"
                  @click="createInlineTenant"
                  :disabled="inlineTenantLoading"
                  class="flex-1 flex items-center justify-center gap-1.5"
                >
                  <svg v-if="inlineTenantLoading" class="w-3.5 h-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ inlineTenantLoading ? 'Đang tạo...' : 'Tạo & chọn' }}
                </FormButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Đơn giá & Chỉ số Điện, Nước mặc định (Read-only inputs) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" v-if="selectedRoom">
          <div>
            <FormInput
              type="number"
              label="Đơn giá điện (đ/kWh)"
              :model-value="selectedRoom.boardingHouse.defaultElectricityRate"
              readonly
            />
          </div>

          <div>
            <FormInput
              type="text"
              label="Đơn giá nước (đ)"
              :model-value="formatMoney(selectedRoom.boardingHouse.defaultWaterRate) + (selectedRoom.boardingHouse.waterBillingType === 'BY_INDEX' ? ' đ/m³' : ' đ/người')"
              readonly
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" v-if="selectedRoom">
          <div>
            <FormInput
              type="number"
              label="Chỉ số điện đầu kỳ (kWh)"
              :model-value="selectedRoom.currentElectricityIndex"
              readonly
            />
          </div>

          <div v-if="selectedRoom.boardingHouse.waterBillingType === 'BY_INDEX'">
            <FormInput
              type="number"
              label="Chỉ số nước đầu kỳ (m³)"
              :model-value="selectedRoom.currentWaterIndex"
              readonly
            />
          </div>
        </div>

        <!-- Giá thuê và tiền đặt cọc -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <FormInput
              type="number"
              label="Giá thuê / tháng"
              v-model="form.contractedRoomPrice"
              readonly
              required
            />
          </div>

          <div>
            <FormInput
              type="number"
              label="Tiền đặt cọc"
              v-model="form.deposit"
              required
            />
          </div>

          <div>
            <FormInput
              type="number"
              label="Số người ở"
              v-model="form.numberOfTenants"
              min="1"
              required
            />
          </div>
        </div>

        <!-- Ngày thuê và Chu kỳ tính tiền -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <FormInput
              type="date"
              label="Ngày bắt đầu thuê"
              v-model="form.startDate"
              required
            />
          </div>

          <div>
            <FormInput
              type="date"
              label="Ngày hết hạn (Nếu có)"
              v-model="form.endDate"
            />
          </div>

          <div>
            <FormInput
              type="number"
              label="Ngày tính tiền cố định"
              v-model="form.fixedBillingDay"
              min="1"
              max="31"
              placeholder="Mặc định từ dãy trọ"
            />
          </div>
        </div>



        <!-- Dịch vụ phụ phí của dãy trọ -->
        <div class="mt-6 pt-4 border-t border-border-main mb-6">
          <h4 class="text-sm font-bold text-text-main mb-3">Phụ Phí & Dịch Vụ Áp Dụng:</h4>
          <div v-if="availableExtraFees.length === 0" class="text-xs text-text-sub italic">
            Dãy trọ này chưa được cấu hình dịch vụ phụ phí nào.
          </div>
          <div v-else class="flex flex-col gap-2.5">
            <div v-for="(ef, index) in availableExtraFees" :key="ef.id"
              class="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border border-border-main rounded-xl px-4 py-3">
              <Checkbox v-model="ef.selected" :label="ef.name" />

              <div class="text-sm font-bold text-primary">
                {{ formatMoney(ef.defaultPrice) }} đ/{{ ef.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}
              </div>
            </div>
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

<script src="./Contracts.js"></script>
