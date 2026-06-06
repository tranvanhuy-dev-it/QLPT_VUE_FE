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
                  <div>{{ activeContract.room.boardingHouse.landlord?.fullName || 'Chưa cập nhật' }} - 📞 {{ activeContract.room.boardingHouse.landlord?.phone || 'Chưa cập nhật' }}</div>
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
    <div v-if="showDetailModal && invoiceDetails"
      class="fixed inset-0 bg-black/50 flex justify-center items-start z-50 p-2 sm:p-4 overflow-y-auto">
      <div
        class="bg-card border border-border-main rounded-2xl shadow-xl w-full max-w-[500px] p-4 sm:p-6 md:p-8 my-4 sm:my-8 relative">

        <!-- Loading Overlay -->
        <div v-if="isLoadingDetails"
          class="absolute inset-0 bg-card/85 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-20 transition-all duration-300">
          <div class="flex flex-col items-center space-y-3">
            <div class="relative w-10 h-10">
              <div class="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p class="text-xs font-semibold text-text-sub animate-pulse">Đang tải chi tiết hóa đơn...</p>
          </div>
        </div>

        <!-- Printable Element -->
        <div id="receipt-print-area-tenant" class="font-sans text-black bg-white p-4 sm:p-6 border border-slate-100 rounded-xl">
          <div class="flex items-center justify-between border-b-2 border-slate-200 pb-5 mb-6">
            <div class="flex flex-col">
              <h2 class="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">PHIẾU THANH TOÁN TIỀN PHÒNG & DỊCH VỤ</h2>
              <p class="text-[10px] sm:text-xs text-slate-500 mt-1">Kỳ hóa đơn: {{ formatDate(invoiceDetails.billingPeriodStart) }} - {{ formatDate(invoiceDetails.billingPeriodEnd) }}</p>
            </div>
            <div class="text-right flex flex-col items-end">
              <span class="text-[9px] text-slate-400 mt-1.5 font-medium">Mã HĐ: #{{ invoiceDetails.id.substring(0, 8).toUpperCase() }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-[11px] sm:text-xs pb-5 mb-5 border-b border-slate-100 text-slate-700">
            <div class="space-y-1.5">
              <div><span class="text-slate-400 font-medium">Khách thuê:</span> <strong class="text-slate-800">{{ invoiceDetails.contract.tenant.fullName }}</strong></div>
              <div><span class="text-slate-400 font-medium">Số điện thoại:</span> <span class="text-slate-600 font-medium">{{ invoiceDetails.contract.tenant.phone || 'Chưa cập nhật' }}</span></div>
              <div><span class="text-slate-400 font-medium">Địa chỉ trọ:</span> <span class="text-slate-600 font-medium">{{ invoiceDetails.contract.room.boardingHouse.address || 'Chưa cập nhật' }}</span></div>
            </div>
            <div class="space-y-1.5 text-right">
              <div><span class="text-slate-400 font-medium">Dãy trọ:</span> <strong class="text-slate-800">{{ invoiceDetails.contract.room.boardingHouse.name }}</strong></div>
              <div><span class="text-slate-400 font-medium">Phòng số:</span> <strong class="text-primary">Phòng {{ invoiceDetails.contract.room.roomNumber }}</strong></div>
              <div><span class="text-slate-400 font-medium">Ngày lập HĐ:</span> <span class="text-slate-600 font-medium">{{ formatDate(invoiceDetails.invoiceDate) }}</span></div>
            </div>
          </div>

          <!-- Items Breakdown -->
          <div class="overflow-x-auto border border-slate-100 rounded-xl mb-6">
            <table class="print-only-table min-w-[460px] w-full text-[11px] sm:text-xs border-collapse table-fixed">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50">
                  <th class="text-left py-2 px-2 w-[40%] font-bold text-slate-600">Khoản chi phí</th>
                  <th class="text-right py-2 px-2 w-[24%] font-bold text-slate-600">Đơn giá</th>
                  <th class="text-right py-2 px-2 w-[12%] font-bold text-slate-600 text-center">SL</th>
                  <th class="text-right py-2 px-2 w-[24%] font-bold text-slate-600">Thành tiền</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-dashed divide-slate-100">
                <!-- Tiền phòng -->
                <tr class="hover:bg-slate-50/30">
                  <td class="py-2.5 px-2 text-slate-800 font-medium break-words">Tiền phòng</td>
                  <td class="text-right py-2.5 px-2 text-slate-600">{{ formatMoney(invoiceDetails.contract.contractedRoomPrice) }} đ</td>
                  <td class="text-right py-2.5 px-2 text-slate-600 text-center">1</td>
                  <td class="text-right py-2.5 px-2 font-bold text-slate-800">{{ formatMoney(invoiceDetails.roomPrice) }} đ</td>
                </tr>
                <!-- Tiền điện -->
                <tr class="hover:bg-slate-50/30">
                  <td class="py-2.5 px-2 text-slate-800 font-medium break-words">
                    Tiền điện
                    <div class="text-[9px] text-slate-400 font-normal mt-0.5">Chỉ số: {{ invoiceDetails.newElectricityIndex }} - {{ invoiceDetails.oldElectricityIndex }} ({{ invoiceDetails.newElectricityIndex - invoiceDetails.oldElectricityIndex }} kWh)</div>
                  </td>
                  <td class="text-right py-2.5 px-2 text-slate-600">{{ formatMoney(invoiceDetails.electricityRate) }} đ</td>
                  <td class="text-right py-2.5 px-2 text-slate-600 text-center">{{ invoiceDetails.newElectricityIndex - invoiceDetails.oldElectricityIndex }}</td>
                  <td class="text-right py-2.5 px-2 font-bold text-slate-800">
                    {{ formatMoney((invoiceDetails.newElectricityIndex - invoiceDetails.oldElectricityIndex) * invoiceDetails.electricityRate) }} đ
                  </td>
                </tr>
                <!-- Tiền nước -->
                <tr class="hover:bg-slate-50/30">
                  <td class="py-2.5 px-2 text-slate-800 font-medium break-words">
                    Tiền nước
                    <div v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'" class="text-[9px] text-slate-400 font-normal mt-0.5">Chỉ số: {{ invoiceDetails.newWaterIndex }} - {{ invoiceDetails.oldWaterIndex }} ({{ invoiceDetails.newWaterIndex - invoiceDetails.oldWaterIndex }} m³)</div>
                    <div v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'" class="text-[9px] text-slate-400 font-normal mt-0.5">Cố định theo đầu người</div>
                    <div v-else class="text-[9px] text-slate-400 font-normal mt-0.5">Cố định theo phòng</div>
                  </td>
                  <td class="text-right py-2.5 px-2 text-slate-600">{{ formatMoney(invoiceDetails.waterRate) }} đ</td>
                  <td class="text-right py-2.5 px-2 text-slate-600 text-center">
                    <span v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
                      {{ invoiceDetails.newWaterIndex - invoiceDetails.oldWaterIndex }}
                    </span>
                    <span v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'">
                      {{ invoiceDetails.contract.numberOfTenants }}
                    </span>
                    <span v-else>1</span>
                  </td>
                  <td class="text-right py-2.5 px-2 font-bold text-slate-800">
                    <span v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
                      {{ formatMoney((invoiceDetails.newWaterIndex - invoiceDetails.oldWaterIndex) * invoiceDetails.waterRate) }} đ
                    </span>
                    <span v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'">
                      {{ formatMoney(invoiceDetails.contract.numberOfTenants * invoiceDetails.waterRate) }} đ
                    </span>
                    <span v-else>{{ formatMoney(invoiceDetails.waterRate) }} đ</span>
                  </td>
                </tr>
                <!-- Phụ phí dịch vụ riêng -->
                <tr v-for="item in invoiceItems" :key="item.id" class="hover:bg-slate-50/30">
                  <td class="py-2.5 px-2 text-slate-800 font-medium break-words">{{ item.name }}</td>
                  <td class="text-right py-2.5 px-2 text-slate-600">{{ formatMoney(item.price) }} đ</td>
                  <td class="text-right py-2.5 px-2 text-slate-600 text-center">{{ item.quantity }}</td>
                  <td class="text-right py-2.5 px-2 font-bold text-slate-800">{{ formatMoney(item.subtotal) }} đ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="border-t-2 border-slate-200 pt-4 text-[11px] sm:text-xs flex justify-end">
            <div class="w-full sm:w-[50%] space-y-2">
              <div class="flex justify-between font-semibold text-slate-700">
                <span>Tổng chi phí:</span>
                <span>{{ formatMoney(invoiceDetails.totalAmount) }} đ</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Đã đóng:</span>
                <span class="text-success font-medium">{{ formatMoney(invoiceDetails.paidAmount) }} đ</span>
              </div>
              <div class="flex justify-between font-extrabold text-xs sm:text-sm border-t border-slate-100 pt-2 text-slate-900">
                <span>Còn lại cần thu:</span>
                <span class="text-rose-600">{{ formatMoney(invoiceDetails.totalAmount - invoiceDetails.paidAmount) }} đ</span>
              </div>
            </div>
          </div>

          <!-- Signatures Section -->
          <div class="mt-8 grid grid-cols-2 text-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold pt-6 border-t border-slate-100/50">
            <div>
              <div>Người lập phiếu</div>
              <div class="mt-12 text-slate-700 font-bold normal-case text-xs">{{ invoiceDetails.contract.room.boardingHouse.landlord?.fullName || 'Chủ trọ' }}</div>
            </div>
            <div>
              <div>Người nộp tiền</div>
              <div class="mt-12 text-slate-700 font-bold normal-case text-xs">{{ invoiceDetails.contract.tenant.fullName }}</div>
            </div>
          </div>
        </div>

        <!-- Modal control buttons -->
        <div class="flex flex-wrap gap-2 justify-end mt-6">
          <button :disabled="isLoadingDetails" @click="closeModal"
            class="px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed">Đóng</button>
          <button :disabled="isLoadingDetails" @click="downloadReceiptImage"
            class="px-3 py-1.5 text-xs font-semibold border border-primary text-primary rounded-lg hover:bg-primary/5 cursor-pointer transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Lưu ảnh
          </button>
          <button :disabled="isLoadingDetails" @click="printReceipt"
            class="px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.617 0-1.11-.497-1.12-1.115L6.34 18m11.32 0h-11.32m0 0L7.04 8.757A1.125 1.125 0 0 1 8.16 7.5h7.68a1.125 1.125 0 0 1 1.119 1.007L17.66 18M11.5 5.25v-1.5A1.5 1.5 0 0 1 13 2.25h2.25m-6.75 0H11.5" />
            </svg>
            In
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./TenantDashboard.js"></script>
