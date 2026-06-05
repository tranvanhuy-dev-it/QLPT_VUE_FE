<template>
  <div class="p-6 bg-bg-main min-h-screen">
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
                  <div>{{ activeContract.room.boardingHouse.landlord.fullName }} - 📞 {{ activeContract.room.boardingHouse.landlord.phone || 'Chưa cập nhật' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tenant Invoices list -->
        <div class="bg-card border border-border-main rounded-2xl p-6 shadow-xs">
          <h3 class="text-base font-bold text-text-main mb-6">Lịch Sử Hóa Đơn</h3>
          <div class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
            <table class="w-full text-sm text-left text-text-main border-collapse">
              <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
                <tr>
                  <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Ngày xuất</th>
                  <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Kỳ thanh toán</th>
                  <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Tiền phòng</th>
                  <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Tổng cộng</th>
                  <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Đã thanh toán</th>
                  <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Trạng thái</th>
                  <th class="py-3 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in invoices" :key="invoice.id" class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors duration-150">
                  <td class="py-3.5 px-4 text-text-sub">{{ formatDate(invoice.invoiceDate) }}</td>
                  <td class="py-3.5 px-4 text-xs text-text-sub">
                    {{ formatDate(invoice.billingPeriodStart) }} - {{ formatDate(invoice.billingPeriodEnd) }}
                  </td>
                  <td class="py-3.5 px-4">{{ formatMoney(invoice.roomPrice) }} đ</td>
                  <td class="py-3.5 px-4 font-semibold text-primary">{{ formatMoney(invoice.totalAmount) }} đ</td>
                  <td class="py-3.5 px-4 font-semibold text-success">{{ formatMoney(invoice.paidAmount) }} đ</td>
                  <td class="py-3.5 px-4">
                    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', 
                      invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400' : 
                      (invoice.status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/35 dark:text-amber-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400')
                    ]">
                      {{ invoice.status === 'PAID' ? 'Đã thanh toán' : (invoice.status === 'PARTIALLY_PAID' ? 'Trả một phần' : 'Chưa đóng tiền') }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button @click="viewDetails(invoice)" class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 cursor-pointer transition-all duration-150">
                      Xem Phiếu Chi Tiết
                    </button>
                  </td>
                </tr>
                <tr v-if="invoices.length === 0">
                  <td colspan="7" class="text-center text-text-sub py-12">
                    Chưa có hóa đơn nào được tạo cho bạn.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-border-main/50">
            <span class="text-xs text-text-sub">
              Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} hóa đơn)
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
    </div>

    <!-- Invoice Receipt Details Modal -->
    <div v-if="showDetailModal && invoiceDetails" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-card border border-border-main rounded-2xl shadow-xl w-full max-w-[500px] p-6 md:p-8 m-auto relative">
        
        <div id="receipt-print-area-tenant" class="font-sans text-black bg-white p-5 border border-slate-200 rounded-xl">
          <div class="text-center border-b-2 border-dashed border-slate-200 pb-4 mb-6">
            <h2 class="font-bold text-xl text-primary m-0">HÓA ĐƠN TIỀN TRỌ</h2>
            <p class="text-sm mt-1 text-slate-600 font-semibold">{{ invoiceDetails.contract.room.boardingHouse.name }}</p>
            <p class="text-xs text-slate-400 mt-0.5">Kỳ hóa đơn: {{ formatDate(invoiceDetails.billingPeriodStart) }} - {{ formatDate(invoiceDetails.billingPeriodEnd) }}</p>
          </div>

          <div class="text-xs space-y-1.5 pb-4 mb-5 border-b border-slate-100 text-slate-700">
            <div><strong>Phòng số:</strong> {{ invoiceDetails.contract.room.roomNumber }}</div>
            <div><strong>Khách thuê:</strong> {{ invoiceDetails.contract.tenant.fullName }}</div>
            <div><strong>Ngày xuất:</strong> {{ formatDate(invoiceDetails.invoiceDate) }}</div>
          </div>

          <table class="w-full text-xs border-collapse mb-6">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-2 font-bold text-slate-600">Khoản chi phí</th>
                <th class="text-right py-2 font-bold text-slate-600">Đơn giá</th>
                <th class="text-right py-2 font-bold text-slate-600">SL</th>
                <th class="text-right py-2 font-bold text-slate-600">Thành tiền</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dashed divide-slate-100">
              <tr>
                <td class="py-2.5 text-slate-800">Tiền phòng</td>
                <td class="text-right py-2.5 text-slate-600">{{ formatMoney(invoiceDetails.contract.contractedRoomPrice) }} đ</td>
                <td class="text-right py-2.5 text-slate-600">1</td>
                <td class="text-right py-2.5 font-bold text-slate-800">{{ formatMoney(invoiceDetails.roomPrice) }} đ</td>
              </tr>
              <tr>
                <td class="py-2.5 text-slate-800">
                  Tiền điện ({{ invoiceDetails.newElectricityIndex }} - {{ invoiceDetails.oldElectricityIndex }} số)
                </td>
                <td class="text-right py-2.5 text-slate-600">{{ formatMoney(invoiceDetails.electricityRate) }} đ</td>
                <td class="text-right py-2.5 text-slate-600">{{ invoiceDetails.newElectricityIndex - invoiceDetails.oldElectricityIndex }}</td>
                <td class="text-right py-2.5 font-bold text-slate-800">
                  {{ formatMoney((invoiceDetails.newElectricityIndex - invoiceDetails.oldElectricityIndex) * invoiceDetails.electricityRate) }} đ
                </td>
              </tr>
              <tr>
                <td class="py-2.5 text-slate-800">
                  Tiền nước 
                  <span v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'" class="text-[10px] text-slate-400">
                    ({{ invoiceDetails.newWaterIndex }} - {{ invoiceDetails.oldWaterIndex }} khối)
                  </span>
                  <span v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'" class="text-[10px] text-slate-400">
                    (cố định / người)
                  </span>
                  <span v-else class="text-[10px] text-slate-400">(cố định / phòng)</span>
                </td>
                <td class="text-right py-2.5 text-slate-600">{{ formatMoney(invoiceDetails.waterRate) }} đ</td>
                <td class="text-right py-2.5 text-slate-600">
                  <span v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
                    {{ invoiceDetails.newWaterIndex - invoiceDetails.oldWaterIndex }}
                  </span>
                  <span v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'">
                    {{ invoiceDetails.contract.numberOfTenants }}
                  </span>
                  <span v-else>1</span>
                </td>
                <td class="text-right py-2.5 font-bold text-slate-800">
                  <span v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
                    {{ formatMoney((invoiceDetails.newWaterIndex - invoiceDetails.oldWaterIndex) * invoiceDetails.waterRate) }} đ
                  </span>
                  <span v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'">
                    {{ formatMoney(invoiceDetails.contract.numberOfTenants * invoiceDetails.waterRate) }} đ
                  </span>
                  <span v-else>{{ formatMoney(invoiceDetails.waterRate) }} đ</span>
                </td>
              </tr>
              <tr v-for="item in invoiceItems" :key="item.id">
                <td class="py-2.5 text-slate-800">{{ item.name }}</td>
                <td class="text-right py-2.5 text-slate-600">{{ formatMoney(item.price) }} đ</td>
                <td class="text-right py-2.5 text-slate-600">{{ item.quantity }}</td>
                <td class="text-right py-2.5 font-bold text-slate-800">{{ formatMoney(item.subtotal) }} đ</td>
              </tr>
            </tbody>
          </table>

          <div class="border-t-2 border-dashed border-slate-200 pt-4 text-xs space-y-1.5">
            <div class="flex justify-between font-extrabold text-sm text-slate-900 mb-1">
              <span>TỔNG CỘNG:</span>
              <span class="text-primary">{{ formatMoney(invoiceDetails.totalAmount) }} VNĐ</span>
            </div>
            <div class="flex justify-between text-slate-600 font-medium">
              <span>Đã đóng:</span>
              <span>{{ formatMoney(invoiceDetails.paidAmount) }} VNĐ</span>
            </div>
            <div class="flex justify-between font-bold text-slate-800">
              <span>Còn nợ:</span>
              <span class="text-danger">{{ formatMoney(invoiceDetails.totalAmount - invoiceDetails.paidAmount) }} VNĐ</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-6">
          <button @click="closeModal" class="px-4 py-2 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all">Đóng</button>
          <button @click="printReceipt" class="px-4 py-2 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all">🖨️ In Hóa Đơn</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./TenantDashboard.js"></script>
