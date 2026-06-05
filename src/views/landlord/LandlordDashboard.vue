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
          <span class="welcome-greeting">{{ greeting }}</span>
          <h1 class="welcome-title">Tổng Quan Hệ Thống</h1>
          <p class="welcome-subtitle">Thống kê hoạt động kinh doanh phòng trọ của bạn</p>
        </div>
        <div class="welcome-date-badge">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {{ currentDate }}
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card card-indigo">
          <div class="stat-icon-wrap icon-indigo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Dãy trọ</span>
            <h2 class="stat-value">{{ stats.boardingHousesCount }}</h2>
            <span class="stat-detail">Đang quản lý</span>
          </div>
        </div>

        <div class="stat-card card-blue">
          <div class="stat-icon-wrap icon-blue">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Tổng phòng trọ</span>
            <h2 class="stat-value">{{ stats.roomsCount }}</h2>
            <span class="stat-detail">Đang thuê {{ stats.occupiedRooms }} · Trống {{ stats.vacantRooms }}</span>
          </div>
        </div>

        <div class="stat-card card-emerald">
          <div class="stat-icon-wrap icon-emerald">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Hợp đồng hoạt động</span>
            <h2 class="stat-value">{{ stats.activeContracts }}</h2>
            <span class="stat-detail">Có người ở</span>
          </div>
        </div>

        <div class="stat-card card-rose">
          <div class="stat-icon-wrap icon-rose">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Hóa đơn chưa đóng</span>
            <h2 class="stat-value">{{ stats.unpaidInvoicesCount }}</h2>
            <span class="stat-detail stat-detail-rose">Nợ {{ formatMoney(stats.unpaidAmount) }} đ</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Performance Grid -->
      <div class="dashboard-middle-grid" style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; margin-bottom: 1.5rem;">
        <!-- Occupancy Performance Card -->
        <div class="card middle-card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 1.5rem;">
          <div>
            <h3 class="section-title" style="margin-bottom: 0.25rem;">Hiệu Suất Cho Thuê</h3>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Tỷ lệ phòng có người ở trong toàn bộ hệ thống</p>
          </div>
          <div style="text-align: center; margin: 1rem 0;">
            <div class="occupancy-percentage-glowing">
              {{ occupancyRate }}%
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem; font-weight: 500;">
              Phòng đã được cho thuê
            </div>
          </div>
          <div style="width: 100%;">
            <div class="progress-bar-container">
              <div :style="{ width: occupancyRate + '%' }" class="progress-bar-fill"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary); font-weight: 500;">
              <span>{{ stats.occupiedRooms }} phòng đang ở</span>
              <span>{{ stats.roomsCount }} tổng phòng</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions Panel -->
        <div class="card middle-card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 1.5rem;">
          <div>
            <h3 class="section-title" style="margin-bottom: 0.25rem;">Thao Tác Nhanh</h3>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 1.5rem;">Truy cập nhanh các chức năng quản trị chính</p>
          </div>
          <div class="quick-actions-grid">
            <div @click="navigateTo('/landlord/boarding-houses')" class="quick-action-item">
              <div class="quick-action-icon bg-indigo-light">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div class="quick-action-info">
                <span class="quick-action-title">Cấu hình Dãy trọ</span>
                <span class="quick-action-desc">Quản lý khu trọ & đơn giá dịch vụ</span>
              </div>
            </div>

            <div @click="navigateTo('/landlord/rooms')" class="quick-action-item">
              <div class="quick-action-icon bg-blue-light">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <div class="quick-action-info">
                <span class="quick-action-title">Quản Lý Phòng Trọ</span>
                <span class="quick-action-desc">Tạo phòng, cài đặt số điện nước đầu</span>
              </div>
            </div>

            <div @click="navigateTo('/landlord/contracts')" class="quick-action-item">
              <div class="quick-action-icon bg-emerald-light">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div class="quick-action-info">
                <span class="quick-action-title">Hợp Đồng Thuê</span>
                <span class="quick-action-desc">Ký kết hợp đồng, thiết lập dịch vụ</span>
              </div>
            </div>

            <div @click="navigateTo('/landlord/invoices')" class="quick-action-item">
              <div class="quick-action-icon bg-warning-light">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div class="quick-action-info">
                <span class="quick-action-title">Lập Hóa Đơn Tháng</span>
                <span class="quick-action-desc">Ghi số điện nước, thu tiền phòng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Tables -->
      <div class="grid grid-cols-2" style="gap: 1rem;">
        <!-- Phòng trống -->
        <div class="card detail-card" style="margin-bottom: 0;">
          <div class="section-header">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; color: var(--primary-color);"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 class="section-title">Danh sách phòng trống</h3>
            </div>
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
                  <td style="text-align: right; font-weight: 600;">{{ formatMoney(room.basePrice) }} đ</td>
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
        <div class="card detail-card" style="margin-bottom: 0;">
          <div class="section-header">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; color: #dc2626;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h3 class="section-title">Hóa đơn chờ thanh toán</h3>
            </div>
            <span class="section-badge section-badge-red">{{ unpaidInvoiceList.length }}</span>
          </div>
          <div class="table-responsive" style="border: none; box-shadow: none; border-radius: 0;">
            <table class="table">
              <thead>
                <tr>
                  <th>Phòng</th>
                  <th>Kỳ hóa đơn</th>
                  <th style="text-align: right;">Tổng cộng</th>
                  <th style="text-align: right;">Đã đóng</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in unpaidInvoiceList" :key="invoice.id">
                  <td style="font-weight: 600;">Phòng {{ invoice.contract.room.roomNumber }}</td>
                  <td style="font-size: 0.8rem; color: var(--text-secondary);">
                    {{ formatDate(invoice.billingPeriodStart) }} – {{ formatDate(invoice.billingPeriodEnd) }}
                  </td>
                  <td style="text-align: right; font-weight: 600; color: var(--danger-color);">{{ formatMoney(invoice.totalAmount) }} đ</td>
                  <td style="text-align: right; color: var(--success-color); font-weight: 500;">{{ formatMoney(invoice.paidAmount) }} đ</td>
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
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.35), 0 8px 10px -6px rgba(59, 130, 246, 0.3);
  color: #ffffff;
  padding: 1.75rem 2.25rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.welcome-banner::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.welcome-greeting {
  display: block;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.9;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.welcome-title {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
  line-height: 1.25;
}

.welcome-subtitle {
  font-size: 0.9rem;
  opacity: 0.85;
  margin-top: 0.25rem;
}

.welcome-date-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-weight: 600;
  white-space: nowrap;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.5rem 1.25rem;
  box-shadow: var(--shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Custom left accent borders for stat cards */
.card-indigo { border-left: 4px solid #4f46e5; }
.card-blue { border-left: 4px solid #3b82f6; }
.card-emerald { border-left: 4px solid #10b981; }
.card-rose { border-left: 4px solid #f43f5e; }

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-wrap svg {
  width: 24px;
  height: 24px;
}

.icon-indigo { background: rgba(79, 70, 229, 0.1); color: #4f46e5; }
.icon-blue   { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.icon-emerald { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.icon-rose   { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  font-size: 0.725rem;
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.15;
  margin-top: 0.1rem;
}

.stat-detail {
  font-size: 0.775rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-detail-rose {
  color: #f43f5e;
  font-weight: 600;
}

/* Occupancy Circular/Bar styles */
.occupancy-percentage-glowing {
  font-size: 3.5rem;
  font-weight: 900;
  color: #3b82f6;
  line-height: 1;
  text-shadow: 0 0 12px rgba(59, 130, 246, 0.15);
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.progress-bar-container {
  height: 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 0.625rem;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #3b82f6);
  border-radius: 99px;
  transition: width 0.75s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}

/* Quick Actions layout */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  height: 100%;
  align-content: center;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.015);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-action-item:hover {
  background: var(--card-bg);
  transform: translateY(-3px);
  border-color: #3b82f6;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
}

.quick-action-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-action-icon svg {
  width: 22px;
  height: 22px;
}

.bg-indigo-light { background: rgba(79, 70, 229, 0.08); color: #4f46e5; }
.bg-blue-light   { background: rgba(59, 130, 246, 0.08); color: #3b82f6; }
.bg-emerald-light { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.bg-warning-light { background: rgba(245, 158, 11, 0.08); color: #f59e0b; }

.quick-action-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.quick-action-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.1rem;
}

.quick-action-desc {
  font-size: 0.725rem;
  color: var(--text-secondary);
  line-height: 1.2;
}

/* Cards customization */
.middle-card, .detail-card {
  border-radius: 16px;
  box-shadow: var(--shadow);
  transition: box-shadow 0.25s ease;
}

.middle-card:hover, .detail-card:hover {
  box-shadow: var(--shadow-md);
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.75rem;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 700;
  background-color: #eff6ff;
  color: #3b82f6;
  padding: 0 0.5rem;
}

.section-badge-red {
  background-color: #fef2f2;
  color: #ef4444;
}

@media (max-width: 1024px) {
  .dashboard-middle-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .welcome-banner {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  .welcome-date-badge {
    align-self: flex-start;
  }
  .grid-cols-2 {
    grid-template-columns: 1fr !important;
  }
}
</style>
