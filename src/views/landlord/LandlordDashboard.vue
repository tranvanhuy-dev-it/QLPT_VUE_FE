<template>
  <div class="dashboard-page">
    <!-- Loading -->
    <div v-if="loading" class="loading-container" style="margin-bottom: 2rem;">
      <div class="spinner"></div>
      <span>Đang tải thông tin thống kê...</span>
    </div>

    <template v-else>
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <h1 class="welcome-title">Tổng Quan Hệ Thống</h1>
          <p class="welcome-subtitle">Thống kê hoạt động kinh doanh phòng trọ của bạn</p>
        </div>
        <div class="welcome-date">
          {{ currentDate }}
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card stat-blue">
          <div class="stat-icon-wrap stat-icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Dãy trọ</span>
            <h2 class="stat-value">{{ stats.boardingHousesCount }}</h2>
          </div>
        </div>

        <div class="stat-card stat-slate">
          <div class="stat-icon-wrap stat-icon-slate">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Tổng phòng trọ</span>
            <h2 class="stat-value">{{ stats.roomsCount }}</h2>
            <span class="stat-detail">Đang thuê {{ stats.occupiedRooms }} · Trống {{ stats.vacantRooms }}</span>
          </div>
        </div>

        <div class="stat-card stat-green">
          <div class="stat-icon-wrap stat-icon-green">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Hợp đồng hoạt động</span>
            <h2 class="stat-value">{{ stats.activeContracts }}</h2>
          </div>
        </div>

        <div class="stat-card stat-red">
          <div class="stat-icon-wrap stat-icon-red">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Hóa đơn chưa đóng</span>
            <h2 class="stat-value">{{ stats.unpaidInvoicesCount }}</h2>
            <span class="stat-detail stat-detail-red">Nợ {{ formatMoney(stats.unpaidAmount) }} VNĐ</span>
          </div>
        </div>
      </div>

      <!-- Detail Tables -->
      <div class="grid grid-cols-2">
        <!-- Phòng trống -->
        <div class="card" style="margin-bottom: 0;">
          <div class="section-header">
            <h3 class="section-title">Phòng trống</h3>
            <span class="section-badge">{{ vacantRoomList.length }}</span>
          </div>
          <div class="table-responsive" style="border: none; box-shadow: none; border-radius: 0;">
            <table class="table">
              <thead>
                <tr>
                  <th>Số phòng</th>
                  <th>Dãy trọ</th>
                  <th style="text-align: right;">Giá thuê</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in vacantRoomList" :key="room.id">
                  <td style="font-weight: 600; color: var(--primary-color);">Phòng {{ room.roomNumber }}</td>
                  <td>{{ room.boardingHouse.name }}</td>
                  <td style="text-align: right; font-weight: 500;">{{ formatMoney(room.basePrice) }} đ</td>
                </tr>
                <tr v-if="vacantRoomList.length === 0">
                  <td colspan="3" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    Tất cả phòng đều đã có người thuê
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Hóa đơn nợ -->
        <div class="card" style="margin-bottom: 0;">
          <div class="section-header">
            <h3 class="section-title">Hóa đơn chờ thanh toán</h3>
            <span class="section-badge section-badge-red">{{ unpaidInvoiceList.length }}</span>
          </div>
          <div class="table-responsive" style="border: none; box-shadow: none; border-radius: 0;">
            <table class="table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Kỳ hóa đơn</th>
                  <th style="text-align: right;">Tổng tiền</th>
                  <th style="text-align: right;">Đã đóng</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in unpaidInvoiceList" :key="invoice.id">
                  <td style="font-weight: 600;">Phòng {{ invoice.contract.room.roomNumber }}</td>
                  <td style="font-size: 0.85rem;">
                    {{ formatDate(invoice.billingPeriodStart) }} – {{ formatDate(invoice.billingPeriodEnd) }}
                  </td>
                  <td style="text-align: right; font-weight: 600; color: var(--danger-color);">{{ formatMoney(invoice.totalAmount) }} đ</td>
                  <td style="text-align: right; color: var(--success-color);">{{ formatMoney(invoice.paidAmount) }} đ</td>
                </tr>
                <tr v-if="unpaidInvoiceList.length === 0">
                  <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    Không có hóa đơn nợ — Tuyệt vời!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script src="./LandlordDashboard.js"></script>

<style scoped>
/* Welcome Banner */
.welcome-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
  color: #ffffff;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  margin-bottom: 1.25rem;
}

.welcome-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.welcome-subtitle {
  font-size: 0.85rem;
  opacity: 0.85;
}

.welcome-date {
  font-size: 0.85rem;
  opacity: 0.8;
  font-weight: 500;
  white-space: nowrap;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1.25rem 1rem;
  box-shadow: var(--shadow);
  transition: box-shadow 0.2s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-wrap svg {
  width: 22px;
  height: 22px;
}

.stat-icon-blue  { background: #dbeafe; color: #2563eb; }
.stat-icon-slate { background: #f1f5f9; color: #475569; }
.stat-icon-green { background: #d1fae5; color: #059669; }
.stat-icon-red   { background: #fee2e2; color: #dc2626; }

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin-top: 0.15rem;
}

.stat-detail {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.stat-detail-red {
  color: var(--danger-color);
  font-weight: 600;
}

/* Section header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: #e6f0ff;
  color: var(--primary-color);
  padding: 0 0.5rem;
}

.section-badge-red {
  background-color: #fee2e2;
  color: #dc2626;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .welcome-banner {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
