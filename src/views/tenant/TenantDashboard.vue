<template>
  <div class="p-6 bg-bg-main min-h-full">
    <PageHeader 
      title="Thông Tin Phòng Trọ Của Tôi" 
      subtitle="Xem chi tiết hợp đồng thuê, chỉ số điện nước và hóa đơn thanh toán hàng tháng" 
      :icon="tenantDashboardIcon"
      :showSearch="false"
    />

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4 text-text-sub">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <span>Đang tải thông tin phòng trọ...</span>
    </div>

    <div v-else>
      <div v-if="!activeContract" class="bg-card border border-border-main rounded-2xl p-12 text-center text-text-sub text-base font-semibold shadow-xs">
        ⚠️ Hiện tại tài khoản của bạn chưa được gắn vào hợp đồng thuê phòng nào. Vui lòng liên hệ chủ trọ để kích hoạt!
      </div>

      <div v-else class="space-y-6">
        <!-- Room and Landlord Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Room info -->
          <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs flex flex-col hover:shadow-md transition-shadow duration-200 justify-between">
            <div>
              <h3 class="text-sm font-bold text-primary uppercase tracking-wider mb-4">📍 Phòng Của Tôi</h3>
              <div class="space-y-2 text-sm text-text-main">
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Số phòng:</strong> <span>Phòng {{ activeContract.room.roomNumber }}</span></div>
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Dãy trọ:</strong> <span class="text-text-sub">{{ activeContract.room.boardingHouse.name }}</span></div>
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Địa chỉ:</strong> <span class="text-text-sub text-right">{{ activeContract.room.boardingHouse.address || 'Chưa cập nhật' }}</span></div>
                <div class="flex justify-between pb-1"><strong>Số người ở:</strong> <span>{{ activeContract.numberOfTenants }} người</span></div>
              </div>
            </div>
          </div>

          <!-- Contract Info -->
          <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs flex flex-col hover:shadow-md transition-shadow duration-200 justify-between">
            <div>
              <h3 class="text-sm font-bold text-success uppercase tracking-wider mb-4">📄 Chi Tiết Hợp Đồng</h3>
              <div class="space-y-2 text-sm text-text-main">
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Giá thuê phòng:</strong> <span class="font-bold text-primary">{{ formatMoney(activeContract.contractedRoomPrice) }} đ/tháng</span></div>
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Tiền đặt cọc:</strong> <span class="font-semibold">{{ formatMoney(activeContract.deposit) }} đ</span></div>
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Ngày bắt đầu:</strong> <span class="text-text-sub">{{ formatDate(activeContract.startDate) }}</span></div>
                <div class="flex justify-between pb-1"><strong>Kỳ đóng tiền:</strong> 
                  <span class="text-text-sub text-right">{{ activeContract.billingMode === 'BY_RENTAL_DAYS' ? 'Ngày thuê hàng tháng' : `Ngày ${activeContract.fixedBillingDay} hàng tháng` }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Meter Index Info -->
          <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs flex flex-col hover:shadow-md transition-shadow duration-200 justify-between">
            <div>
              <h3 class="text-sm font-bold text-text-main uppercase tracking-wider mb-4">🔌 Chỉ Số Hiện Tại</h3>
              <div class="space-y-2 text-sm text-text-main">
                <div class="flex justify-between border-b border-border-main/30 pb-2"><strong>Điện tiêu thụ:</strong> <span>⚡ {{ activeContract.room.currentElectricityIndex }} kWh</span></div>
                <div v-if="activeContract.room.boardingHouse.waterBillingType === 'BY_INDEX'" class="flex justify-between border-b border-border-main/30 pb-2">
                  <strong>Nước tiêu thụ:</strong> <span>💧 {{ activeContract.room.currentWaterIndex }} m³</span>
                </div>
                <div v-else class="flex justify-between border-b border-border-main/30 pb-2">
                  <strong>Nước (cố định):</strong> <span class="text-text-sub text-right">💧 Theo {{ activeContract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON' ? 'người' : 'phòng' }}</span>
                </div>
                <div class="pt-3 text-[11px] text-text-sub flex flex-col gap-0.5">
                  <div class="font-semibold text-text-main/80">Chủ nhà liên hệ:</div>
                  <div>{{ activeContract.room.boardingHouse.landlord?.fullName || 'Chưa cập nhật' }} - 📞 {{ activeContract.room.boardingHouse.landlord?.phone || 'Chưa cập nhật' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./TenantDashboard.js"></script>
