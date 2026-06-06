<template>
  <div class="p-4 bg-bg-main min-h-screen">
    <PageHeader title="Hóa Đơn & Thanh Toán"
      subtitle="Ghi chỉ số điện nước, lập hóa đơn phòng hàng tháng và theo dõi nợ" :icon="invoiceIcon" :showAdd="true"
      addText="Thêm" :disableAdd="activeContracts.length === 0"
      searchPlaceholder="Tìm theo phòng, dãy trọ, khách thuê..." v-model="searchQuery" @add-click="openCreateModal" />

    <!-- Invoices List -->
    <div class="bg-card border border-border-main rounded-2xl p-4 shadow-xs">
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 gap-4 text-text-sub">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Đang tải danh sách hóa đơn...</span>
      </div>

      <div v-else>
        <div class="overflow-x-auto border border-border-main/50 rounded-xl bg-card">
          <table class="w-full text-sm text-left text-text-main border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/40 border-b border-border-main/60">
              <tr>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Phòng</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Khách thuê</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Kỳ tính tiền</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Tổng tiền</th>
                <th class="py-2 px-4 font-bold text-text-sub text-[11px] uppercase tracking-wider">Đã thanh toán</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in filteredInvoices" :key="invoice.id"
                class="border-b border-border-main/30 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 cursor-pointer transition-colors duration-150"
                @click="viewDetails(invoice)">
                <td class="py-2.5 px-4 font-semibold text-primary">Phòng {{ invoice.contract.room.roomNumber }}</td>
                <td class="py-2.5 px-4 font-medium">{{ invoice.contract.tenant.fullName }}</td>
                <td class="py-2.5 px-4 text-xs text-text-sub">
                  {{ formatDate(invoice.billingPeriodStart) }} - {{ formatDate(invoice.billingPeriodEnd) }}
                </td>
                <td class="py-2.5 px-4 font-semibold text-primary">{{ formatMoney(invoice.totalAmount) }} đ</td>
                <td class="py-2.5 px-4 font-semibold text-success">{{ formatMoney(invoice.paidAmount) }} đ</td>
              </tr>
              <tr v-if="filteredInvoices.length === 0">
                <td colspan="5" class="text-center text-text-sub py-12">
                  Không tìm thấy hóa đơn nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div
          class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-border-main/50">
          <span class="text-xs text-text-sub">
            Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} hóa đơn)
          </span>
          <div class="flex gap-2">
            <button
              class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
              :disabled="page === 0" @click="changePage(page - 1)">
              Trước
            </button>
            <button
              class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-50 disabled:bg-slate-100 disabled:text-text-sub/50 disabled:cursor-not-allowed cursor-pointer transition-all duration-150"
              :disabled="page >= totalPages - 1" @click="changePage(page + 1)">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Invoice Modal -->
    <div v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        class="bg-card border border-border-main rounded-2xl shadow-lg w-full max-w-[550px] p-6 md:p-8 m-auto relative">
        <h3 class="text-xl font-bold text-text-main mb-6">Lập Hóa Đơn Tiền Phòng</h3>

        <form @submit.prevent="saveInvoice">
          <div class="flex flex-col gap-1.5 mb-4">
            <label class="text-xs font-semibold text-text-sub uppercase">Chọn Hợp Đồng Thuê Hoạt Động *</label>
            <select
              class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary"
              v-model="form.contractId" @change="onContractChange" required>
              <option v-for="c in activeContracts" :key="c.id" :value="c.id">
                Phòng {{ c.room.roomNumber }} - {{ c.tenant.fullName }} ({{ c.room.boardingHouse.name }})
              </option>
            </select>
          </div>

          <!-- Preview details of the room index -->
          <div v-if="selectedContract"
            class="bg-[rgba(0,102,204,0.05)] border border-border-main/50 rounded-xl p-4 mb-4 text-xs flex flex-col gap-2">
            <div class="text-text-main">⚡ Chỉ số điện cũ: <span class="font-bold">{{
              selectedContract.room.currentElectricityIndex }} kWh</span></div>
            <div v-if="selectedContract.room.boardingHouse.waterBillingType === 'BY_INDEX'" class="text-text-main">
              💧 Chỉ số nước cũ: <span class="font-bold">{{ selectedContract.room.currentWaterIndex }} m³</span>
            </div>
            <div v-else class="text-text-main">
              💧 Tiền nước cố định:
              <span class="font-bold">
                {{ formatMoney(selectedContract.room.boardingHouse.defaultWaterRate) }} đ
                ({{ selectedContract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON' ? 'mỗi người' : 'mỗi phòng' }})
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Chỉ số điện mới (tháng này) *</label>
              <input type="number"
                class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary"
                v-model.number="form.newElectricityIndex" min="0" required />
            </div>

            <div class="flex flex-col gap-1.5"
              v-if="selectedContract && selectedContract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
              <label class="text-xs font-semibold text-text-sub uppercase">Chỉ số nước mới (tháng này) *</label>
              <input type="number"
                class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary"
                v-model.number="form.newWaterIndex" min="0" required />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Kỳ thanh toán từ ngày *</label>
              <input type="date"
                class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary"
                v-model="form.billingPeriodStart" required />
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-text-sub uppercase">Kỳ thanh toán đến ngày *</label>
              <input type="date"
                class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary"
                v-model="form.billingPeriodEnd" required />
            </div>
          </div>

          <div class="flex flex-col gap-1.5 mb-5">
            <label class="text-xs font-semibold text-text-sub uppercase">Ngày lập hóa đơn *</label>
            <input type="date"
              class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary"
              v-model="form.invoiceDate" required />
          </div>

          <!-- Advanced options (e.g., checkout/final billing) -->
          <div v-if="selectedContract" class="mb-6 p-4 rounded-xl border border-border-main/50 bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
            <div class="text-[10px] font-bold text-text-sub uppercase tracking-wider mb-1">Cấu hình nâng cao (Kỳ cuối / Trả phòng)</div>
            
            <label v-if="selectedContract.room.boardingHouse.billingTiming === 'PREPAID'" class="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-text-main">
              <input type="checkbox" v-model="form.excludeRoomPrice" class="mt-0.5 rounded border-border-main text-primary focus:ring-primary cursor-pointer" />
              <div class="flex flex-col">
                <span>Không thu tiền phòng (Chỉ tính điện nước)</span>
                <span class="text-[10px] text-text-sub font-normal">Sử dụng cho kỳ hóa đơn cuối cùng trước khi trả phòng (do tiền phòng đã đóng trước đó).</span>
              </div>
            </label>

            <label class="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-text-main">
              <input type="checkbox" v-model="form.excludeExtraFees" class="mt-0.5 rounded border-border-main text-primary focus:ring-primary cursor-pointer" />
              <div class="flex flex-col">
                <span>Không thu các phụ phí dịch vụ</span>
                <span class="text-[10px] text-text-sub font-normal">Sử dụng để bỏ qua các phí dịch vụ định kỳ (Wifi, vệ sinh...) khi thanh lý hợp đồng.</span>
              </div>
            </label>
          </div>

          <div class="flex gap-3 justify-end mt-4">
            <button type="button" @click="closeModal"
              class="px-4 py-2 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all">Hủy</button>
            <button type="submit"
              class="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary-hover cursor-pointer transition-all">Lập
              hóa đơn</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Record Payment Modal -->
    <div v-if="showPayModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-card border border-border-main rounded-2xl shadow-lg w-full max-w-[400px] p-6 relative">
        <h3 class="text-lg font-bold text-text-main mb-2">Ghi Nhận Thanh Toán</h3>
        <p class="text-xs text-text-sub mb-5">
          Phòng {{ payForm.roomNumber }} - Tổng nợ: <span class="font-bold text-danger">{{
            formatMoney(payForm.remainingAmount) }} đ</span>
        </p>

        <form @submit.prevent="submitPayment">
          <div class="flex flex-col gap-1.5 mb-6">
            <label class="text-xs font-semibold text-text-sub uppercase">Số tiền khách đóng (VNĐ) *</label>
            <input type="number"
              class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary"
              v-model.number="payForm.paidAmount" :max="payForm.remainingAmount" min="1000" required />
          </div>

          <div class="flex gap-3 justify-end mt-4">
            <button type="button" @click="closeModal"
              class="px-4 py-2 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all">Hủy</button>
            <button type="submit"
              class="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary-hover cursor-pointer transition-all">Xác
              nhận</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Invoice Receipt Details Modal -->
    <div v-if="showDetailModal && invoiceDetails"
      class="fixed inset-0 bg-black/50 flex justify-center items-start z-50 p-2 sm:p-4 overflow-y-auto">
      <div
        class="bg-card border border-border-main rounded-2xl shadow-xl w-full max-w-[500px] p-4 sm:p-6 md:p-8 my-4 sm:my-8 relative">

        <!-- Printable Element -->
        <div id="receipt-print-area" class="font-sans text-black bg-white p-4 sm:p-6 border border-slate-100 rounded-xl">
          <div class="flex items-center justify-between border-b-2 border-slate-200 pb-5 mb-6">
            <div class="flex flex-col">
              <h2 class="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight">PHIẾU THANH TOÁN TIỀN PHÒNG & DỊCH VỤ</h2>
              <p class="text-[10px] sm:text-xs text-slate-500 mt-1">Kỳ hóa đơn: {{ formatDate(invoiceDetails.billingPeriodStart) }} - {{ formatDate(invoiceDetails.billingPeriodEnd) }}</p>
            </div>
            <div class="text-right flex flex-col items-end">
              <span v-if="invoiceDetails.status === 'PAID'" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500 text-emerald-600 bg-emerald-50/50 uppercase tracking-wider">Đã thanh toán</span>
              <span v-else-if="invoiceDetails.status === 'PARTIALLY_PAID'" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-amber-500 text-amber-600 bg-amber-50/50 uppercase tracking-wider">Mới trả một phần</span>
              <span v-else class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-rose-500 text-rose-600 bg-rose-50/50 uppercase tracking-wider">Chưa thanh toán</span>
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
          <!-- Mobile view (Screen only) -->
          <div class="screen-only-mobile block md:hidden space-y-3 mb-6 print-hidden">
            <!-- Tiền phòng -->
            <div class="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
              <div class="flex justify-between font-bold text-slate-800 text-xs">
                <span>Tiền phòng</span>
                <span class="text-slate-900">{{ formatMoney(invoiceDetails.roomPrice) }} đ</span>
              </div>
              <div class="text-[10px] text-slate-400">Đơn giá: {{ formatMoney(invoiceDetails.contract.contractedRoomPrice) }} đ/tháng x 1</div>
            </div>
            
            <!-- Tiền điện -->
            <div class="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
              <div class="flex justify-between font-bold text-slate-800 text-xs">
                <span>Tiền điện</span>
                <span class="text-slate-900">{{ formatMoney((invoiceDetails.newElectricityIndex - invoiceDetails.oldElectricityIndex) * invoiceDetails.electricityRate) }} đ</span>
              </div>
              <div class="text-[10px] text-slate-400">Số điện: {{ invoiceDetails.newElectricityIndex }} - {{ invoiceDetails.oldElectricityIndex }} ({{ invoiceDetails.newElectricityIndex - invoiceDetails.oldElectricityIndex }} kWh)</div>
              <div class="text-[10px] text-slate-400">Đơn giá: {{ formatMoney(invoiceDetails.electricityRate) }} đ/kWh</div>
            </div>

            <!-- Tiền nước -->
            <div class="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
              <div class="flex justify-between font-bold text-slate-800 text-xs">
                <span>Tiền nước</span>
                <span class="text-slate-900">
                  <span v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
                    {{ formatMoney((invoiceDetails.newWaterIndex - invoiceDetails.oldWaterIndex) * invoiceDetails.waterRate) }} đ
                  </span>
                  <span v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'">
                    {{ formatMoney(invoiceDetails.contract.numberOfTenants * invoiceDetails.waterRate) }} đ
                  </span>
                  <span v-else>{{ formatMoney(invoiceDetails.waterRate) }} đ</span>
                </span>
              </div>
              <div v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'" class="text-[10px] text-slate-400">Số nước: {{ invoiceDetails.newWaterIndex }} - {{ invoiceDetails.oldWaterIndex }} ({{ invoiceDetails.newWaterIndex - invoiceDetails.oldWaterIndex }} m³)</div>
              <div v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'" class="text-[10px] text-slate-400">Nước cố định theo người: {{ invoiceDetails.contract.numberOfTenants }} người</div>
              <div v-else class="text-[10px] text-slate-400">Nước cố định theo phòng</div>
              <div class="text-[10px] text-slate-400">Đơn giá: {{ formatMoney(invoiceDetails.waterRate) }} đ</div>
            </div>

            <!-- Phụ phí dịch vụ riêng -->
            <div v-for="item in invoiceItems" :key="item.id" class="bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
              <div class="flex justify-between font-bold text-slate-800 text-xs">
                <span>{{ item.name }}</span>
                <span class="text-slate-900">{{ formatMoney(item.subtotal) }} đ</span>
              </div>
              <div class="text-[10px] text-slate-400">Số lượng: {{ item.quantity }} x Đơn giá: {{ formatMoney(item.price) }} đ</div>
            </div>
          </div>

          <!-- Table view (Desktop and Print) -->
          <table class="print-only-table hidden md:table w-full text-[11px] sm:text-xs border-collapse mb-6 table-fixed">
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
        <div class="flex gap-3 justify-end mt-6">
          <button @click="closeModal"
            class="px-4 py-2 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all">Đóng</button>
          <button @click="printReceipt"
            class="px-4 py-2 text-sm font-semibold border border-border-main rounded-lg text-text-main hover:bg-slate-100 cursor-pointer transition-all">
            In</button>
          <button v-if="invoiceDetails.status !== 'PAID'" @click="payInvoiceFromDetails"
            class="px-4 py-2 text-sm font-bold rounded-lg bg-secondary text-white hover:bg-secondary-hover cursor-pointer transition-all">
            Thu trước
          </button>
          <button v-if="invoiceDetails.status !== 'PAID'" @click="quickPayInvoice"
            class="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-white hover:bg-primary-hover cursor-pointer transition-all">
            Thu đủ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Invoices.js"></script>
