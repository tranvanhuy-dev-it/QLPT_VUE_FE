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

          <div class="flex flex-col gap-1.5 mb-6">
            <label class="text-xs font-semibold text-text-sub uppercase">Ngày lập hóa đơn *</label>
            <input type="date"
              class="w-full px-3 py-2 border border-border-main rounded-lg bg-slate-50 dark:bg-slate-900 text-text-main text-sm outline-none focus:bg-white focus:border-primary"
              v-model="form.invoiceDate" required />
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
      class="fixed inset-0 bg-black/50 flex justify-center items-start z-50 p-4 overflow-y-auto">
      <div
        class="bg-card border border-border-main rounded-2xl shadow-xl w-full max-w-[500px] p-6 md:p-8 my-8 relative">

        <!-- Printable Element -->
        <div id="receipt-print-area" class="font-sans text-black bg-white p-5 border border-slate-200 rounded-xl">
          <div class="text-center border-b-2 border-dashed border-slate-200 pb-4 mb-6">
            <h2 class="font-bold text-xl text-primary m-0">HÓA ĐƠN TIỀN TRỌ</h2>
            <p class="text-sm mt-1 text-slate-600 font-semibold">{{ invoiceDetails.contract.room.boardingHouse.name }}
            </p>
            <p class="text-xs text-slate-400 mt-0.5">Kỳ hóa đơn: {{ formatDate(invoiceDetails.billingPeriodStart) }} -
              {{ formatDate(invoiceDetails.billingPeriodEnd) }}</p>
          </div>

          <div class="text-xs space-y-1.5 pb-4 mb-5 border-b border-slate-100 text-slate-700">
            <div><strong>Phòng số:</strong> {{ invoiceDetails.contract.room.roomNumber }}</div>
            <div><strong>Khách thuê:</strong> {{ invoiceDetails.contract.tenant.fullName }}</div>
            <div><strong>Ngày xuất:</strong> {{ formatDate(invoiceDetails.invoiceDate) }}</div>
          </div>

          <!-- Items Breakdown -->
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
              <!-- Tiền phòng -->
              <tr>
                <td class="py-2.5 text-slate-800">Tiền phòng</td>
                <td class="text-right py-2.5 text-slate-600">{{ formatMoney(invoiceDetails.contract.contractedRoomPrice)
                }} đ</td>
                <td class="text-right py-2.5 text-slate-600">1</td>
                <td class="text-right py-2.5 font-bold text-slate-800">{{ formatMoney(invoiceDetails.roomPrice) }} đ
                </td>
              </tr>
              <!-- Tiền điện -->
              <tr>
                <td class="py-2.5 text-slate-800">
                  Tiền điện ({{ invoiceDetails.newElectricityIndex }} - {{ invoiceDetails.oldElectricityIndex }} số)
                </td>
                <td class="text-right py-2.5 text-slate-600">{{ formatMoney(invoiceDetails.electricityRate) }} đ</td>
                <td class="text-right py-2.5 text-slate-600">{{ invoiceDetails.newElectricityIndex -
                  invoiceDetails.oldElectricityIndex }}</td>
                <td class="text-right py-2.5 font-bold text-slate-800">
                  {{ formatMoney((invoiceDetails.newElectricityIndex - invoiceDetails.oldElectricityIndex) *
                    invoiceDetails.electricityRate) }} đ
                </td>
              </tr>
              <!-- Tiền nước -->
              <tr>
                <td class="py-2.5 text-slate-800">
                  Tiền nước
                  <span v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'"
                    class="text-[10px] text-slate-400">
                    ({{ invoiceDetails.newWaterIndex }} - {{ invoiceDetails.oldWaterIndex }} khối)
                  </span>
                  <span v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'"
                    class="text-[10px] text-slate-400">
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
                    {{ formatMoney((invoiceDetails.newWaterIndex - invoiceDetails.oldWaterIndex) *
                      invoiceDetails.waterRate) }} đ
                  </span>
                  <span v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'">
                    {{ formatMoney(invoiceDetails.contract.numberOfTenants * invoiceDetails.waterRate) }} đ
                  </span>
                  <span v-else>{{ formatMoney(invoiceDetails.waterRate) }} đ</span>
                </td>
              </tr>
              <!-- Phụ phí dịch vụ riêng -->
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
              <span class="text-danger">{{ formatMoney(invoiceDetails.totalAmount - invoiceDetails.paidAmount) }}
                VNĐ</span>
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
