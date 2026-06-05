<template>
  <aside style="width: 260px; background-color: var(--card-bg); border-right: 1px solid var(--border-color); padding: 1.5rem; display: flex; flex-direction: column; min-height: 100vh;">
    <!-- Brand Title -->
    <div style="margin-bottom: 2rem;">
      <h3 style="color: var(--primary-color); font-weight: 700; margin-bottom: 0.25rem;">QLPT MANAGER</h3>
      <p style="font-size: 0.8rem; color: var(--text-secondary);">Hệ thống Quản lý Phòng trọ</p>
    </div>

    <!-- Navigation Links based on Role -->
    <nav style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
      <!-- Landlord Navigation -->
      <template v-if="role === 'LANDLORD'">
        <router-link to="/landlord" class="nav-item">Tổng Quan</router-link>
        <router-link to="/landlord/boarding-houses" class="nav-item">Quản Lý Dãy Trọ</router-link>
        <router-link to="/landlord/rooms" class="nav-item">Quản Lý Phòng Trọ</router-link>
        <router-link to="/landlord/tenants" class="nav-item">Tài Khoản Người Thuê</router-link>
        <router-link to="/landlord/contracts" class="nav-item">Hợp Đồng Thuê</router-link>
        <router-link to="/landlord/invoices" class="nav-item">Hóa Đơn & Thanh Toán</router-link>
      </template>

      <!-- Tenant Navigation -->
      <template v-if="role === 'TENANT'">
        <router-link to="/tenant" class="nav-item">Thông Tin Phòng Trọ</router-link>
      </template>
    </nav>

    <!-- User Profile & Logout -->
    <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: auto;">
      <div style="margin-bottom: 1rem; font-size: 0.9rem;">
        <div style="font-weight: 600; color: var(--text-primary);">{{ username }}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">
          {{ role === 'LANDLORD' ? 'Chủ Trọ' : 'Người Thuê' }}
        </div>
      </div>
      <button @click="handleLogout" class="btn btn-outline" style="width: 100%; font-size: 0.9rem;">
        Đăng Xuất
      </button>
    </div>
  </aside>
</template>

<script src="./Sidebar.js"></script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
}
.nav-item:hover {
  background-color: rgba(79, 70, 229, 0.05);
  color: var(--primary-color);
  text-decoration: none;
}
.router-link-active {
  background-color: rgba(79, 70, 229, 0.1) !important;
  color: var(--primary-color) !important;
  font-weight: 600;
}
</style>
