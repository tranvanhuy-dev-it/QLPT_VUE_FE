<template>
  <div class="p-4 bg-bg-main min-h-full">
    <PageHeader title="Hợp Đồng Thuê"
      subtitle="Quản lý hợp đồng cho thuê phòng, cấu hình phụ phí dịch vụ riêng biệt cho từng người ở"
      :icon="contractIcon" :showAdd="true" addText="Thêm"
      :disableAdd="vacantRooms.length === 0 || tenantsList.length === 0"
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
      <form @submit.prevent="saveContract">
        <!-- Chọn phòng và người ở -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
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

          <div>
            <FormSelect
              label="Người thuê trọ (Tenant)"
              v-model="form.tenantId"
              required
            >
              <option v-for="tenant in tenantsList" :key="tenant.id" :value="tenant.id">
                {{ tenant.fullName }} ({{ tenant.username }})
              </option>
            </FormSelect>
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
