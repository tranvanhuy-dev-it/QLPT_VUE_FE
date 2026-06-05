<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <PageHeader 
      title="Hợp Đồng Thuê" 
      subtitle="Quản lý hợp đồng cho thuê phòng, cấu hình phụ phí dịch vụ riêng biệt cho từng người ở" 
      :icon="contractIcon"
      :showAdd="true"
      addText="Tạo Hợp Đồng Mới"
      :disableAdd="vacantRooms.length === 0 || tenantsList.length === 0"
      searchPlaceholder="Tìm theo phòng, dãy trọ, khách thuê..."
      v-model="searchQuery"
      @add-click="openAddModal"
    />

    <!-- Contracts List -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-4 text-text-sub">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Đang tải danh sách hợp đồng...</span>
      </div>

      <div v-else>
        <div class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
          <table class="w-full text-sm text-left text-text-main border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
              <tr>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Phòng</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Dãy trọ</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Người thuê</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Ngày bắt đầu</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Tiền cọc</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Chu kỳ đóng tiền</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="contract in filteredContracts" 
                :key="contract.id" 
                class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 cursor-pointer transition-colors duration-150"
                @click="viewContractDetail(contract.id)"
              >
                <td class="py-2.5 px-4 font-semibold text-primary">
                  Phòng {{ contract.room.roomNumber }}
                </td>
                <td class="py-2.5 px-4 text-text-sub">{{ contract.room.boardingHouse.name }}</td>
                <td class="py-2.5 px-4 font-medium">{{ contract.tenant.fullName }} ({{ contract.tenant.username }})</td>
                <td class="py-2.5 px-4 text-text-sub">{{ formatDate(contract.startDate) }}</td>
                <td class="py-2.5 px-4 font-semibold text-text-main">{{ formatMoney(contract.deposit) }} đ</td>
                <td class="py-2.5 px-4 text-text-sub">
                  <span v-if="contract.billingMode === 'BY_RENTAL_DAYS'">
                    Ngày thuê hàng tháng
                  </span>
                  <span v-else>
                    Ngày {{ contract.fixedBillingDay }} cố định
                  </span>
                </td>
                <td class="py-2.5 px-4">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', contract.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400']">
                    {{ contract.status === 'ACTIVE' ? 'Hoạt Động' : (contract.status === 'TERMINATED' ? 'Đã Thanh Lý' : 'Hết Hạn') }}
                  </span>
                </td>
              </tr>
              <tr v-if="filteredContracts.length === 0">
                <td colspan="7" class="text-center text-text-sub py-12">
                  Không tìm thấy hợp đồng nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-border-main/50">
          <span class="text-xs text-text-sub">
            Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} hợp đồng)
          </span>
          <div class="flex gap-2">
            <button class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150" :disabled="page === 0" @click="changePage(page - 1)">
              Trước
            </button>
            <button class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150" :disabled="page >= totalPages - 1" @click="changePage(page + 1)">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Contract Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-card border border-border-main rounded-2xl shadow-lg w-full max-w-[650px] p-6 md:p-8 m-auto relative">
        <h3 class="text-xl font-bold text-text-main mb-6">Tạo Hợp Đồng Thuê Mới</h3>
        
        <form @submit.prevent="saveContract">
          <!-- Chọn phòng và người ở -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Chọn phòng trống *</label>
              <select class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.roomId" @change="onRoomChange" required>
                <option v-for="room in vacantRooms" :key="room.id" :value="room.id">
                  Phòng {{ room.roomNumber }} - {{ room.boardingHouse.name }}
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Người thuê trọ (Tenant) *</label>
              <select class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.tenantId" required>
                <option v-for="tenant in tenantsList" :key="tenant.id" :value="tenant.id">
                  {{ tenant.fullName }} ({{ tenant.username }})
                </option>
              </select>
            </div>
          </div>

          <!-- Đơn giá & Chỉ số Điện, Nước mặc định (Read-only inputs) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" v-if="selectedRoom">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Đơn giá điện (đ/kWh)</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-100 dark:bg-slate-800 text-text-sub text-sm outline-none cursor-not-allowed" :value="selectedRoom.boardingHouse.defaultElectricityRate" readonly />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Đơn giá nước (đ)</label>
              <input type="text" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-100 dark:bg-slate-800 text-text-sub text-sm outline-none cursor-not-allowed" :value="formatMoney(selectedRoom.boardingHouse.defaultWaterRate) + (selectedRoom.boardingHouse.waterBillingType === 'BY_INDEX' ? ' đ/m³' : (selectedRoom.boardingHouse.waterBillingType === 'FIXED_PER_PERSON' ? ' đ/người' : ' đ/phòng'))" readonly />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" v-if="selectedRoom">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Chỉ số điện đầu kỳ (kWh)</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-100 dark:bg-slate-800 text-text-sub text-sm outline-none cursor-not-allowed" :value="selectedRoom.currentElectricityIndex" readonly />
            </div>

            <div class="flex flex-col gap-1.5" v-if="selectedRoom.boardingHouse.waterBillingType === 'BY_INDEX'">
              <label class="text-xs font-semibold text-text-sub uppercase">Chỉ số nước đầu kỳ (m³)</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-100 dark:bg-slate-800 text-text-sub text-sm outline-none cursor-not-allowed" :value="selectedRoom.currentWaterIndex" readonly />
            </div>
          </div>

          <!-- Giá thuê và tiền đặt cọc -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Giá thuê / tháng *</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-100 dark:bg-slate-800 text-text-sub text-sm outline-none cursor-not-allowed" v-model.number="form.contractedRoomPrice" readonly required />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Tiền đặt cọc *</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model.number="form.deposit" required />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Số người ở *</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model.number="form.numberOfTenants" min="1" required />
            </div>
          </div>

          <!-- Ngày thuê và Chu kỳ tính tiền -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Ngày bắt đầu thuê *</label>
              <input type="date" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.startDate" required />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Ngày hết hạn (Nếu có)</label>
              <input type="date" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.endDate" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Chế độ tính tiền *</label>
              <select class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model="form.billingMode" required>
                <option value="BY_RENTAL_DAYS">Tính theo ngày dọn vào (anniversary)</option>
                <option value="FIXED_DATE_OF_MONTH">Đóng tiền vào ngày cố định hàng tháng</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5" v-if="form.billingMode === 'FIXED_DATE_OF_MONTH'">
              <label class="text-xs font-semibold text-text-sub uppercase">Ngày đóng tiền cố định *</label>
              <input type="number" class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary" v-model.number="form.fixedBillingDay" min="1" max="31" placeholder="Ví dụ: 5" required />
            </div>
          </div>

          <!-- Dịch vụ phụ phí của dãy trọ -->
          <div class="mt-6 pt-4 border-t border-border-main mb-6">
            <h4 class="text-sm font-bold text-text-main mb-3">Phụ Phí & Dịch Vụ Áp Dụng:</h4>
            <div v-if="availableExtraFees.length === 0" class="text-xs text-text-sub italic">
              Dãy trọ này chưa được cấu hình dịch vụ phụ phí nào.
            </div>
            <div v-else class="flex flex-col gap-2.5">
              <div v-for="(ef, index) in availableExtraFees" :key="ef.id" class="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border border-border-main rounded-xl px-4 py-3">
                <label class="flex items-center gap-3 text-sm font-semibold text-text-main cursor-pointer select-none">
                  <input type="checkbox" v-model="ef.selected" class="w-4.5 h-4.5 text-primary accent-primary" />
                  {{ ef.name }}
                </label>
                
                <div class="text-sm font-bold text-primary">
                  {{ formatMoney(ef.defaultPrice) }} đ/{{ ef.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-3 justify-end mt-4">
            <button type="button" @click="closeModal" class="px-4 py-2 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all">Hủy</button>
            <button type="submit" class="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary-hover cursor-pointer transition-all">Tạo Hợp Đồng</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script src="./Contracts.js"></script>
