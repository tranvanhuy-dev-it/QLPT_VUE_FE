<template>
  <div class="tenant-dashboard-page">
    <PageHeader 
      title="Thông Tin Phòng Trọ Của Tôi" 
      subtitle="Xem chi tiết hợp đồng thuê, chỉ số điện nước và hóa đơn thanh toán hàng tháng" 
      :icon="tenantDashboardIcon"
      :showSearch="false"
    />

    <div v-if="loading" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
      Đang tải thông tin phòng trọ...
    </div>

    <div v-else>
      <div v-if="!activeContract" class="card" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
        ⚠️ Hiện tại tài khoản của bạn chưa được gắn vào hợp đồng thuê phòng nào. Vui lòng liên hệ chủ trọ để kích hoạt!
      </div>

      <div v-else>
        <!-- Room and Landlord Overview Card -->
        <div class="grid grid-cols-3" style="margin-bottom: 2rem;">
          <!-- Room info -->
          <div class="card" style="margin-bottom: 0;">
            <h3 class="card-title" style="color: var(--primary-color);">📍 Phòng Của Tôi</h3>
            <div style="font-size: 0.9rem; line-height: 1.75;">
              <div><strong>Số phòng:</strong> Phòng {{ activeContract.room.roomNumber }}</div>
              <div><strong>Dãy trọ:</strong> {{ activeContract.room.boardingHouse.name }}</div>
              <div><strong>Địa chỉ:</strong> {{ activeContract.room.boardingHouse.address || 'Chưa cập nhật' }}</div>
              <div><strong>Số người ở:</strong> {{ activeContract.numberOfTenants }} người</div>
            </div>
          </div>

          <!-- Contract Info -->
          <div class="card" style="margin-bottom: 0;">
            <h3 class="card-title" style="color: var(--success-color);">📄 Chi Tiết Hợp Đồng</h3>
            <div style="font-size: 0.9rem; line-height: 1.75;">
              <div><strong>Giá thuê phòng:</strong> <span style="font-weight: 600;">{{ formatMoney(activeContract.contractedRoomPrice) }} đ/tháng</span></div>
              <div><strong>Tiền đặt cọc:</strong> {{ formatMoney(activeContract.deposit) }} đ</div>
              <div><strong>Ngày bắt đầu:</strong> {{ formatDate(activeContract.startDate) }}</div>
              <div><strong>Kỳ đóng tiền:</strong> 
                {{ activeContract.billingMode === 'BY_RENTAL_DAYS' ? 'Ngày thuê hàng tháng' : `Ngày ${activeContract.fixedBillingDay} hàng tháng` }}
              </div>
            </div>
          </div>

          <!-- Meter Index Info -->
          <div class="card" style="margin-bottom: 0;">
            <h3 class="card-title" style="color: var(--secondary-color);">🔌 Chỉ Số Hiện Tại</h3>
            <div style="font-size: 0.9rem; line-height: 1.75;">
              <div><strong>Điện tiêu thụ:</strong> ⚡ {{ activeContract.room.currentElectricityIndex }} kWh</div>
              <div v-if="activeContract.room.boardingHouse.waterBillingType === 'BY_INDEX'">
                <strong>Nước tiêu thụ:</strong> 💧 {{ activeContract.room.currentWaterIndex }} m³
              </div>
              <div v-else>
                <strong>Nước (cố định):</strong> 💧 Cố định theo {{ activeContract.room.boardingHouse.waterBillingType === 'FIXED_PER_PERSON' ? 'người ở' : 'phòng' }}
              </div>
              <div style="border-top: 1px solid var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary);">
                Chủ nhà: {{ activeContract.room.boardingHouse.landlord.fullName }} - 📞 {{ activeContract.room.boardingHouse.landlord.phone || 'Chưa cập nhật' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Tenant Invoices list -->
        <div class="card">
          <h3 class="card-title">Lịch Sử Hóa Đơn</h3>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Ngày xuất</th>
                  <th>Kỳ thanh toán</th>
                  <th>Tiền phòng</th>
                  <th>Tổng cộng</th>
                  <th>Đã thanh toán</th>
                  <th>Trạng thái</th>
                  <th style="text-align: right;">Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in invoices" :key="invoice.id">
                  <td>{{ formatDate(invoice.invoiceDate) }}</td>
                  <td style="font-size: 0.85rem;">
                    {{ formatDate(invoice.billingPeriodStart) }} - {{ formatDate(invoice.billingPeriodEnd) }}
                  </td>
                  <td>{{ formatMoney(invoice.roomPrice) }} đ</td>
                  <td style="font-weight: 600; color: var(--primary-color);">{{ formatMoney(invoice.totalAmount) }} đ</td>
                  <td style="color: var(--success-color);">{{ formatMoney(invoice.paidAmount) }} đ</td>
                  <td>
                    <span :class="['badge', 
                      invoice.status === 'PAID' ? 'badge-success' : 
                      (invoice.status === 'PARTIALLY_PAID' ? 'badge-warning' : 'badge-danger')
                    ]">
                      {{ invoice.status === 'PAID' ? 'Đã thanh toán' : (invoice.status === 'PARTIALLY_PAID' ? 'Trả một phần' : 'Chưa đóng tiền') }}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button @click="viewDetails(invoice)" class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">
                      Xem Phiếu Chi Tiết
                    </button>
                  </td>
                </tr>
                <tr v-if="invoices.length === 0">
                  <td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    Chưa có hóa đơn nào được tạo cho bạn.
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
    </div>

    <!-- Invoice Receipt Details Modal (Reusable for Tenant) -->
    <div v-if="showDetailModal && invoiceDetails" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; overflow-y: auto; padding: 2rem 0;">
      <div class="card" style="width: 100%; max-width: 500px; padding: 2.5rem; position: relative; margin: auto;">
        
        <div id="receipt-print-area-tenant" style="font-family: inherit; color: #000000; background: #ffffff; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 8px;">
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
              <tr style="border-bottom: 1px dashed #f1f5f9;">
                <td style="padding: 0.5rem 0;">Tiền phòng</td>
                <td style="text-align: right; padding: 0.5rem 0;">{{ formatMoney(invoiceDetails.contract.contractedRoomPrice) }} đ</td>
                <td style="text-align: right; padding: 0.5rem 0;">1</td>
                <td style="text-align: right; padding: 0.5rem 0; font-weight: 500;">{{ formatMoney(invoiceDetails.roomPrice) }} đ</td>
              </tr>
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

        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 2rem;">
          <button @click="closeModal" class="btn btn-outline">Đóng</button>
          <button @click="printReceipt" class="btn btn-primary">🖨️ In Hóa Đơn</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./TenantDashboard.js"></script>
