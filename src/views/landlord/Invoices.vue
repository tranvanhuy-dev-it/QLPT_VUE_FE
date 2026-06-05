<template>
  <div class="invoices-page">
    <PageHeader 
      title="Hóa Đơn & Thanh Toán" 
      subtitle="Ghi chỉ số điện nước, lập hóa đơn phòng hàng tháng và theo dõi nợ" 
      :icon="invoiceIcon"
      :showAdd="true"
      addText="Lập Hóa Đơn Tháng"
      :disableAdd="activeContracts.length === 0"
      searchPlaceholder="Tìm theo phòng, dãy trọ, khách thuê..."
      v-model="searchQuery"
      @add-click="openCreateModal"
    />

    <!-- Invoices List -->
    <div class="card">
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <span>Đang tải danh sách hóa đơn...</span>
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Khách thuê</th>
                <th>Kỳ tính tiền</th>
                <th>Tổng tiền</th>
                <th>Đã thanh toán</th>
                <th style="text-align: right;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in filteredInvoices" :key="invoice.id">
                <td style="font-weight: 600; color: var(--primary-color);">Phòng {{ invoice.contract.room.roomNumber }}</td>
                <td>{{ invoice.contract.tenant.fullName }}</td>
                <td style="font-size: 0.85rem;">
                  {{ formatDate(invoice.billingPeriodStart) }} - {{ formatDate(invoice.billingPeriodEnd) }}
                </td>
                <td style="font-weight: 600; color: var(--primary-color);">{{ formatMoney(invoice.totalAmount) }} đ</td>
                <td style="color: var(--success-color);">{{ formatMoney(invoice.paidAmount) }} đ</td>
                <td style="text-align: right; display: flex; gap: 0.25rem; justify-content: flex-end;">
                  <button @click="viewDetails(invoice)" class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                    Chi Tiết
                  </button>
                  <button 
                    v-if="invoice.status !== 'PAID'"
                    @click="openPayModal(invoice)" 
                    class="btn btn-secondary"
                    style="padding: 0.4rem 0.8rem; font-size: 0.85rem;"
                  >
                    Thu Tiền
                  </button>
                </td>
              </tr>
              <tr v-if="filteredInvoices.length === 0">
                <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                  Không tìm thấy hóa đơn nào.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
          <span style="font-size: 0.875rem; color: var(--text-secondary);">
            Trang {{ page + 1 }} / {{ totalPages }} (Tổng số: {{ totalElements }} hóa đơn)
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

    <!-- Create Invoice Modal -->
    <div v-if="showCreateModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div class="card" style="width: 100%; max-width: 550px; padding: 2rem; margin: 1rem; position: relative;">
        <h3 class="card-title">Lập Hóa Đơn Tiền Phòng</h3>
        
        <form @submit.prevent="saveInvoice">
          <div class="form-group">
            <label class="form-label">Chọn Hợp Đồng Thuê Hoạt Động *</label>
            <select class="form-select" v-model="form.contractId" @change="onContractChange" required>
              <option v-for="c in activeContracts" :key="c.id" :value="c.id">
                Phòng {{ c.room.roomNumber }} - {{ c.tenant.fullName }} ({{ c.room.boardingHouse.name }})
              </option>
            </select>
          </div>

          <!-- Preview details of the room index -->
          <div v-if="selectedContract" style="background: rgba(0, 102, 204, 0.05); padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem;">
            <div>⚡ Chỉ số điện cũ: <span style="font-weight: 600;">{{ selectedContract.room.currentElectricityIndex }} kWh</span></div>
            <div v-if="selectedContract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
              💧 Chỉ số nước cũ: <span style="font-weight: 600;">{{ selectedContract.room.currentWaterIndex }} m³</span>
            </div>
            <div v-else>
              💧 Tiền nước cố định: 
              <span style="font-weight: 600;">
                {{ formatMoney(selectedContract.room.boardingHouse.defaultWaterRate) }} đ
                ({{ selectedContract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON' ? 'mỗi người' : 'mỗi phòng' }})
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2" style="gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Chỉ số điện mới (tháng này) *</label>
              <input type="number" class="form-input" v-model.number="form.newElectricityIndex" min="0" required />
            </div>

            <div class="form-group" v-if="selectedContract && selectedContract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
              <label class="form-label">Chỉ số nước mới (tháng này) *</label>
              <input type="number" class="form-input" v-model.number="form.newWaterIndex" min="0" required />
            </div>
          </div>

          <div class="grid grid-cols-2" style="gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Kỳ thanh toán từ ngày *</label>
              <input type="date" class="form-input" v-model="form.billingPeriodStart" required />
            </div>

            <div class="form-group">
              <label class="form-label">Kỳ thanh toán đến ngày *</label>
              <input type="date" class="form-input" v-model="form.billingPeriodEnd" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Ngày lập hóa đơn *</label>
            <input type="date" class="form-input" v-model="form.invoiceDate" required />
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
            <button type="button" @click="closeModal" class="btn btn-outline">Hủy</button>
            <button type="submit" class="btn btn-primary">Tính Tiền & Xuất Hóa Đơn</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Record Payment Modal -->
    <div v-if="showPayModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div class="card" style="width: 100%; max-width: 400px; padding: 2rem; position: relative;">
        <h3 class="card-title">Ghi Nhận Thanh Toán</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Phòng {{ payForm.roomNumber }} - Tổng nợ: {{ formatMoney(payForm.remainingAmount) }} đ
        </p>

        <form @submit.prevent="submitPayment">
          <div class="form-group">
            <label class="form-label">Số tiền khách đóng (VNĐ) *</label>
            <input type="number" class="form-input" v-model.number="payForm.paidAmount" :max="payForm.remainingAmount" min="1000" required />
          </div>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
            <button type="button" @click="closeModal" class="btn btn-outline">Hủy</button>
            <button type="submit" class="btn btn-primary">Xác Nhận Thu Tiền</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Invoice Receipt Details Modal (Glassmorphism + printable) -->
    <div v-if="showDetailModal && invoiceDetails" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; overflow-y: auto; padding: 2rem 0;">
      <div class="card" style="width: 100%; max-width: 500px; padding: 2.5rem; background: var(--card-bg); box-shadow: var(--shadow-lg); position: relative; margin: auto;">
        
        <!-- Printable Element -->
        <div id="receipt-print-area" style="font-family: inherit; color: #000000; background: #ffffff; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 1rem; margin-bottom: 1.5rem;">
            <h2 style="font-weight: 700; margin: 0; font-size: 1.5rem; color: var(--primary-color);">HÓA ĐƠN TIỀN TRỌ</h2>
            <p style="font-size: 0.85rem; margin-top: 0.25rem; color: #475569;">{{ invoiceDetails.contract.room.boardingHouse.name }}</p>
            <p style="font-size: 0.75rem; color: #64748b;">Kỳ hóa đơn: {{ formatDate(invoiceDetails.billingPeriodStart) }} - {{ formatDate(invoiceDetails.billingPeriodEnd) }}</p>
          </div>

          <div style="font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
            <div><strong>Phòng số:</strong> {{ invoiceDetails.contract.room.roomNumber }}</div>
            <div><strong>Khách thuê:</strong> {{ invoiceDetails.contract.tenant.fullName }}</div>
            <div><strong>Ngày xuất:</strong> {{ formatDate(invoiceDetails.invoiceDate) }}</div>
          </div>

          <!-- Items Breakdown -->
          <table style="width: 100%; font-size: 0.85rem; border-collapse: collapse; margin-bottom: 1.5rem;">
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <th style="text-align: left; padding: 0.5rem 0; font-weight: 600;">Khoản chi phí</th>
                <th style="text-align: right; padding: 0.5rem 0; font-weight: 600;">Đơn giá</th>
                <th style="text-align: right; padding: 0.5rem 0; font-weight: 600;">SL</th>
                <th style="text-align: right; padding: 0.5rem 0; font-weight: 600;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <!-- Tiền phòng -->
              <tr style="border-bottom: 1px dashed #f1f5f9;">
                <td style="padding: 0.5rem 0;">Tiền phòng</td>
                <td style="text-align: right; padding: 0.5rem 0;">{{ formatMoney(invoiceDetails.contract.contractedRoomPrice) }} đ</td>
                <td style="text-align: right; padding: 0.5rem 0;">1</td>
                <td style="text-align: right; padding: 0.5rem 0; font-weight: 500;">{{ formatMoney(invoiceDetails.roomPrice) }} đ</td>
              </tr>
              <!-- Tiền điện -->
              <tr style="border-bottom: 1px dashed #f1f5f9;">
                <td style="padding: 0.5rem 0;">
                  Tiền điện ({{ invoiceDetails.newElectricityIndex }} - {{ invoiceDetails.oldElectricityIndex }} số)
                </td>
                <td style="text-align: right; padding: 0.5rem 0;">{{ formatMoney(invoiceDetails.electricityRate) }} đ</td>
                <td style="text-align: right; padding: 0.5rem 0;">{{ invoiceDetails.newElectricityIndex - invoiceDetails.oldElectricityIndex }}</td>
                <td style="text-align: right; padding: 0.5rem 0; font-weight: 500;">
                  {{ formatMoney((invoiceDetails.newElectricityIndex - invoiceDetails.oldElectricityIndex) * invoiceDetails.electricityRate) }} đ
                </td>
              </tr>
              <!-- Tiền nước -->
              <tr style="border-bottom: 1px dashed #f1f5f9;">
                <td style="padding: 0.5rem 0;">
                  Tiền nước 
                  <span v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
                    ({{ invoiceDetails.newWaterIndex }} - {{ invoiceDetails.oldWaterIndex }} khối)
                  </span>
                  <span v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'">
                    (cố định / người)
                  </span>
                  <span v-else>(cố định / phòng)</span>
                </td>
                <td style="text-align: right; padding: 0.5rem 0;">{{ formatMoney(invoiceDetails.waterRate) }} đ</td>
                <td style="text-align: right; padding: 0.5rem 0;">
                  <span v-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
                    {{ invoiceDetails.newWaterIndex - invoiceDetails.oldWaterIndex }}
                  </span>
                  <span v-else-if="invoiceDetails.contract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON'">
                    {{ invoiceDetails.contract.numberOfTenants }}
                  </span>
                  <span v-else>1</span>
                </td>
                <td style="text-align: right; padding: 0.5rem 0; font-weight: 500;">
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
              <tr v-for="item in invoiceItems" :key="item.id" style="border-bottom: 1px dashed #f1f5f9;">
                <td style="padding: 0.5rem 0;">{{ item.name }}</td>
                <td style="text-align: right; padding: 0.5rem 0;">{{ formatMoney(item.price) }} đ</td>
                <td style="text-align: right; padding: 0.5rem 0;">{{ item.quantity }}</td>
                <td style="text-align: right; padding: 0.5rem 0; font-weight: 500;">{{ formatMoney(item.subtotal) }} đ</td>
              </tr>
            </tbody>
          </table>

          <div style="border-top: 2px dashed #cbd5e1; padding-top: 1rem; font-size: 0.95rem;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;">
              <span>TỔNG CỘNG:</span>
              <span style="color: var(--primary-color);">{{ formatMoney(invoiceDetails.totalAmount) }} VNĐ</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
              <span>Đã đóng:</span>
              <span>{{ formatMoney(invoiceDetails.paidAmount) }} VNĐ</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
              <span>Còn nợ:</span>
              <span style="color: var(--danger-color);">{{ formatMoney(invoiceDetails.totalAmount - invoiceDetails.paidAmount) }} VNĐ</span>
            </div>
          </div>
        </div>

        <!-- Modal control buttons -->
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 2rem;">
          <button @click="closeModal" class="btn btn-outline">Đóng</button>
          <button @click="printReceipt" class="btn btn-primary">🖨️ In Hóa Đơn</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./Invoices.js"></script>
