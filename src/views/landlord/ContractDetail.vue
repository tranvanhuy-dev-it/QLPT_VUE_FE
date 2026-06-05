<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <!-- Header Block -->
    <div class="flex justify-between items-center mb-6 pb-4 border-b border-border-main">
      <div>
        <h2 class="text-xl font-bold text-text-main flex items-center gap-2">
          <button @click="goBack" class="inline-flex items-center justify-center p-1.5 rounded-lg border border-border-main bg-card hover:bg-slate-50 transition cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <span>Chi Tiết Hợp Đồng</span>
          <span v-if="contract" :class="[
            'text-[11px] font-semibold px-2.5 py-0.5 rounded border ml-2',
            contract.status === 'ACTIVE' 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          ]">
            {{ contract.status === 'ACTIVE' ? 'Hoạt động' : 'Đã thanh lý' }}
          </span>
        </h2>
      </div>

      <div v-if="contract" class="flex gap-2">
        <button @click="goBack" class="px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 transition bg-card cursor-pointer">
          Quay lại
        </button>
        <button v-if="contract.status === 'ACTIVE'" @click="toggleEditMode" :class="[
          'px-3 py-1.5 text-xs font-semibold rounded-lg transition text-white cursor-pointer',
          isEditMode ? 'bg-slate-600 hover:bg-slate-700' : 'bg-primary hover:bg-primary-hover'
        ]">
          {{ isEditMode ? 'Hủy' : 'Sửa số người' }}
        </button>
        <button v-if="contract.status === 'ACTIVE'" @click="terminateContract" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer">
          Thanh lý
        </button>
      </div>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loading" class="bg-card border border-border-main rounded-xl flex justify-center items-center min-h-[300px] shadow-xs">
      <div class="text-center flex flex-col items-center gap-2">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div class="text-text-sub text-xs">Đang tải chi tiết hợp đồng...</div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div v-else-if="contract" class="flex flex-col gap-4">
      
      <!-- Room Info Card -->
      <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
        <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Thông tin phòng trọ</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Dãy trọ:</span>
            <span class="font-bold text-text-main flex-1">{{ contract.room.boardingHouse.name }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Phòng số:</span>
            <span class="font-bold text-primary flex-1">Phòng {{ contract.room.roomNumber }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Giá phòng gốc:</span>
            <span class="font-bold text-text-main flex-1">{{ formatMoney(contract.contractedRoomPrice) }} đ/tháng</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Sức chứa tối đa:</span>
            <span class="font-bold text-text-main flex-1">{{ contract.room.maxPeople }} người</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Số điện hiện tại:</span>
            <span class="font-bold text-text-main flex-1">{{ contract.room.currentElectricityIndex }} kWh</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Số nước hiện tại:</span>
            <span class="font-bold text-text-main flex-1">{{ contract.room.currentWaterIndex }} m³</span>
          </div>
        </div>
      </div>

      <!-- Contract Terms Card -->
      <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
        <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Điều khoản hợp đồng</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Ngày bắt đầu thuê:</span>
            <span class="font-semibold text-text-main flex-1">{{ formatDate(contract.startDate) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Ngày hết hạn:</span>
            <span class="font-semibold text-text-main flex-1">{{ formatDate(contract.endDate) }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Tiền đặt cọc:</span>
            <span class="font-bold text-green-600 flex-1">{{ formatMoney(contract.deposit) }} đ</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Kỳ hạn tính tiền:</span>
            <span class="font-semibold text-text-main flex-1">
              <span v-if="contract.billingMode === 'BY_RENTAL_DAYS'">Theo ngày thuê</span>
              <span v-else>Cố định ngày {{ contract.fixedBillingDay }} hằng tháng</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Tenant Info Card -->
      <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
        <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Thông tin khách thuê</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Đại diện thuê:</span>
            <span class="font-bold text-text-main flex-1">{{ contract.tenant.fullName }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Tài khoản:</span>
            <span class="font-mono text-text-main flex-1">{{ contract.tenant.username }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Số điện thoại:</span>
            <span class="font-bold text-text-main flex-1">{{ contract.tenant.phoneNumber || 'Chưa cập nhật' }}</span>
          </div>
          <div class="flex items-center">
            <span class="text-text-sub font-semibold w-36 shrink-0">Email liên hệ:</span>
            <span class="font-semibold text-text-main flex-1 break-all">{{ contract.tenant.email || 'Chưa cập nhật' }}</span>
          </div>
        </div>
      </div>

      <!-- Occupants & Extra fees Card -->
      <div class="bg-card border border-border-main rounded-xl p-4 shadow-xs">
        <h3 class="text-sm font-bold text-text-main border-b border-border-main pb-2.5 mb-4">Số người ở & Dịch vụ</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <!-- Left Side: Occupants editor -->
          <div class="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3 border border-border-main/50 text-xs">
            <span class="text-text-sub block mb-2 font-medium">Số người đang ở thực tế:</span>
            
            <div v-if="!isEditMode" class="flex justify-between items-center py-1">
              <span class="font-bold text-text-main text-sm">{{ contract.numberOfTenants }} người</span>
              <button v-if="contract.status === 'ACTIVE'" @click="isEditMode = true" class="px-2 py-1 text-[11px] font-semibold border border-border-main bg-card hover:bg-slate-100 rounded text-primary cursor-pointer transition">
                Chỉnh sửa
              </button>
            </div>

            <form v-else @submit.prevent="submitEdit" class="flex flex-col gap-2">
              <div class="flex gap-2 items-center">
                <input type="number" class="w-16 text-center border border-border-main rounded px-1.5 py-0.5 bg-card text-text-main font-bold outline-none" v-model.number="numberOfTenants" min="1" :max="contract.room.maxPeople" required />
                <span class="text-text-sub font-semibold">/ Tối đa {{ contract.room.maxPeople }}</span>
              </div>
              <div class="flex gap-1">
                <button type="submit" :disabled="saving" class="px-2 py-1 bg-primary text-white hover:bg-primary-hover rounded text-[11px] font-bold flex-1 cursor-pointer transition">
                  Lưu
                </button>
                <button type="button" @click="toggleEditMode" class="px-2 py-1 border border-border-main bg-card hover:bg-slate-100 rounded text-[11px] font-bold flex-1 cursor-pointer transition">
                  Hủy
                </button>
              </div>
            </form>
          </div>

          <!-- Right Side: Services applied -->
          <div class="text-xs">
            <span class="text-text-sub font-semibold block mb-2.5">Dịch vụ đi kèm:</span>
            <div v-if="extraFees.length === 0" class="text-center py-4 text-text-sub italic">
              Không có dịch vụ đi kèm
            </div>
            <div v-else class="flex flex-col gap-2">
              <div v-for="cef in extraFees" :key="cef.id" class="border border-border-main/40 rounded p-2.5 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
                <div>
                  <span class="font-semibold text-text-main block">{{ cef.extraFee.name }}</span>
                  <span class="text-[10px] text-text-sub">
                    {{ formatMoney(cef.customPrice) }} đ/{{ cef.extraFee.unitType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}
                  </span>
                </div>
                <span class="font-bold text-primary shrink-0 ml-2">
                  {{ formatMoney(cef.extraFee.unitType === 'FIXED_PER_PERSON' ? cef.customPrice * contract.numberOfTenants : cef.customPrice) }} đ
                </span>
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
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
}
</style>
