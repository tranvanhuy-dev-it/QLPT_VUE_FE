<template>
  <div class="p-4 bg-bg-main min-h-full">
    <!-- Header Block -->
    <div class="mb-6 pb-4 border-b border-border-main flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <FormButton @click="goBack" variant="secondary" class="!p-1.5">
          <AppIcon name="arrow-left" class="text-text-sub !w-4 !h-4" />
        </FormButton>
        <h2 class="text-base sm:text-xl font-bold text-text-main flex items-center gap-2 flex-wrap">
          <span>Chi Tiết Phòng</span>
          <span v-if="room" class="text-primary">Phòng {{ room.roomNumber }}</span>
          <span v-if="room" :class="[
            'text-[11px] font-semibold px-2.5 py-0.5 rounded border',
            room.status === 'OCCUPIED'
              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
          ]">
            {{ room.status === 'OCCUPIED' ? 'Đang thuê' : 'Còn trống' }}
          </span>
        </h2>
      </div>

      <div v-if="room" class="flex flex-row items-center justify-between gap-2 w-full flex-nowrap">
        <!-- Tab Switcher -->
        <div class="flex border border-border-main rounded-lg p-0.5 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <button @click="activeTab = 'info'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'info' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Thông tin<span class="hidden sm:inline"> & Chỉnh sửa</span>
          </button>
          <button @click="activeTab = 'history'"
            :class="['px-3.5 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer', activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-primary shadow-xs' : 'text-text-sub hover:text-text-main']">
            Lịch sử<span class="hidden sm:inline"> thuê phòng</span>
          </button>
        </div>

        <!-- Action buttons on header -->
        <div v-if="activeTab === 'info'" class="flex items-center gap-1.5 shrink-0">
          <FormButton v-if="room.status !== 'OCCUPIED'" type="button" @click="deleteRoom" variant="danger" size="sm"
            class="!px-2.5 !py-1.5 flex items-center gap-1.5">
            <AppIcon name="trash" class="!w-4 !h-4" />
            <span class="hidden sm:inline">Xóa phòng</span>
          </FormButton>
          <FormButton type="button" @click="handleSave" variant="primary" size="sm"
            class="!px-2.5 !py-1.5 flex items-center gap-1.5">
            <AppIcon name="check-circle" class="!w-4 !h-4" />
            <span class="hidden sm:inline">Lưu thay đổi</span>
          </FormButton>
        </div>
      </div>
    </div>

    <!-- Loading Spinner -->
    <LoadingState v-if="loading" message="Đang tải dữ liệu phòng trọ..." />

    <!-- Main Content Area -->
    <div v-else-if="room" class="flex flex-col gap-4">
      <!-- INFO & EDIT TAB -->
      <div v-if="activeTab === 'info'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Edit Form -->
        <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs lg:col-span-2">
          <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-5 flex items-center gap-2">
            <AppIcon name="pencil" class="text-primary !w-4 !h-4" />
            <span>Chỉnh sửa thông tin phòng</span>
          </h3>

          <form @submit.prevent="handleSave" class="flex flex-col gap-4">
            <div>
              <FormInput
                type="text"
                label="Dãy trọ hiện tại (Không thể thay đổi)"
                :model-value="room.boardingHouse?.name"
                disabled
              />
            </div>

            <div>
              <FormInput
                type="text"
                label="Số phòng / Tên phòng"
                v-model="form.roomNumber"
                required
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  type="number"
                  label="Giá thuê cơ bản (VNĐ)"
                  v-model="form.basePrice"
                  min="0"
                  required
                />
              </div>

              <div>
                <FormInput
                  type="number"
                  label="Số người tối đa"
                  v-model="form.maxPeople"
                  min="1"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  type="number"
                  label="Chỉ số điện hiện tại (kWh)"
                  v-model="form.currentElectricityIndex"
                  min="0"
                  required
                />
              </div>

              <div>
                <FormInput
                  type="number"
                  label="Chỉ số nước hiện tại (m³)"
                  v-model="form.currentWaterIndex"
                  min="0"
                  required
                />
              </div>
            </div>
          </form>
        </div>

        <!-- Right: Fast Summary Stats -->
        <div class="flex flex-col gap-4">
          <!-- Overview Card -->
          <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs">
            <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-3 mb-4">Thông tin nhanh</h3>
            <div class="flex flex-col gap-4 text-xs">
              <div class="flex justify-between items-center py-1 border-b border-border-main/40">
                <span class="text-text-sub">Trạng thái:</span>
                <span :class="[
                  'font-semibold px-2 py-0.5 rounded text-[10px]',
                  room.status === 'OCCUPIED' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                ]">{{ room.status === 'OCCUPIED' ? 'Đang cho thuê' : 'Đang trống' }}</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-border-main/40">
                <span class="text-text-sub">Giá cơ bản:</span>
                <span class="font-bold text-text-main">{{ formatMoney(room.basePrice) }} đ/tháng</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-border-main/40">
                <span class="text-text-sub">Sức chứa:</span>
                <span class="font-semibold text-text-main">Tối đa {{ room.maxPeople }} người</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-border-main/40">
                <span class="text-text-sub">Dãy trọ:</span>
                <span class="font-semibold text-text-main text-right truncate max-w-[150px]"
                  :title="room.boardingHouse?.name">
                  {{ room.boardingHouse?.name }}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-text-sub">Địa chỉ:</span>
                <span class="font-semibold text-text-sub text-right truncate max-w-[150px]"
                  :title="room.boardingHouse?.address">
                  {{ room.boardingHouse?.address || '---' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Tip -->
          <div class="bg-[rgba(0,102,204,0.04)] border border-primary/20 rounded-2xl p-5">
            <h4 class="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
              <AppIcon name="info-circle" class="!w-4 !h-4" />
              <span>Lưu ý</span>
            </h4>
            <p class="text-[11px] leading-relaxed text-text-sub">
              Khi chỉnh sửa chỉ số điện/nước hiện tại của phòng, hệ thống sẽ sử dụng chỉ số này làm mốc tính chỉ số cũ
              cho lần lập hóa đơn tiền phòng tiếp theo.
            </p>
          </div>
        </div>
      </div>

      <!-- CONTRACT HISTORY TAB -->
      <div v-if="activeTab === 'history'" class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
        <div class="flex justify-between items-center mb-4 pb-2 border-b border-border-main/55">
          <h3 class="text-sm font-bold text-text-main flex items-center gap-2">
            <AppIcon name="contract" class="text-primary !w-4 !h-4" />
            <span>Danh sách hợp đồng thuê phòng</span>
          </h3>
          <span
            class="text-[11px] font-semibold text-text-sub px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
            Tổng cộng: {{ contracts.length }} hợp đồng
          </span>
        </div>

        <DataTable :headers="tableHeaders" :items="contracts" :loading="loading"
          loadingText="Đang tải lịch sử thuê phòng..." emptyText="Phòng trọ này chưa từng phát sinh hợp đồng thuê nào."
          clickable @row-click="viewContractDetails" />
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

<script src="./RoomDetail.js"></script>
