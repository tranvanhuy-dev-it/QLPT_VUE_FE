<template>
  <div class="p-4 bg-bg-main min-h-full">
    <PageHeader title="Quản Lý Phòng Trọ" subtitle="Thêm mới, sửa thông tin phòng trọ và theo dõi trạng thái phòng"
      :icon="roomIcon" :showAdd="true" addText="Thêm" :disableAdd="boardingHouses.length === 0"
      searchPlaceholder="Tìm theo số phòng..." v-model="searchQuery" @add-click="openAddModal">
      <template #filter-addons>
        <div class="flex items-center gap-1.5 sm:gap-2">
          <span class="font-medium text-[0.85rem] text-text-sub whitespace-nowrap hidden sm:inline">Dãy trọ:</span>
          <FormSelect
            v-model="selectedHouseId"
            @change="onHouseFilterChange"
            size="sm"
            class="w-[120px] sm:w-[200px]"
          >
            <option :value="null">-- Tất cả --</option>
            <option v-for="house in boardingHouses" :key="house.id" :value="house.id">
              {{ house.name }}
            </option>
          </FormSelect>
        </div>
      </template>
    </PageHeader>

    <!-- Rooms Table List -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
      <DataTable
        :headers="tableHeaders"
        :items="filteredRooms"
        :loading="loading"
        loadingText="Đang tải danh sách phòng..."
        emptyText="Không tìm thấy phòng trọ nào. Hãy tạo phòng trọ mới!"
        showPagination
        :page="page"
        :totalPages="totalPages"
        :totalElements="totalElements"
        unit="phòng"
        clickable
        @change-page="changePage"
        @row-click="editRoom"
      />
    </div>

    <!-- Add/Edit Room Modal -->
    <Modal v-if="showAddModal || showEditModal" :title="showEditModal ? 'Cập Nhật Phòng Trọ' : 'Thêm Phòng Trọ Mới'" maxWidth="md" @close="closeModal">
      <form @submit.prevent="saveRoom">
        <!-- Chọn dãy trọ khi thêm mới -->
        <div class="mb-4" v-if="!showEditModal">
          <FormSelect
            label="Chọn dãy trọ"
            v-model="form.boardingHouseId"
            required
          >
            <option v-for="house in boardingHouses" :key="house.id" :value="house.id">
              {{ house.name }}
            </option>
          </FormSelect>
        </div>

        <div class="mb-4">
          <FormInput
            type="text"
            label="Số phòng / Tên phòng"
            v-model="form.roomNumber"
            placeholder="Ví dụ: 101, 102"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <FormInput
              type="number"
              label="Giá thuê / tháng (VNĐ)"
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

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <FormInput
              type="number"
              label="Điện hiện tại"
              v-model="form.currentElectricityIndex"
              min="0"
              required
            />
          </div>

          <div>
            <FormInput
              type="number"
              label="Nước hiện tại"
              v-model="form.currentWaterIndex"
              min="0"
              required
            />
          </div>
        </div>

        <div class="flex justify-between items-center mt-6 pt-4 border-t border-border-main">
          <div>
            <FormButton
              v-if="showEditModal"
              type="button"
              @click="deleteRoom(editId)"
              variant="danger"
              :disabled="selectedRoom?.status === 'OCCUPIED'"
            >
              Xóa phòng
            </FormButton>
          </div>
          <div class="flex gap-3">
            <FormButton type="button" @click="closeModal" variant="secondary">Hủy</FormButton>
            <FormButton type="submit">Lưu</FormButton>
          </div>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script src="./Rooms.js"></script>
