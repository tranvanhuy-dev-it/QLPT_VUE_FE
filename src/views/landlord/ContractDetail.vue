<template>
  <div class="contract-detail-page">
    <!-- Header Block -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color); background: var(--card-bg); width: 100%;">
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 0.75rem;">
          <button @click="goBack" class="btn btn-outline" style="padding: 0; border-radius: 50%; width: 36px; height: 36px; border: 1px solid var(--border-color); display: inline-flex; align-items: center; justify-content: center; background: var(--card-bg); cursor: pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 1.1rem; height: 1.1rem;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <span>Chi Tiết Hợp Đồng</span>
        </h2>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button @click="goBack" class="btn btn-outline">Quay Lại Danh Sách</button>
        <button 
          v-if="contract && contract.status === 'ACTIVE'" 
          @click="toggleEditMode" 
          :class="['btn', isEditMode ? 'btn-secondary' : 'btn-primary']"
        >
          {{ isEditMode ? 'Hủy Sửa' : 'Sửa Số Người Ở' }}
        </button>
        <button 
          v-if="contract && contract.status === 'ACTIVE'" 
          @click="terminateContract" 
          class="btn btn-danger"
        >
          Thanh Lý Hợp Đồng
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 120px); background: var(--card-bg); flex: 1;">
      <div style="text-align: center;">
        <div class="spinner" style="margin-bottom: 1rem;"></div>
        <div style="color: var(--text-secondary); font-size: 0.95rem;">Đang tải chi tiết hợp đồng...</div>
      </div>
    </div>

    <!-- Main Content Area (Unified Flat Panels) -->
    <div v-else-if="contract" class="grid grid-cols-3" style="gap: 0; align-items: stretch; background: var(--card-bg); flex: 1; border-bottom: 1px solid var(--border-color);">
      
      <!-- Left Column: Contract & Room Details -->
      <div style="grid-column: span 2; border-right: 1px solid var(--border-color); display: flex; flex-direction: column;">
        
        <!-- Room Information Section -->
        <div style="padding: 2rem; border-bottom: 1px solid var(--border-color); flex: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; margin: 0;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="var(--primary-color)" style="width: 1.25rem; height: 1.25rem;">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span>Thông Tin Phòng Trọ</span>
            </h3>
            <span :class="['badge', contract.status === 'ACTIVE' ? 'badge-success' : 'badge-danger']" style="font-size: 0.75rem; padding: 0.25rem 0.625rem;">
              {{ contract.status === 'ACTIVE' ? 'Hoạt Động' : (contract.status === 'TERMINATED' ? 'Đã Thanh Lý' : 'Hết Hạn') }}
            </span>
          </div>

          <div class="grid grid-cols-2" style="gap: 1.5rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 600;">Phòng Trọ</div>
              <div style="font-size: 1.1rem; font-weight: 600; color: var(--primary-color);">Phòng {{ contract.room.roomNumber }}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 600;">Dãy Trọ</div>
              <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">{{ contract.room.boardingHouse.name }}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 600;">Giá Thuê Gốc / Tháng</div>
              <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">{{ formatMoney(contract.contractedRoomPrice) }} VNĐ</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 600;">Sức Chứa Tối Đa</div>
              <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">Tối đa {{ contract.room.maxPeople }} người</div>
            </div>
          </div>

          <div style="margin-top: 1.5rem; background: rgba(0, 102, 204, 0.02); border: 1px dashed var(--border-color); border-radius: 6px; padding: 1rem;">
            <div style="font-weight: 600; font-size: 0.8rem; color: var(--primary-color); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Chỉ số điện nước ban đầu</div>
            <div class="grid grid-cols-2" style="gap: 1rem;">
              <div>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">Điện hiện tại:</span>
                <strong style="margin-left: 0.5rem; color: var(--text-primary);">{{ contract.room.currentElectricityIndex }} kWh</strong>
              </div>
              <div>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">Nước hiện tại:</span>
                <strong style="margin-left: 0.5rem; color: var(--text-primary);">{{ contract.room.currentWaterIndex }} m³</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Contract Details Section -->
        <div style="padding: 2rem; flex: 1;">
          <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; margin-top: 0; margin-bottom: 1.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="var(--primary-color)" style="width: 1.25rem; height: 1.25rem;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <span>Thông Tin Điều Khoản Hợp Đồng</span>
          </h3>

          <div class="grid grid-cols-2" style="gap: 1.5rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 600;">Ngày Bắt Đầu Thuê</div>
              <div style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">{{ formatDate(contract.startDate) }}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 600;">Ngày Hết Hạn</div>
              <div style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">{{ formatDate(contract.endDate) }}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 600;">Tiền Đặt Cọc</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--success-color);">{{ formatMoney(contract.deposit) }} VNĐ</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; font-weight: 600;">Chu Kỳ Tính Tiền</div>
              <div style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">
                <span v-if="contract.billingMode === 'BY_RENTAL_DAYS'">
                  Tính từ ngày thuê (Anniversary)
                </span>
                <span v-else>
                  Ngày {{ contract.fixedBillingDay }} cố định hàng tháng
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Tenant & Extra Fees Info -->
      <div style="display: flex; flex-direction: column;">
        
        <!-- Tenant Information Section -->
        <div style="padding: 2rem; border-bottom: 1px solid var(--border-color); flex: 1;">
          <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; margin-top: 0; margin-bottom: 1.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="var(--primary-color)" style="width: 1.25rem; height: 1.25rem;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <span>Khách Thuê Phòng</span>
          </h3>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.15rem; font-weight: 600;">Họ Tên Khách Thuê</div>
              <div style="font-size: 1.05rem; font-weight: 600; color: var(--text-primary);">{{ contract.tenant.fullName }}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.15rem; font-weight: 600;">Tài Khoản Đăng Nhập</div>
              <div style="font-size: 0.95rem; font-weight: 500; color: var(--text-secondary);">{{ contract.tenant.username }}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.15rem; font-weight: 600;">Số Điện Thoại</div>
              <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">{{ contract.tenant.phoneNumber || 'Chưa cập nhật' }}</div>
            </div>
            <div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.15rem; font-weight: 600;">Email Liên Hệ</div>
              <div style="font-size: 0.95rem; font-weight: 500; color: var(--text-primary);">{{ contract.tenant.email || 'Chưa cập nhật' }}</div>
            </div>
          </div>
        </div>

        <!-- Occupancy & Extra Fees Section -->
        <div style="padding: 2rem; flex: 1;">
          <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; margin-top: 0; margin-bottom: 1.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="var(--primary-color)" style="width: 1.25rem; height: 1.25rem;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.079-13.137a3 3 0 1 1 5.996 0 3 3 0 0 1-5.996 0Zm6 0a3 3 0 1 1 5.996 0 3 3 0 0 1-5.996 0Z" />
            </svg>
            <span>Số Người Ở & Dịch Vụ</span>
          </h3>

          <!-- Occupants Inline Form -->
          <div style="background: rgba(0, 102, 204, 0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 1rem; margin-bottom: 1.5rem;">
            <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.5rem; font-weight: 600;">Số người ở thực tế</div>
            
            <div v-if="!isEditMode" style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">
                {{ contract.numberOfTenants }} <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-secondary);">người</span>
              </div>
              <button 
                v-if="contract.status === 'ACTIVE'" 
                @click="isEditMode = true" 
                class="btn btn-outline" 
                style="padding: 0.35rem 0.75rem; font-size: 0.8rem; cursor: pointer;"
              >
                Chỉnh sửa
              </button>
            </div>

            <form v-else @submit.prevent="submitEdit" style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input 
                  type="number" 
                  class="form-input" 
                  v-model.number="numberOfTenants" 
                  min="1" 
                  :max="contract.room.maxPeople" 
                  required 
                  style="width: 100px; text-align: center;"
                />
                <span style="font-size: 0.9rem; color: var(--text-secondary);">/ Tối đa {{ contract.room.maxPeople }}</span>
              </div>
              
              <div style="display: flex; gap: 0.5rem;">
                <button type="submit" :disabled="saving" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; flex: 1; cursor: pointer;">
                  {{ saving ? 'Đang lưu...' : 'Lưu lại' }}
                </button>
                <button type="button" @click="toggleEditMode" class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; flex: 1; cursor: pointer;">
                  Hủy
                </button>
              </div>
            </form>
          </div>

          <!-- Applied Extra Fees List -->
          <div>
            <div style="font-weight: 600; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Dịch vụ phụ phí áp dụng</div>
            
            <div v-if="extraFees.length === 0" style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 1rem; border: 1px dashed var(--border-color); border-radius: 6px;">
              Hợp đồng này không sử dụng dịch vụ phụ phí nào.
            </div>
            
            <div v-else style="display: flex; flex-direction: column; gap: 0.75rem;">
              <div 
                v-for="cef in extraFees" 
                :key="cef.id" 
                style="display: flex; justify-content: space-between; align-items: center; padding: 0.625rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: #fff;"
              >
                <div>
                  <div style="font-size: 0.875rem; font-weight: 600; color: var(--text-primary);">{{ cef.extraFee.name }}</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">
                    {{ formatMoney(cef.customPrice) }} đ/{{ cef.extraFee.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}
                  </div>
                </div>
                
                <div style="font-size: 0.9rem; font-weight: 700; color: var(--primary-color);">
                  <span v-if="cef.extraFee.unitType === 'FIXED_PER_PERSON'">
                    {{ formatMoney(cef.customPrice * contract.numberOfTenants) }} đ
                  </span>
                  <span v-else>
                    {{ formatMoney(cef.customPrice) }} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script src="./ContractDetail.js"></script>

<style scoped>
.contract-detail-page {
  margin: -1rem; /* Cancel default main content padding */
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px); /* Adjust based on top header height */
  background-color: var(--card-bg);
}
</style>
