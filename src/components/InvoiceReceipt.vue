<template>
  <div class="fixed inset-0 bg-black/50 flex justify-center items-start z-50 p-2 sm:p-4 overflow-y-auto">
    <div class="bg-card border border-border-main rounded-2xl shadow-xl w-full max-w-[500px] p-4 sm:p-6 md:p-8 my-4 sm:my-8 relative">
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 bg-card/85 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center z-20 transition-all duration-300">
        <div class="flex flex-col items-center space-y-3">
          <div class="relative w-10 h-10">
            <div class="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p class="text-xs font-semibold text-text-sub animate-pulse">Đang tải chi tiết hóa đơn...</p>
        </div>
      </div>

      <!-- Printable Area -->
      <div id="receipt-print-area-shared" class="font-sans text-black bg-white p-4 sm:p-6 border border-slate-100 rounded-xl">
        <div class="flex items-center justify-between border-b-2 border-slate-200 pb-5 mb-6">
          <div class="flex flex-col">
            <h2 class="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight">HÓA ĐƠN TIỀN PHÒNG & DỊCH VỤ</h2>
            <p class="text-[10px] sm:text-xs text-slate-500 mt-1">
              Kỳ hóa đơn: {{ formatDate(invoice.billingPeriodStart) }} - {{ formatDate(invoice.billingPeriodEnd) }}
            </p>
          </div>
          <div class="text-right flex flex-col items-end">
            <span class="text-[9px] text-slate-400 mt-1.5 font-medium">Mã HĐ: #{{ invoice.id?.substring(0, 8).toUpperCase() }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-[11px] sm:text-xs pb-5 mb-5 border-b border-slate-100 text-slate-700">
          <div class="space-y-1.5">
            <div><span class="text-slate-400 font-medium">Khách thuê:</span> <strong class="text-slate-800">{{ invoice.contract?.tenant?.fullName }}</strong></div>
            <div><span class="text-slate-400 font-medium">Số điện thoại:</span> <span class="text-slate-600 font-medium">{{ invoice.contract?.tenant?.phone || 'Chưa cập nhật' }}</span></div>
            <div><span class="text-slate-400 font-medium">Địa chỉ trọ:</span> <span class="text-slate-600 font-medium">{{ invoice.contract?.room?.boardingHouse?.address || 'Chưa cập nhật' }}</span></div>
          </div>
          <div class="space-y-1.5 text-right">
            <div><span class="text-slate-400 font-medium">Dãy trọ:</span> <strong class="text-slate-800">{{ invoice.contract?.room?.boardingHouse?.name }}</strong></div>
            <div><span class="text-slate-400 font-medium">Phòng số:</span> <strong class="text-primary">Phòng {{ invoice.contract?.room?.roomNumber }}</strong></div>
            <div><span class="text-slate-400 font-medium">Ngày lập HĐ:</span> <span class="text-slate-600 font-medium">{{ formatDate(invoice.invoiceDate) }}</span></div>
          </div>
        </div>

        <!-- Items Breakdown -->
        <div class="overflow-x-auto border border-slate-100 rounded-xl mb-6">
          <table class="print-only-table min-w-[460px] md:min-w-0 w-full text-[11px] sm:text-xs border-collapse table-fixed">
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
                <td class="text-right py-2.5 px-2 text-slate-600">{{ formatMoney(invoice.contract?.contractedRoomPrice) }} đ</td>
                <td class="text-right py-2.5 px-2 text-slate-600 text-center">1</td>
                <td class="text-right py-2.5 px-2 font-bold text-slate-800">{{ formatMoney(invoice.roomPrice) }} đ</td>
              </tr>
              <!-- Tiền điện -->
              <tr class="hover:bg-slate-50/30">
                <td class="py-2.5 px-2 text-slate-800 font-medium break-words">
                  Tiền điện
                  <div class="text-[9px] text-slate-400 font-normal mt-0.5">
                    Chỉ số: {{ invoice.newElectricityIndex }} - {{ invoice.oldElectricityIndex }} ({{ invoice.newElectricityIndex - invoice.oldElectricityIndex }} kWh)
                  </div>
                </td>
                <td class="text-right py-2.5 px-2 text-slate-600">{{ formatMoney(invoice.electricityRate) }} đ</td>
                <td class="text-right py-2.5 px-2 text-slate-600 text-center">{{ invoice.newElectricityIndex - invoice.oldElectricityIndex }}</td>
                <td class="text-right py-2.5 px-2 font-bold text-slate-800">
                  {{ formatMoney((invoice.newElectricityIndex - invoice.oldElectricityIndex) * invoice.electricityRate) }} đ
                </td>
              </tr>
              <!-- Tiền nước -->
              <tr class="hover:bg-slate-50/30">
                <td class="py-2.5 px-2 text-slate-800 font-medium break-words">
                  Tiền nước
                  <div v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'" class="text-[9px] text-slate-400 font-normal mt-0.5">
                    Chỉ số: {{ invoice.newWaterIndex }} - {{ invoice.oldWaterIndex }} ({{ invoice.newWaterIndex - invoice.oldWaterIndex }} m³)
                  </div>
                  <div v-else-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON'" class="text-[9px] text-slate-400 font-normal mt-0.5">Cố định theo đầu người</div>
                  <div v-else class="text-[9px] text-slate-400 font-normal mt-0.5">Cố định theo phòng</div>
                </td>
                <td class="text-right py-2.5 px-2 text-slate-600">{{ formatMoney(invoice.waterRate) }} đ</td>
                <td class="text-right py-2.5 px-2 text-slate-600 text-center">
                  <span v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'">
                    {{ invoice.newWaterIndex - invoice.oldWaterIndex }}
                  </span>
                  <span v-else-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON'">
                    {{ invoice.contract?.numberOfTenants }}
                  </span>
                  <span v-else>1</span>
                </td>
                <td class="text-right py-2.5 px-2 font-bold text-slate-800">
                  <span v-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'BY_INDEX'">
                    {{ formatMoney((invoice.newWaterIndex - invoice.oldWaterIndex) * invoice.waterRate) }} đ
                  </span>
                  <span v-else-if="invoice.contract?.room?.boardingHouse?.waterBillingType === 'FIXED_PER_PERSON'">
                    {{ formatMoney(invoice.contract?.numberOfTenants * invoice.waterRate) }} đ
                  </span>
                  <span v-else>{{ formatMoney(invoice.waterRate) }} đ</span>
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
              <span>{{ formatMoney(invoice.totalAmount) }} đ</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Đã đóng:</span>
              <span class="text-success font-medium">{{ formatMoney(invoice.paidAmount) }} đ</span>
            </div>
            <div class="flex justify-between font-extrabold text-xs sm:text-sm border-t border-slate-100 pt-2 text-slate-900">
              <span>Còn lại cần thu:</span>
              <span class="text-rose-600">{{ formatMoney(invoice.totalAmount - invoice.paidAmount) }} đ</span>
            </div>
          </div>
        </div>

        <!-- Signatures Section -->
        <div class="mt-8 grid grid-cols-2 text-center text-[10px] text-slate-400 uppercase tracking-wider font-semibold pt-6 border-t border-slate-100/50">
          <div>
            <div>Người lập phiếu</div>
            <div class="mt-12 text-slate-700 font-bold normal-case text-xs">
              {{ invoice.contract?.room?.boardingHouse?.landlord?.fullName || 'Chủ trọ' }}
            </div>
          </div>
          <div>
            <div>Người nộp tiền</div>
            <div class="mt-12 text-slate-700 font-bold normal-case text-xs">
              {{ invoice.contract?.tenant?.fullName }}
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap gap-2 justify-end mt-6">
        <button
          :disabled="loading"
          @click="$emit('close')"
          class="px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Đóng
        </button>
        <button
          :disabled="loading"
          @click="downloadReceiptImage"
          class="px-3 py-1.5 text-xs font-semibold border border-primary text-primary rounded-lg hover:bg-primary/5 cursor-pointer transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Lưu ảnh
        </button>
        <button
          :disabled="loading"
          @click="printReceipt"
          class="px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.617 0-1.11-.497-1.12-1.115L6.34 18m11.32 0h-11.32m0 0L7.04 8.757A1.125 1.125 0 0 1 8.16 7.5h7.68a1.125 1.125 0 0 1 1.119 1.007L17.66 18M11.5 5.25v-1.5A1.5 1.5 0 0 1 13 2.25h2.25m-6.75 0H11.5" />
          </svg>
          In
        </button>
        <button
          v-if="isLandlord && invoice.status !== 'PAID'"
          :disabled="loading"
          @click="$emit('pay-before', invoice)"
          class="px-3 py-1.5 text-xs font-bold rounded-lg bg-secondary text-white hover:bg-secondary-hover cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Thu trước
        </button>
        <button
          v-if="isLandlord && invoice.status !== 'PAID'"
          :disabled="loading"
          @click="$emit('pay-all', invoice)"
          class="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary-hover cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Thu đủ
        </button>
      </div>
    </div>
  </div>
</template>

<script src="./InvoiceReceipt.js"></script>
