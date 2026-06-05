<template>
  <aside class="app-sidebar">
    <!-- Brand Header -->
    <div class="sidebar-header">
      <div class="brand-logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.47 3.822a.75.75 0 011.06 0l8.69 8.69a.75.75 0 11-1.06 1.06L12 5.06l-8.16 8.16a.75.75 0 01-1.06-1.06l8.69-8.69z" />
          <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
        </svg>
      </div>
      <div class="brand-info">
        <h3 class="brand-name">QLPT Manager</h3>
        <p class="brand-subtitle">Quản lý nhà trọ thông minh</p>
      </div>
    </div>

    <!-- Quick Search -->
    <div class="sidebar-search">
      <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" v-model="searchQuery" class="search-input" placeholder="Tìm kiếm nhanh..." />
    </div>

    <!-- Menu Items based on Role -->
    <nav class="sidebar-nav">
      <!-- Landlord Navigation -->
      <template v-if="role === 'LANDLORD'">
        <div class="menu-group-label" v-if="filteredLandlordGeneral.length > 0">TỔNG QUAN</div>
        <router-link 
          v-for="item in filteredLandlordGeneral" 
          :key="item.to" 
          :to="item.to" 
          class="nav-item"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>

        <div class="menu-group-label" v-if="filteredLandlordManage.length > 0">QUẢN LÝ</div>
        <router-link 
          v-for="item in filteredLandlordManage" 
          :key="item.to" 
          :to="item.to" 
          class="nav-item"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </template>

      <!-- Tenant Navigation -->
      <template v-if="role === 'TENANT'">
        <div class="menu-group-label" v-if="filteredTenantGeneral.length > 0">DỊCH VỤ CƯ DÂN</div>
        <router-link 
          v-for="item in filteredTenantGeneral" 
          :key="item.to" 
          :to="item.to" 
          class="nav-item"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
      </template>
    </nav>

    <!-- Footer Profile -->
    <div class="sidebar-footer">
      <div class="footer-avatar">
        <span>{{ userInitial }}</span>
      </div>
      <div class="footer-user-info">
        <div class="user-fullname">{{ username || 'Chủ trọ' }}</div>
        <div class="user-role">{{ roleLabel }}</div>
      </div>
      <button class="footer-action-btn" title="Cài đặt tài khoản">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
        </svg>
      </button>
    </div>
  </aside>
</template>

<script src="./Sidebar.js"></script>

<style scoped>
.app-sidebar {
  width: var(--sidebar-width);
  background-color: var(--card-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem 1.25rem 1.25rem;
}

.brand-logo {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background-color: var(--primary-color);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo svg {
  width: 20px;
  height: 20px;
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.sidebar-search {
  margin: 0 1.25rem 1.25rem 1.25rem;
  position: relative;
}

.sidebar-search .search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: var(--text-secondary);
}

.sidebar-search .search-input {
  width: 100%;
  padding: 0.45rem 1rem 0.45rem 2.25rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background-color: #f9fafb;
  color: var(--text-primary);
  font-size: 0.8rem;
  outline: none;
}

.sidebar-search .search-input:focus {
  background-color: #ffffff;
  border-color: var(--primary-color);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-group-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-secondary);
  padding: 1rem 0.75rem 0.35rem 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #f3f4f6;
  text-decoration: none;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  width: 1.15rem;
  height: 1.15rem;
}

.nav-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.nav-item:hover .nav-icon {
  color: var(--primary-color);
}

.router-link-active {
  background-color: #e6f0ff !important;
  color: var(--primary-color) !important;
  font-weight: 600;
  border-left-color: var(--primary-color);
}

.router-link-active .nav-icon {
  color: var(--primary-color) !important;
}

.sidebar-footer {
  border-top: 1px solid var(--border-color);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #f9fafb;
}

.footer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background-color: #e0f2fe;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.footer-user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.user-fullname {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.footer-action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.footer-action-btn:hover {
  background-color: #e5e7eb;
  color: var(--text-primary);
}

.footer-action-btn svg {
  width: 1.1rem;
  height: 1.1rem;
}
</style>
