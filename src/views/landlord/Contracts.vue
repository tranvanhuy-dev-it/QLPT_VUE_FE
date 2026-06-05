<template>
  <div class="contracts-page">
    <PageHeader 
      title="Hợp Đồng Thuê" 
      subtitle="Quản lý hợp đồng cho thuê phòng, cấu hình phụ phí dịch vụ riêng biệt cho từng người ở" 
      :icon="contractIcon"
      :showAdd="true"
      addText="Tạo Hợp Đồng Mới"
      :disableAdd="vacantRooms.length === 0 && tenantsList.length === 0"
      searchPlaceholder="Tìm theo phòng, dãy trọ, khách thuê..."
      v-model="searchQuery"
      @add-click="openAddModal"
    />

    <!-- Contracts List -->
    <div class="card">
      <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
        Đang tải danh sách hợp đồng...
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Dãy trọ</th>
                <th>Người thuê</th>
                <th>Ngày bắt đầu</th>
                <th>Giá hợp đồng</th>
                <th>Tiền cọc</th>
                <th>Chu kỳ đóng tiền</th>
                <th>Trạng thái</th>
                <th style="text-align: right;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contract in filteredContracts" :key="contract.id">
                <td style="font-weight: 600; color: var(--primary-color);">Phòng {{ contract.room.roomNumber }}</td>
                <td>{{ contract.room.boardingHouse.name }}</td>
                <td>{{ contract.tenant.fullName }} ({{ contract.tenant.username }})</td>
                <td>{{ formatDate(contract.startDate) }}</td>
                <td style="font-weight: 600;">{{ formatMoney(contract.contractedRoomPrice) }} đ</td>
                <td>{{ formatMoney(contract.deposit) }} đ</td>
                <td>
                  <span v-if="contract.billingMode === 'BY_RENTAL_DAYS'">
                    Ngày thuê hàng tháng
                  </span>
                  <span v-else>
                    Ngày {{ contract.fixedBillingDay }} cố định
                  </span>
                </td>
                <td>
                  <span :class="['badge', contract.status === 'ACTIVE' ? 'badge-success' : 'badge-danger']">
                    {{ contract.status === 'ACTIVE' ? 'Hoạt Động' : (contract.status === 'TERMINATED' ? 'Đã Thanh Lý' : 'Hết Hạn') }}
                  </span>
                </td>
                <td style="text-align: right; display: flex; gap: 0.25rem; justify-content: flex-end;">
                  <button 
                    v-if="contract.status === 'ACTIVE'"
                    @click="editContract(contract)" 
                    class="btn btn-outline"
                    style="padding: 0.4rem 0.8rem; font-size: 0.85rem;"
                  >
                    Sửa
                  </button>
                  <button 
                    v-if="contract.status === 'ACTIVE'"
                    @click="terminateContract(contract.id)" 
                    class="btn btn-danger"
                    style="padding: 0.4rem 0.8rem; font-size: 0.85rem;"
                  >
                    Thanh Lý
                  </button>
                </td>
              </tr>
              <tr v-if="filteredContracts.length === 0">
                <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                  Không tìm thấy hợp đồng nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
          <span style="font-size: 0.875rem; color: var(--text-secondary);">
            Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} hợp đồng)
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

    <!-- Add Contract Modal -->
    <div v-if="showAddModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; overflow-y: auto; padding: 2rem 0;">
      <div class="card" style="width: 100%; max-width: 650px; padding: 2rem; margin: auto; position: relative;">
        <h3 class="card-title">Tạo Hợp Đồng Thuê Mới</h3>
        
        <form @submit.prevent="saveContract">
          <!-- Chọn phòng và người ở -->
          <div class="grid grid-cols-2" style="gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Chọn phòng trống *</label>
              <select class="form-select" v-model="form.roomId" @change="onRoomChange" required>
                <option v-for="room in vacantRooms" :key="room.id" :value="room.id">
                  Phòng {{ room.roomNumber }} - {{ room.boardingHouse.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Người thuê trọ (Tenant) *</label>
              <select class="form-select" v-model="form.tenantId" required>
                <option v-for="tenant in tenantsList" :key="tenant.id" :value="tenant.id">
                  {{ tenant.fullName }} ({{ tenant.username }})
                </option>
              </select>
            </div>
          </div>

          <!-- Giá thuê và tiền đặt cọc -->
          <div class="grid grid-cols-3" style="gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Giá thuê / tháng *</label>
              <input type="number" class="form-input" v-model.number="form.contractedRoomPrice" required />
            </div>

            <div class="form-group">
              <label class="form-label">Tiền đặt cọc *</label>
              <input type="number" class="form-input" v-model.number="form.deposit" required />
            </div>

            <div class="form-group">
              <label class="form-label">Số người ở *</label>
              <input type="number" class="form-input" v-model.number="form.numberOfTenants" min="1" required />
            </div>
          </div>

          <!-- Ngày thuê và Chu kỳ tính tiền -->
          <div class="grid grid-cols-2" style="gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Ngày bắt đầu thuê *</label>
              <input type="date" class="form-input" v-model="form.startDate" required />
            </div>

            <div class="form-group">
              <label class="form-label">Ngày hết hạn (Nếu có)</label>
              <input type="date" class="form-input" v-model="form.endDate" />
            </div>
          </div>

          <div class="grid grid-cols-2" style="gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Chế độ tính tiền *</label>
              <select class="form-select" v-model="form.billingMode" required>
                <option value="BY_RENTAL_DAYS">Tính theo ngày dọn vào (anniversary)</option>
                <option value="FIXED_DATE_OF_MONTH">Đóng tiền vào ngày cố định hàng tháng</option>
              </select>
            </div>

            <div class="form-group" v-if="form.billingMode === 'FIXED_DATE_OF_MONTH'">
              <label class="form-label">Ngày đóng tiền cố định *</label>
              <input type="number" class="form-input" v-model.number="form.fixedBillingDay" min="1" max="31" placeholder="Ví dụ: 5" required />
            </div>
          </div>

          <!-- Dịch vụ phụ phí của dãy trọ -->
          <div style="margin-top: 1.5rem; margin-bottom: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem;">Phụ Phí & Dịch Vụ Áp Dụng:</h4>
            <div v-if="availableExtraFees.length === 0" style="color: var(--text-secondary); font-size: 0.85rem;">
              Dãy trọ này chưa được cấu hình dịch vụ phụ phí nào.
            </div>
            <div v-else style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div v-for="(ef, index) in availableExtraFees" :key="ef.id" style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.02); padding: 0.5rem 1rem; border-radius: 8px;">
                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 500; cursor: pointer;">
                  <input type="checkbox" v-model="ef.selected" style="transform: scale(1.15);" />
                  {{ ef.name }} (đơn giá mặc định: {{ formatMoney(ef.defaultPrice) }} đ/{{ ef.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }})
                </label>
                
                <div style="display: flex; align-items: center; gap: 0.5rem;" v-if="ef.selected">
                  <span style="font-size: 0.8rem; color: var(--text-secondary);">Giá áp dụng:</span>
                  <input type="number" class="form-input" style="width: 120px; padding: 0.25rem 0.5rem;" v-model.number="ef.customPrice" min="0" />
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem;">
            <button type="button" @click="closeModal" class="btn btn-outline">Hủy</button>
            <button type="submit" class="btn btn-primary">Tạo Hợp Đồng</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Contract Modal -->
    <div v-if="showEditModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div class="card" style="width: 100%; max-width: 450px; padding: 2rem; position: relative; margin: 1rem;">
        <h3 class="card-title">Chỉnh Sửa Hợp Đồng</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Phòng {{ editForm.roomNumber }} - Khách thuê: {{ editForm.tenantName }}
        </p>

        <form @submit.prevent="submitEditContract">
          <div class="form-group">
            <label class="form-label">Số người ở thực tế *</label>
            <input type="number" class="form-input" v-model.number="editForm.numberOfTenants" min="1" required />
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
            <button type="button" @click="closeEditModal" class="btn btn-outline">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu Thay Đổi</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script src="./Contracts.js"></script>
