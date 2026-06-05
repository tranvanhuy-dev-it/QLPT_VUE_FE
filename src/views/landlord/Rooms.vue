<template>
  <div class="rooms-page">
    <PageHeader 
      title="Quản Lý Phòng Trọ" 
      subtitle="Thêm mới, sửa thông tin phòng trọ và theo dõi trạng thái phòng" 
      :icon="roomIcon"
      :showAdd="true"
      addText="Thêm Phòng Trọ Mới"
      :disableAdd="boardingHouses.length === 0"
      searchPlaceholder="Tìm theo số phòng..."
      v-model="searchQuery"
    >
      <template #filter-addons>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-left: auto;">
          <span style="font-weight: 500; font-size: 0.85rem; color: var(--text-secondary); white-space: nowrap;">Dãy trọ:</span>
          <select class="form-select" style="width: 200px; padding: 0.4rem 0.75rem; font-size: 0.85rem;" v-model="selectedHouseId" @change="onHouseFilterChange">
            <option :value="null">-- Tất cả dãy trọ --</option>
            <option v-for="house in boardingHouses" :key="house.id" :value="house.id">
              {{ house.name }}
            </option>
          </select>
        </div>
      </template>
    </PageHeader>

    <!-- Rooms Table List -->
    <div class="card">
      <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        Đang tải danh sách phòng...
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Dãy trọ</th>
                <th>Giá thuê cơ bản</th>
                <th>Chỉ số điện</th>
                <th>Chỉ số nước</th>
                <th>Sức chứa</th>
                <th>Trạng thái</th>
                <th style="text-align: right;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in filteredRooms" :key="room.id">
                <td style="font-weight: 600; color: var(--primary-color);">Phòng {{ room.roomNumber }}</td>
                <td>{{ room.boardingHouse.name }}</td>
                <td style="font-weight: 600;">{{ formatMoney(room.basePrice) }} VNĐ</td>
                <td>⚡ {{ room.currentElectricityIndex }} kWh</td>
                <td>💧 {{ room.currentWaterIndex }} m³</td>
                <td>👥 Tối đa {{ room.maxPeople }} người</td>
                <td>
                  <span :class="['badge', room.status === 'VACANT' ? 'badge-success' : 'badge-danger']">
                    {{ room.status === 'VACANT' ? 'Còn trống' : 'Đang thuê' }}
                  </span>
                </td>
                <td style="text-align: right; display: flex; gap: 0.25rem; justify-content: flex-end;">
                  <button @click="editRoom(room)" class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                    Sửa
                  </button>
                  <button @click="deleteRoom(room.id)" class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" :disabled="room.status === 'OCCUPIED'">
                    Xóa
                  </button>
                </td>
              </tr>
              <tr v-if="filteredRooms.length === 0">
                <td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                  Không tìm thấy phòng trọ nào. Hãy tạo phòng trọ mới!
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
          <span style="font-size: 0.875rem; color: var(--text-secondary);">
            Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} phòng)
          </span>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline" style="padding: 0.5rem 1rem;" :disabled="page === 0" @click="changePage(page - 1)">
              Trước
            </button>
            <button class="btn btn-outline" style="padding: 0.5rem 1rem;" :disabled="page >= totalPages - 1" @click="changePage(page + 1)">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Room Modal -->
    <div v-if="showAddModal || showEditModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div class="card" style="width: 100%; max-width: 500px; padding: 2rem; margin: 1rem; position: relative;">
        <h3 class="card-title">{{ showEditModal ? 'Cập Nhật Phòng Trọ' : 'Thêm Phòng Trọ Mới' }}</h3>
        
        <form @submit.prevent="saveRoom">
          <!-- Chọn dãy trọ khi thêm mới -->
          <div class="form-group" v-if="!showEditModal">
            <label class="form-label">Chọn dãy trọ *</label>
            <select class="form-select" v-model="form.boardingHouseId" required>
              <option v-for="house in boardingHouses" :key="house.id" :value="house.id">
                {{ house.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Số phòng / Tên phòng *</label>
            <input type="text" class="form-input" v-model="form.roomNumber" placeholder="Ví dụ: 101, 102" required />
          </div>

          <div class="grid grid-cols-2" style="gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Giá thuê mỗi tháng (VNĐ) *</label>
              <input type="number" class="form-input" v-model.number="form.basePrice" min="0" required />
            </div>

            <div class="form-group">
              <label class="form-label">Số người ở tối đa *</label>
              <input type="number" class="form-input" v-model.number="form.maxPeople" min="1" required />
            </div>
          </div>

          <div class="grid grid-cols-2" style="gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Chỉ số điện hiện tại *</label>
              <input type="number" class="form-input" v-model.number="form.currentElectricityIndex" min="0" required />
            </div>

            <div class="form-group">
              <label class="form-label">Chỉ số nước hiện tại *</label>
              <input type="number" class="form-input" v-model.number="form.currentWaterIndex" min="0" required />
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
            <button type="button" @click="closeModal" class="btn btn-outline">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script src="./Rooms.js"></script>
