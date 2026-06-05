<template>
  <div class="boarding-houses-page">
    <PageHeader 
      title="Quản Lý Dãy Trọ" 
      subtitle="Thêm mới và thiết lập đơn giá dịch vụ của từng khu nhà trọ" 
      :icon="houseIcon"
      :showAdd="true"
      addText="Thêm Dãy Trọ Mới"
      :showSearch="false"
      @add-click="showAddModal = true"
    />

    <!-- Grid of Boarding Houses -->
    <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
      Đang tải danh sách dãy trọ...
    </div>
    
    <template v-else>
      <div v-if="boardingHouses.length > 0" class="grid grid-cols-3">
        <div v-for="house in boardingHouses" :key="house.id" class="card" style="display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 0;">
          <div>
            <h3 style="font-weight: 700; font-size: 1.25rem; color: var(--primary-color); margin-bottom: 0.5rem;">
              {{ house.name }}
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; min-height: 40px;">
              📍 {{ house.address || 'Chưa cập nhật địa chỉ' }}
            </p>
            <div style="border-top: 1px solid var(--border-color); padding-top: 0.75rem; font-size: 0.85rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span>⚡ Giá điện mặc định:</span>
                <span style="font-weight: 600;">{{ formatMoney(house.defaultElectricityRate) }} đ/kWh</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span>💧 Giá nước mặc định:</span>
                <span style="font-weight: 600;">{{ formatMoney(house.defaultWaterRate) }} đ</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>⚙️ Cách tính nước:</span>
                <span class="badge badge-info" style="font-size: 0.7rem; padding: 0.1rem 0.4rem;">
                  {{ formatWaterBillingType(house.waterBillingType) }}
                </span>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <button @click="editHouse(house)" class="btn btn-outline" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;">
              Sửa
            </button>
            <button @click="deleteHouse(house.id)" class="btn btn-danger" style="flex: 1; padding: 0.5rem; font-size: 0.85rem;">
              Xóa
            </button>
          </div>
        </div>
      </div>

      <EmptyState 
        v-else 
        message="Bạn chưa có dãy trọ nào. Hãy nhấn nút 'Thêm Dãy Trọ Mới' ở góc trên bên phải để bắt đầu!" 
      />
    </template>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div class="card" style="width: 100%; max-width: 500px; padding: 2rem; margin: 1rem; position: relative;">
        <h3 class="card-title">{{ showEditModal ? 'Cập Nhật Dãy Trọ' : 'Thêm Dãy Trọ Mới' }}</h3>
        
        <form @submit.prevent="saveHouse">
          <div class="form-group">
            <label class="form-label">Tên dãy trọ *</label>
            <input type="text" class="form-input" v-model="form.name" placeholder="Ví dụ: Nhà trọ Green House" required />
          </div>

          <div class="form-group">
            <label class="form-label">Địa chỉ</label>
            <input type="text" class="form-input" v-model="form.address" placeholder="Nhập địa chỉ chi tiết" />
          </div>

          <div class="grid grid-cols-2" style="gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Giá điện mặc định (đ/kWh) *</label>
              <input type="number" class="form-input" v-model.number="form.defaultElectricityRate" min="0" required />
            </div>

            <div class="form-group">
              <label class="form-label">Giá nước mặc định *</label>
              <input type="number" class="form-input" v-model.number="form.defaultWaterRate" min="0" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Cách tính tiền nước *</label>
            <select class="form-select" v-model="form.waterBillingType" required>
              <option value="BY_INDEX">Tính theo chỉ số đồng hồ (tiêu thụ thực tế)</option>
              <option value="FIXED_PER_PERSON">Tính cố định theo đầu người (đ/người/tháng)</option>
              <option value="FIXED_PER_ROOM">Tính cố định theo phòng (đ/phòng/tháng)</option>
            </select>
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

<script src="./BoardingHouses.js"></script>
