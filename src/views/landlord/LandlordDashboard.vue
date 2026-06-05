<template>
  <div class="app-container">
    <Sidebar />

    <main class="main-content">
      <header style="margin-bottom: 2rem;">
        <h1 style="font-weight: 700; font-size: 1.75rem;">Tổng Quan Hệ Thống</h1>
        <p style="color: var(--text-secondary);">Thống kê hoạt động kinh doanh phòng trọ</p>
      </header>

      <!-- Stats Grid -->
      <div class="grid grid-cols-4" style="margin-bottom: 2rem;">
        <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
          <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">DÃY TRỌ</span>
          <h2 style="font-size: 2.25rem; font-weight: 700; color: var(--primary-color); margin-top: 0.5rem;">
            {{ stats.boardingHousesCount }}
          </h2>
        </div>
        
        <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
          <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">TỔNG SỐ PHÒNG TRỌ</span>
          <h2 style="font-size: 2.25rem; font-weight: 700; color: var(--secondary-color); margin-top: 0.5rem;">
            {{ stats.roomsCount }}
          </h2>
          <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">
            Đang thuê: {{ stats.occupiedRooms }} | Còn trống: {{ stats.vacantRooms }}
          </span>
        </div>

        <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
          <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">HỢP ĐỒNG HOẠT ĐỘNG</span>
          <h2 style="font-size: 2.25rem; font-weight: 700; color: var(--success-color); margin-top: 0.5rem;">
            {{ stats.activeContracts }}
          </h2>
        </div>

        <div class="card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
          <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500;">HÓA ĐƠN CHƯA ĐÓNG</span>
          <h2 style="font-size: 2.25rem; font-weight: 700; color: var(--danger-color); margin-top: 0.5rem;">
            {{ stats.unpaidInvoicesCount }}
          </h2>
          <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem;">
            Số tiền nợ: {{ formatMoney(stats.unpaidAmount) }} VNĐ
          </span>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="grid grid-cols-2">
        <!-- Room Status list -->
        <div class="card">
          <h3 class="card-title">Phòng Trọ Trống</h3>
          <div class="table-responsive" style="max-height: 300px;">
            <table class="table">
              <thead>
                <tr>
                  <th>Số phòng</th>
                  <th>Dãy trọ</th>
                  <th>Giá thuê mặc định</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in vacantRoomList" :key="room.id">
                  <td style="font-weight: 600; color: var(--primary-color);">Phong {{ room.roomNumber }}</td>
                  <td>{{ room.boardingHouse.name }}</td>
                  <td>{{ formatMoney(room.basePrice) }} VNĐ</td>
                </tr>
                <tr v-if="vacantRoomList.length === 0">
                  <td colspan="3" style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">
                    Hết phòng trống!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Latest Unpaid Invoices -->
        <div class="card">
          <h3 class="card-title">Hóa Đơn Chờ Thanh Toán</h3>
          <div class="table-responsive" style="max-height: 300px;">
            <table class="table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Kỳ hóa đơn</th>
                  <th>Tổng tiền</th>
                  <th>Đã đóng</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in unpaidInvoiceList" :key="invoice.id">
                  <td style="font-weight: 600;">Phong {{ invoice.contract.room.roomNumber }}</td>
                  <td style="font-size: 0.85rem;">
                    {{ formatDate(invoice.billingPeriodStart) }} - {{ formatDate(invoice.billingPeriodEnd) }}
                  </td>
                  <td style="font-weight: 600; color: var(--danger-color);">{{ formatMoney(invoice.totalAmount) }}</td>
                  <td>{{ formatMoney(invoice.paidAmount) }}</td>
                </tr>
                <tr v-if="unpaidInvoiceList.length === 0">
                  <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">
                    Không có hóa đơn nợ!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script src="./LandlordDashboard.js"></script>
